import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  ClipboardList,
  ArrowRight,
  Upload,
  MessageSquare,
  BarChart3,
  Sparkles,
  ShieldAlert,
  FileCheck,
  Loader2,
  LogOut,
  ChevronDown,
} from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/* -------------------------------------------------------------------------- */
/* Design Tokens                                                              */
/* -------------------------------------------------------------------------- */
const BLUE = "#0EA5E9";
const BLUE_DARK = "#0284C7";
const BLUE_LIGHT = "#F0F9FF";
const INK = "#0F172A";
const SLATE = "#64748B";
const BORDER = "#E2E8F0";
const BG = "#F8FAFC";
const GREEN = "#16A34A";
const GREEN_BG = "#F0FDF4";

const display = { fontFamily: "'Sora', system-ui, sans-serif" };
const body = { fontFamily: "'Inter', system-ui, sans-serif" };

function FontLoader() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      .field:focus { outline: none; border-color: ${BLUE}; box-shadow: 0 0 0 4px #E0F2FE; }
      .dropzone-active { border-color: ${BLUE} !important; background: ${BLUE_LIGHT} !important; }
      @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } }
    `}</style>
  );
}

/* -------------------------------------------------------------------------- */
/* Single Combined Navbar                                                     */
/* -------------------------------------------------------------------------- */
function Navbar() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const token = localStorage.getItem("token");
  const rawUsername = localStorage.getItem("username");
  const username = rawUsername ? rawUsername.replace(/^"|"$/g, "") : rawUsername;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const initials = username
    ? username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const steps = [
    { icon: Upload, label: "Upload Resume" },
    { icon: MessageSquare, label: "Mock Interview" },
    { icon: BarChart3, label: "Get Feedback" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md" style={{ borderColor: BORDER }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl font-extrabold text-white text-sm" style={{ background: BLUE, ...display }}>
            MZ
          </div>
          <span className="text-base font-bold tracking-tight hidden sm:inline-block" style={{ ...display, color: INK }}>
            Resume<span style={{ color: BLUE }}>AI</span>
          </span>
        </Link>

        {/* Integrated Step Progress Tracker */}
        <div className="flex items-center gap-3 md:gap-6">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shadow-sm"
                style={
                  i === 0
                    ? { background: BLUE, color: "white" }
                    : { background: "white", color: SLATE, border: `1px solid ${BORDER}` }
                }
              >
                <s.icon className="h-4 w-4" />
              </span>
              <span
                className="hidden text-xs font-semibold md:inline-block"
                style={{ color: i === 0 ? INK : SLATE }}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className="h-px w-4 sm:w-8 bg-slate-200" />
              )}
            </div>
          ))}
        </div>

        {/* Profile Dropdown / Auth */}
        {token ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 rounded-full border p-1 pr-3 transition hover:bg-slate-50"
              style={{ borderColor: BORDER }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full font-semibold text-white text-xs" style={{ background: BLUE_DARK }}>
                {initials}
              </div>
              <span className="max-w-[100px] truncate text-xs font-semibold sm:max-w-none" style={{ color: INK }}>
                {username || "User"}
              </span>
              <ChevronDown className="h-3.5 w-3.5" style={{ color: SLATE }} />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div
                  className="absolute right-0 z-20 mt-2 w-48 rounded-xl border bg-white p-1 shadow-lg"
                  style={{ borderColor: BORDER }}
                >
                  <div className="border-b px-3 py-2 text-xs" style={{ borderColor: BORDER }}>
                    <p className="font-semibold" style={{ color: INK }}>Signed in as</p>
                    <p className="truncate text-slate-500">{username || "User"}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 mt-1"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-white transition hover:brightness-105"
            style={{ background: BLUE }}
          >
            Log in
          </button>
        )}

      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
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

  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);

  const readPdf = async (file) => {
    setParsing(true);
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
      } catch (err) {
        console.error("PDF Parsing Error:", err);
        showToast?.("Error parsing PDF. Ensure it's not password protected.", "error");
      } finally {
        setParsing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (!uploadedFile) return;

    if (uploadedFile.type === "application/pdf") {
      setFile(uploadedFile);
      readPdf(uploadedFile);
    } else {
      alert("Please upload a standard PDF file.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

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

    setTransitionText("Analyzing profile & generating interview questions...");
    setTransitionLoading(true);

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
        setQuestions(parsedQuestions);
        setTransitionLoading(false);
        setShowQuestionsUI(true);
      } else {
        throw new Error(data.message || "Failed to analyze resume");
      }
    } catch (error) {
      console.error(error);
      setTransitionLoading(false);
      setLoading?.(false);
      alert("Something went wrong while generating questions. Please try again.");
    }
  };

  return (
    <>
      <FontLoader />
      <div className="min-h-screen flex flex-col" style={{ background: BG, ...body }}>
        
        {/* Single Responsive Navbar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
              
              {/* LEFT — Guidelines Side Card */}
              <div className="lg:col-span-4">
                <div
                  className="rounded-2xl border bg-white p-6 shadow-sm"
                  style={{ borderColor: BORDER }}
                >
                  <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: BORDER }}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: BLUE_LIGHT, color: BLUE_DARK }}>
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold" style={{ ...display, color: INK }}>
                        MZ Resume AI
                      </h2>
                      <p className="text-xs" style={{ color: SLATE }}>Mock Interview Assistant</p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mt-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: SLATE }}>
                      How it Works
                    </h3>
                    <ol className="mt-3 flex flex-col gap-3 text-xs leading-relaxed" style={{ color: INK }}>
                      <li className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600 text-[11px]">1</span>
                        <span>Upload your PDF resume with your technical experience.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600 text-[11px]">2</span>
                        <span>Optionally paste a target job description for customized questions.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600 text-[11px]">3</span>
                        <span>Generate questions and begin your practice session.</span>
                      </li>
                    </ol>
                  </div>

                  <hr className="my-5" style={{ borderColor: BORDER }} />

                  {/* Key Rules */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: SLATE }}>
                      Important Notes
                    </h3>
                    <div className="mt-3 flex flex-col gap-2.5 text-xs" style={{ color: SLATE }}>
                      <div className="flex items-start gap-2">
                        <FileCheck className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: BLUE }} />
                        <span>Accepts text-selectable PDF resumes only.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: BLUE }} />
                        <span>Re-uploading resets active session data.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT — Interactive Form */}
              <div className="lg:col-span-8">
                <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8" style={{ borderColor: BORDER }}>
                  
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ ...display, color: INK }}>
                      Upload your resume
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: SLATE }}>
                      Our AI will analyze your skills and projects to build tailored interview questions.
                    </p>
                  </div>

                  {/* Dropzone Area */}
                  <div
                    {...getRootProps()}
                    className={`mt-6 flex min-h-[180px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all ${
                      isDragActive ? "dropzone-active" : "hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                    style={{
                      borderColor: isDragActive ? BLUE : BORDER,
                      background: isDragActive ? BLUE_LIGHT : "white",
                    }}
                  >
                    <input {...getInputProps()} />
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: BLUE_LIGHT, color: BLUE_DARK }}>
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <p className="mt-3 text-sm font-semibold" style={{ ...display, color: INK }}>
                      {isDragActive ? "Drop your resume here" : "Click to upload or drag & drop"}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: SLATE }}>
                      PDF documents only (up to 10MB)
                    </p>
                  </div>

                  {/* File Upload Status Card */}
                  {file && (
                    <div
                      className="mt-4 flex items-center justify-between rounded-xl border p-4 transition-all"
                      style={{
                        borderColor: parsing ? BORDER : "#BBF7D0",
                        background: parsing ? BG : GREEN_BG,
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm" style={{ color: parsing ? SLATE : GREEN }}>
                          {parsing ? <Loader2 className="h-5 w-5 animate-spin text-sky-500" /> : <FileText className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold" style={{ color: INK }}>{file.name}</p>
                          <p className="text-xs font-medium" style={{ color: parsing ? SLATE : GREEN }}>
                            {parsing ? "Extracting resume text..." : "Resume parsed and ready"}
                          </p>
                        </div>
                      </div>
                      {!parsing && <CheckCircle2 className="h-5 w-5 flex-shrink-0" style={{ color: GREEN }} />}
                    </div>
                  )}

                  {/* Job Description Area */}
                  <div className="mt-6">
                    <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold" style={{ color: INK }}>
                      <ClipboardList className="h-4 w-4" style={{ color: BLUE_DARK }} />
                      Job Description
                      <span className="text-xs font-normal text-slate-400">(Optional)</span>
                    </label>
                    <textarea
                      rows={4}
                      maxLength={8000}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the target job description here to tailor questions to the specific role..."
                      className="field w-full resize-none rounded-xl border px-4 py-3 text-sm transition"
                      style={{ borderColor: BORDER, color: INK }}
                    />
                  </div>

                  {/* Submit Action */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={analyzeInterview}
                      disabled={parsing || !resumeText}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
                      style={{ background: BLUE }}
                    >
                      Generate Questions
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ResumeUpload;