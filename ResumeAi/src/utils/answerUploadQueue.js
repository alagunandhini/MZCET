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
  };

  await withStore("readwrite", (store) => store.put(record));

  const ok = await attemptUpload({ apiUrl, token, record });
  return { success: ok, willRetry: !ok };
}

async function attemptUpload({ apiUrl, token, record }) {
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

    if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error("Upload responded without success");

    await withStore("readwrite", (store) => store.delete(record.id));
    return true;
  } catch (err) {
    console.error("Answer upload failed, will retry later:", err);
    await withStore("readwrite", (store) => {
      record.retryCount += 1;
      store.put(record);
    });
    return false;
  }
}

async function getAllPending() {
  return withStore("readonly", (store) => {
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }).then((p) => p);
}

export async function hasPendingUploads() {
  const pending = await getAllPending();
  return pending.length > 0;
}

export async function flushPendingUploads({ apiUrl, token }) {
  const pending = await getAllPending();
  for (const record of pending) {
    const backoffMs = Math.min(30000, 2000 * 2 ** record.retryCount) + Math.random() * 1000;
    const dueAt = record.createdAt + backoffMs * record.retryCount;
    if (record.retryCount > 0 && Date.now() < dueAt) continue;

    await attemptUpload({ apiUrl, token, record });
  }
  return getAllPending().then((p) => p.length);
}

export function startBackgroundSync({ apiUrl, token, intervalMs = 5000 }) {
  const tick = () => flushPendingUploads({ apiUrl, token });
  const intervalId = setInterval(tick, intervalMs);
  const onlineHandler = () => tick();
  window.addEventListener("online", onlineHandler);

  return () => {
    clearInterval(intervalId);
    window.removeEventListener("online", onlineHandler);
  };
}