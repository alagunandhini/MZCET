import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {GraduationCap } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import {
  ArrowLeft,
  UploadCloud,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  ClipboardList,
  User,
  LogOut,
} from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/* -------------------------------------------------------------------------- */
/*  Design tokens — unchanged from the reference design                      */
/* -------------------------------------------------------------------------- */

const BLUE = "#0EA5E9";
const BLUE_DARK = "#0284C7";
const BLUE_LIGHT = "#E0F2FE";
const INK = "#0F172A";
const SLATE = "#64748B";
const BORDER = "#E2E8F0";
const BG = "#F8FAFC";
const GREEN = "#16A34A";
const RED = "#DC2626";
const RED_BG = "#FEE2E2";

const display = { fontFamily: "'Sora', system-ui, sans-serif" };
const body = { fontFamily: "'Inter', system-ui, sans-serif" };

function FontLoader() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      @media (prefers-reduced-motion: reduce) {
        * { animation-duration: 0.01ms !important; }
      }
    `}</style>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const staggerContainer = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

/* -------------------------------------------------------------------------- */
/*  Navbar — unchanged from the reference design                             */
/* -------------------------------------------------------------------------- */

function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const rawUsername = localStorage.getItem("username");
  const username = rawUsername ? rawUsername.replace(/^"|"$/g, "") : rawUsername;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav
        className="mx-auto flex max-w-10xl items-center justify-between border bg-white/95 px-6 py-3 shadow-lg shadow-slate-200/60 backdrop-blur-md"
        style={{ borderColor: BORDER }}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <img src="completed logo.png" alt="Mount Zion logo" className="h-9 w-9 scale-160 rounded-xl object-contain" />
          <span className="text-lg font-bold tracking-tight" style={{ ...display, color: INK }}>
            MZ<span style={{ color: BLUE }}>ResumeAI</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {token ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm transition hover:opacity-90"
                style={{ background: BLUE }}
              >
                {username ? username.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border bg-white p-4 shadow-xl" style={{ borderColor: BORDER }}>
                    <div className="flex flex-col items-center text-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white" style={{ background: BLUE }}>
                        {username ? username.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
                      </span>
                      <p className="mt-2 text-sm font-bold" style={{ ...body, color: INK }}>{username || "User"}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                      style={{ borderColor: BORDER, ...body }}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:inline-block"
                style={body}
              >
                Login
              </Link>
              <button
                onClick={() => navigate("/resume")}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:-translate-y-0.5 hover:brightness-105"
                style={{ background: BLUE, ...body }}
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step rail — unchanged from the reference design                          */
/* -------------------------------------------------------------------------- */

function StepRail({ step }) {
  const steps = ["Upload", "Analyze", "Confirm", "Practice"];
  return (
    <div className="mx-auto flex w-full max-w-md items-center justify-between">
      {steps.map((label, i) => {
        const index = i + 1;
        const isDone = index < step;
        const isActive = index === step;
        return (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors"
                style={{
                  background: isDone ? GREEN : isActive ? BLUE : "white",
                  color: isDone || isActive ? "white" : SLATE,
                  border: isDone || isActive ? "none" : `1.5px solid ${BORDER}`,
                }}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : index}
              </div>
              <span className="text-[11px] font-semibold" style={{ ...body, color: isActive ? INK : SLATE }}>
                {label}
              </span>
            </div>
            {index !== steps.length && (
              <div
                className="mx-1 mb-4 h-[2px] flex-1 rounded-full transition-colors"
                style={{ background: isDone ? GREEN : BORDER }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cartoon illustration — unchanged from the reference design               */
/* -------------------------------------------------------------------------- */

function ResumeIllustration() {
  return (
    <motion.div variants={fadeUp} className="relative mx-auto w-full max-w-xs lg:max-w-sm">
      <svg viewBox="0 0 360 360" className="w-full" xmlns="http://www.w3.org/2000/svg">
        <circle cx="180" cy="180" r="150" fill={BLUE_LIGHT} />

        <circle cx="55" cy="80" r="7" fill="#D97706" opacity="0.8" />
        <circle cx="305" cy="270" r="9" fill={GREEN} opacity="0.8" />
        <circle cx="300" cy="70" r="5" fill={BLUE} opacity="0.7" />

        <g transform="translate(95,60)">
          <rect x="0" y="0" width="150" height="200" rx="14" fill="white" stroke={BORDER} strokeWidth="3" />
          <path d="M110 0 L150 0 L150 40 Z" fill={BLUE_LIGHT} />
          <path d="M110 0 L150 40 L110 40 Z" fill="none" stroke={BORDER} strokeWidth="2" />

          <circle cx="35" cy="42" r="18" fill={BLUE_LIGHT} stroke={BLUE} strokeWidth="2.5" />
          <circle cx="35" cy="37" r="7" fill={BLUE} />
          <path d="M20 54 Q35 40 50 54" fill="none" stroke={BLUE} strokeWidth="3" strokeLinecap="round" />

          <rect x="66" y="30" width="70" height="8" rx="4" fill={INK} opacity="0.85" />
          <rect x="66" y="44" width="50" height="6" rx="3" fill={SLATE} opacity="0.6" />

          <rect x="16" y="80" width="118" height="6" rx="3" fill={BORDER} />
          <rect x="16" y="96" width="100" height="6" rx="3" fill={BORDER} />
          <rect x="16" y="112" width="110" height="6" rx="3" fill={BORDER} />

          <rect x="16" y="136" width="60" height="18" rx="9" fill={BLUE_LIGHT} />
          <rect x="82" y="136" width="52" height="18" rx="9" fill="#F0FDF4" />

          <rect x="16" y="168" width="90" height="6" rx="3" fill={BORDER} />
          <rect x="16" y="182" width="70" height="6" rx="3" fill={BORDER} />
        </g>

        <g transform="translate(210,205)">
          <ellipse cx="35" cy="95" rx="42" ry="34" fill={BLUE} />
          <circle cx="35" cy="38" r="34" fill="#FDE9D9" />
          <path d="M2 34 Q10 -2 35 4 Q62 -4 68 34 Q50 20 35 22 Q20 20 2 34 Z" fill={INK} />
          <circle cx="24" cy="40" r="3.2" fill={INK} />
          <circle cx="46" cy="40" r="3.2" fill={INK} />
          <path d="M22 50 Q35 60 48 50" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="16" cy="47" r="4" fill="#F6A889" opacity="0.6" />
          <circle cx="54" cy="47" r="4" fill="#F6A889" opacity="0.6" />
          <path d="M70 90 Q95 75 92 48" fill="none" stroke={BLUE} strokeWidth="14" strokeLinecap="round" />
          <circle cx="92" cy="44" r="10" fill="#FDE9D9" />
        </g>

        <g transform="translate(232,18)" opacity="0.95">
          <rect x="-6" y="-6" width="76" height="76" rx="20" fill="white" stroke={BORDER} strokeWidth="2" />
          <path
            d="M10 44c-7 0-12-5-12-12 0-6 4-11 10-12 2-8 9-13 17-13 9 0 16 6 18 14 6 1 10 6 10 12 0 7-5 12-12 12H10z"
            fill={BLUE_LIGHT}
            transform="translate(6,6) scale(0.9)"
          />
          <path d="M32 20 v18 M24 28 l8-8 8 8" fill="none" stroke={BLUE_DARK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" transform="translate(6,6)" />
        </g>
      </svg>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Job description field — unchanged from the reference design              */
/* -------------------------------------------------------------------------- */

function JobDescriptionField({ value, onChange }) {
  return (
    <motion.div variants={fadeUp} className="rounded-3xl border bg-white p-6 shadow-sm" style={{ borderColor: BORDER }}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ background: BLUE_LIGHT, color: BLUE_DARK }}>
          <ClipboardList className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold" style={{ ...display, color: INK }}>Job description</h3>
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: BG, color: SLATE, ...body }}>
              Optional
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed" style={{ ...body, color: SLATE }}>
            Paste the Job Description for better response
          </p>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            maxLength={8000}
            placeholder="e.g. “Full stack developer , Data Analyst”"
            className="mt-3 w-full resize-none rounded-2xl border p-3.5 text-sm outline-none transition focus:ring-2"
            style={{ borderColor: BORDER, ...body, color: INK }}
            onFocus={(e) => (e.target.style.borderColor = BLUE)}
            onBlur={(e) => (e.target.style.borderColor = BORDER)}
          />
          <p className="mt-1.5 text-right text-[11px]" style={{ ...body, color: SLATE }}>{value.length}/8000</p>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dropzone — same visuals as the reference design, restricted to PDF only  */
/*  to match the real client-side parser (pdfjs can only read PDFs)          */
/* -------------------------------------------------------------------------- */

function Dropzone({ onFile }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (fileList) => {
      const file = fileList?.[0];
      if (!file) return;
      if (file.type !== "application/pdf") {
        alert("Please upload a standard PDF file.");
        return;
      }
      onFile(file);
    },
    [onFile]
  );

  return (
    <motion.div
      variants={fadeUp}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className="group relative cursor-pointer rounded-3xl border-2 border-dashed px-6 py-14 text-center transition"
      style={{
        borderColor: dragging ? BLUE : BORDER,
        background: dragging ? BLUE_LIGHT : "white",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition group-hover:-translate-y-0.5"
        style={{ background: BLUE_LIGHT, color: BLUE_DARK }}
      >
        <UploadCloud className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-lg font-bold" style={{ ...display, color: INK }}>
        {dragging ? "Drop it right here" : "Drag & drop your resume"}
      </h3>
      <p className="mt-1.5 text-sm" style={{ ...body, color: SLATE }}>
        or <span style={{ color: BLUE_DARK, fontWeight: 600 }}>browse from your computer</span>
      </p>
      <p className="mt-4 text-xs font-medium" style={{ ...body, color: SLATE }}>
        PDF documents only · up to 10&nbsp;MB
      </p>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Selected file card — same visuals as the reference design, but its       */
/*  states now reflect the real pipeline: client-side PDF text extraction,   */
/*  then the live /analyze request                                           */
/* -------------------------------------------------------------------------- */

function FileCard({ file, status, errorMessage, onRemove, onAnalyze }) {
  const sizeLabel =
    file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(file.size / 1024))} KB`;

  const busy = status === "parsing" || status === "analyzing";

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="rounded-3xl border bg-white p-6 shadow-sm"
      style={{ borderColor: BORDER }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: BLUE_LIGHT, color: BLUE_DARK }}
          >
            <FileText className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold" style={{ ...display, color: INK }}>
              {file.name}
            </p>
            <p className="mt-0.5 text-xs" style={{ ...body, color: SLATE }}>
              {sizeLabel}
            </p>
          </div>
        </div>
        {!busy && (
          <button
            onClick={onRemove}
            aria-label="Remove file"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {status === "parsing" && (
        <p className="mt-5 flex items-center gap-1.5 text-xs font-medium" style={{ ...body, color: BLUE_DARK }}>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Extracting text from your resume…
        </p>
      )}

      {status === "analyzing" && (
        <p className="mt-5 flex items-center gap-1.5 text-xs font-medium" style={{ ...body, color: BLUE_DARK }}>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Generating interview questions…
        </p>
      )}

      {status === "parsed" && (
        <p className="mt-5 flex items-center gap-1.5 text-xs font-semibold" style={{ ...body, color: GREEN }}>
          <CheckCircle2 className="h-3.5 w-3.5" />
          Resume parsed and ready
        </p>
      )}

      {status === "error" && (
        <div className="mt-4 rounded-xl p-3 text-xs font-medium" style={{ background: RED_BG, color: RED, ...body }}>
          {errorMessage || "Something went wrong reading that file. Try a different PDF."}
        </div>
      )}

      {status === "parsed" && (
        <button
          onClick={onAnalyze}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:-translate-y-0.5 hover:brightness-105"
          style={{ background: BLUE, ...body }}
        >
          Generate Questions
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

const ResumeUpload = ({
  setQuestions,
  setShowQuestionsUI,
  showToast,
  setTransitionLoading,
  setTransitionText,
  setLoading,
}) => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | parsing | parsed | analyzing | error
  const [errorMessage, setErrorMessage] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const step = !file ? 1 : status === "analyzing" ? 3 : 2;

  /* ---- real PDF text extraction, straight from the working parser ---- */
  const readPdf = (pdfFile) => {
    setStatus("parsing");
    setErrorMessage("");
    const reader = new FileReader();

    reader.onload = async function () {
      try {
        const array = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument({ data: array }).promise;
        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item) => item.str);
          text += strings.join(" ") + " ";
        }

        setResumeText(text);
        setStatus("parsed");
      } catch (err) {
        console.error("PDF Parsing Error:", err);
        setStatus("error");
        setErrorMessage("Error parsing PDF. Ensure it's not password protected.");
        showToast?.("Error parsing PDF. Ensure it's not password protected.", "error");
      }
    };

    reader.readAsArrayBuffer(pdfFile);
  };

  const handleFile = (f) => {
    setFile(f);
    setResumeText("");
    readPdf(f);
  };

  const handleRemove = () => {
    setFile(null);
    setResumeText("");
    setStatus("idle");
    setErrorMessage("");
  };

  /* ---- real /analyze call, unchanged logic from the working version ---- */
  const analyzeInterview = async () => {
    if (!resumeText) {
      alert("Please upload your resume first!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showToast?.("Please login to continue", "error");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    setStatus("analyzing");
    setTransitionText?.(" Generating interview questions...");
    setTransitionLoading?.(true);

    try {
      const response = await fetch("http://localhost:3007/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: resumeText,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const parsedQuestions = JSON.parse(data.analysis);
        setQuestions?.(parsedQuestions);
        setTransitionLoading?.(false);
        setShowQuestionsUI?.(true);
      } else {
        throw new Error(data.message || "Failed to analyze resume");
      }
    } catch (error) {
      console.error(error);
      setStatus("parsed");
      setTransitionLoading?.(false);
      setLoading?.(false);
      alert("Something went wrong while generating questions. Please try again.");
    }
  };

  return (
    <div className="min-h-screen" style={{ ...body, background: BG }}>
      <FontLoader />
        <Link
          to="/"
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border bg-white/80 px-4 py-4 text-sm font-semibold backdrop-blur-md transition hover:-translate-y-0.5 sm:left-6 sm:top-6"
          style={{ borderColor: BORDER, color: INK }}
        >
          <ArrowLeft  className="h-5 w-5" />
        </Link>
      
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* LEFT SIDE: Header text, Step rail, and Illustration */}
          <motion.div initial="hidden" animate="show" variants={staggerContainer} className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: BLUE_LIGHT, color: BLUE_DARK, ...body }}
            >
              Step {step} of 4
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl"
              style={{ ...display, color: INK }}
            >
              Let's start with your <span style={{ color: BLUE }}>resume</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-3 max-w-md text-base leading-relaxed" style={{ ...body, color: SLATE }}>
              We'll read your experience and build a mock interview that actually matches your background.
            </motion.p>

            <div className="mt-8 w-full max-w-md">
              <StepRail step={step} />
            </div>

            <div className="mt-10 w-full flex justify-center lg:justify-start">
              <ResumeIllustration />
            </div>
          </motion.div>

          {/* RIGHT SIDE: Job Description, Dropzone/Card, and Privacy Notice */}
          <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-5">
            <JobDescriptionField value={jobDescription} onChange={setJobDescription} />

            {!file && <Dropzone onFile={handleFile} />}

            <AnimatePresence mode="wait">
              {file && (
                <FileCard
                  key="file-card"
                  file={file}
                  status={status}
                  errorMessage={errorMessage}
                  onRemove={handleRemove}
                  onAnalyze={analyzeInterview}
                />
              )}
            </AnimatePresence>

            <motion.p variants={fadeUp} className="text-center text-xs" style={{ ...body, color: SLATE }}>
              Your resume is used only to generate interview questions and is never shared with third parties.
            </motion.p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ResumeUpload;