// answerUploadQueue.js
//
// Saves every answer locally (IndexedDB) before uploading, so a failed
// upload never loses the answer. Retries happen in the background.

const DB_NAME = "interviewAnswerQueue";
const DB_VERSION = 1;
const STORE_NAME = "pendingAnswers";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const result = fn(store);
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
  });
}

function makeId({ sessionId, round, questionIndex }) {
  return `${sessionId}::${round}::${questionIndex}`;
}

// Prevents two overlapping retry loops (startBackgroundSync's interval and
// waitForQueueToDrain's own loop) from both calling attemptUpload for the
// SAME record at the same time.
const inFlight = new Set();



export async function saveAndUpload({
  apiUrl,
  token,
  audioBlob,
  question,
  sessionId,
  round,
  questionIndex,
  mimeType,
}) {
  const id = makeId({ sessionId, round, questionIndex });
  const record = {
    id,
    audioBlob,
    question,
    sessionId,
    round,
    questionIndex,
    mimeType,
    status: "pending",
    retryCount: 0,
    createdAt: Date.now(),
    lastAttemptAt: Date.now(),
  };

  await withStore("readwrite", (store) => store.put(record));

  const ok = await attemptUpload({ apiUrl, token, record });
  return { success: ok, willRetry: !ok };
}

async function attemptUpload({ apiUrl, token, record }) {
  if (inFlight.has(record.id)) {
    // Another loop is already mid-attempt on this exact record — skip
    // instead of firing a second concurrent POST for the same answer.
    return false;
  }
  inFlight.add(record.id);

  try {
    const formData = new FormData();
    formData.append("audio", record.audioBlob, "answer.webm");
    formData.append("question", record.question);
    formData.append("sessionId", record.sessionId);
    formData.append("round", record.round);
    formData.append("mimeType", record.mimeType);
    formData.append("questionIndex", record.questionIndex);

    const res = await fetch(`${apiUrl}/upload-audio`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      // 4xx (other than auth/timeout/rate-limit, which can be transient)
      // means the server permanently rejected this request. Retrying that
      // forever would otherwise block round finalization indefinitely, so
      // it's marked "failed" instead of "pending". 5xx and network errors
      // (caught below) stay "pending" and keep retrying.
      const isPermanent =
        res.status >= 400 && res.status < 500 &&
        res.status !== 401 && res.status !== 408 && res.status !== 429;
      throw new Error(`Upload failed with status ${res.status}`, {
        cause: isPermanent ? "permanent" : "retryable",
      });
    }
    const data = await res.json();
    if (!data.success) throw new Error("Upload responded without success");

    await withStore("readwrite", (store) => store.delete(record.id));
    return true;
  } catch (err) {
    console.error("Answer upload failed:", err);
    const isPermanent = err.cause === "permanent";
    record.retryCount += 1;
    record.status = isPermanent ? "failed" : "pending";
    record.lastAttemptAt = Date.now();
    await withStore("readwrite", (store) => {
      store.put(record);
    });
    return false;
  } finally {
    inFlight.delete(record.id);
  }
}

async function getAllPending(sessionId) {
  const all = await withStore("readonly", (store) => {
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  });
  return sessionId ? all.filter((r) => r.sessionId === sessionId) : all;
}

export async function hasPendingUploads({ sessionId } = {}) {
  const pending = await getAllPending(sessionId);
  return pending.some((r) => r.status !== "failed");
}

export async function getFailedUploads(sessionId) {
  const pending = await getAllPending(sessionId);
  return pending.filter((r) => r.status === "failed");
}
export async function flushPendingUploads({ apiUrl, token, sessionId }) {
  const pending = await getAllPending(sessionId);
  for (const record of pending) {
    if (record.status === "failed") continue; // permanent — don't retry forever
    if (inFlight.has(record.id)) continue; // already being retried by the other loop

    // Exponential backoff measured from the LAST attempt, not from
    // creation time multiplied by retryCount (the old formula could
    // balloon into minutes once retryCount climbed, causing the record
    // to look "stuck" even after you were back online).
    if (record.retryCount > 0) {
      const backoffMs = Math.min(30000, 2000 * 2 ** (record.retryCount - 1)) + Math.random() * 1000;
      const dueAt = (record.lastAttemptAt || record.createdAt) + backoffMs;
      if (Date.now() < dueAt) continue;
    }

    await attemptUpload({ apiUrl, token, record });
  }
  const stillPending = await getAllPending(sessionId);
  return stillPending.filter((r) => r.status !== "failed").length;
}
export function startBackgroundSync({ apiUrl, token, sessionId, intervalMs = 5000 }) {
  const tick = () => flushPendingUploads({ apiUrl, token, sessionId });
  const intervalId = setInterval(tick, intervalMs);
  const onlineHandler = () => tick();
  window.addEventListener("online", onlineHandler);

  return () => {
    clearInterval(intervalId);
    window.removeEventListener("online", onlineHandler);
  };
}