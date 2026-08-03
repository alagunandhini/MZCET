// Shared rate limiter for every Gemini call in the app (question
// generation + answer evaluation both use this same queue).
// Keeps us under Gemini's free-tier ~15 requests/minute limit even when
// many students hit "upload resume" or "submit answer" at the same time —
// requests queue and run in order instead of everyone getting a 429.

const MAX_CONCURRENT = 2;   // at most 2 Gemini calls in flight at once
const MIN_GAP_MS = 4500;    // don't start a new call sooner than this

let running = 0;
let lastStart = 0;
let scheduled = false;      // guards against scheduling more than one dispatch timer at once
const queue = [];

function scheduleNext() {
  if (scheduled) return;                          // a dispatch is already pending — don't double-schedule
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

    task().then(resolve, reject).finally(() => {
      running--;
      scheduleNext();
    });

    scheduleNext(); // try to fill the second concurrent slot too
  }, wait);
}

function enqueue(task) {
  return new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    scheduleNext();
  });
}

module.exports = { enqueue };