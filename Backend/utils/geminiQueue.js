// Rate limiter for Gemini calls, supporting multiple API keys.
// Each key belongs to a different Google Cloud project, so each one has
// its OWN separate daily/per-minute quota — that's why each key gets its
// own independent queue instead of sharing one. Calls alternate between
// keys round-robin so both quota pools fill up evenly instead of draining
// one key first.

const MAX_CONCURRENT = 3;   // per key — safe under free-tier RPM given ~14s/call
const MIN_GAP_MS = 4500;    // per key — safety floor between call starts

function createQueue() {
  let running = 0;
  let lastStart = 0;
  let scheduled = false;
  const queue = [];

  function scheduleNext() {
    if (scheduled) return;
    if (running >= MAX_CONCURRENT || queue.length === 0) return;
    scheduled = true;
    const wait = Math.max(0, MIN_GAP_MS - (Date.now() - lastStart));

    setTimeout(() => {
      scheduled = false;
      if (queue.length === 0 || running >= MAX_CONCURRENT) {
        scheduleNext();
        return;
      }
      const { task, resolve, reject } = queue.shift();
      running++;
      lastStart = Date.now();
      task().then(resolve, reject).finally(() => { running--; scheduleNext(); });
      scheduleNext();
    }, wait);
  }

  function enqueue(task) {
    return new Promise((resolve, reject) => {
      queue.push({ task, resolve, reject });
      scheduleNext();
    });
  }

  return { enqueue };
}

// Collect whichever keys are actually set in .env — works with 1 key too,
// so nothing breaks if GEMINI_API_KEY_2 isn't configured yet.
const keys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(
  (k) => k && k.trim()
);

if (keys.length === 0) {
  throw new Error("No Gemini API keys found. Set GEMINI_API_KEY in .env.");
}

const queues = keys.map(() => createQueue());
let nextIndex = 0;

// Returns the next key + its matching queue, round-robin style.
function getNextKeyedQueue() {
  const index = nextIndex % keys.length;
  nextIndex++;
  return { apiKey: keys[index], queue: queues[index] };
}

module.exports = { getNextKeyedQueue };