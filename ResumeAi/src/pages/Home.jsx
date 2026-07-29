import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Menu,
  X,
  Mic,
  FileText,
  Brain,
  Layers,
  ArrowLeft,
  ArrowRight,
  Upload,
  MessageSquare,
  BarChart3,
  Star,
  Globe,
  MessageCircle,
  Share2,
  Check,
  User,
  LogOut,
  Bot,
  Clock,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

const BLUE = "#0EA5E9";
const BLUE_DARK = "#0284C7";
const BLUE_LIGHT = "#E0F2FE";
const INK = "#0F172A";
const SLATE = "#64748B";
const BORDER = "#E2E8F0";
const BG = "#F8FAFC";
const GREEN = "#16A34A";
const GREEN_BG = "#DCFCE7";
const AMBER = "#D97706";
const RED = "#DC2626";

const display = { fontFamily: "'Sora', system-ui, sans-serif" };
const body = { fontFamily: "'Inter', system-ui, sans-serif" };

function FontLoader() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      .glow-blob { filter: blur(60px); }
      @media (prefers-reduced-motion: reduce) {
        * { animation-duration: 0.01ms !important; }
      }
    `}</style>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const staggerContainer = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const viewport = { once: true, amount: 0.2 };

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
    <header className="sticky top- z-50 w-full " >
      <nav
        className="mx-auto flex items-center justify-between  border bg-white/95 px-25 py-3 shadow-lg shadow-slate-200/60 backdrop-blur-md"
        style={{ borderColor: BORDER }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.href = "http://localhost:3011/home.html"}
            className="inline-flex items-center justify-center rounded-full border p-2 transition hover:bg-gray-100"
            style={{ borderColor: BORDER, color: INK }}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2.5">
            <img src="completed logo.png" alt="Mount Zion logo" className="h-9 w-9 scale-160 rounded-xl object-contain" />
            <span className="text-lg font-bold tracking-tight" style={{ ...display, color: INK }}>
              MZ<span style={{ color: BLUE }}>ResumeAI</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {token ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full bg-gray-100 py-1.5 pl-1.5 pr-3 shadow-sm transition hover:bg-gray-200"
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: BLUE }}
                >
                  {username ? username.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </span>
                {username && (
                  <span className="text-sm font-medium text-gray-600" style={body}>
                    {username}
                  </span>
                )}
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                />
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

function RoundPreviewCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: -2 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-sm rounded-3xl border p-5 shadow-2xl backdrop-blur-xl"
      style={{ borderColor: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.12)" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70" style={body}>
            Interview Dashboard
          </p>
          <p className="mt-0.5 text-sm font-bold text-white" style={display}>
            Round 2 · Technical Depth
          </p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: BLUE }}>
          <Bot className="h-5 w-5 text-white" />
        </span>
      </div>

      <div className="mt-4 rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.9)" }}>
        <div className="flex items-center justify-between">
          <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: BLUE_LIGHT, color: BLUE_DARK }}>
            Ready
          </span>
          <span className="text-xs font-semibold" style={{ ...body, color: SLATE }}>2 attempts left</span>
        </div>
        <div className="mt-3 space-y-1.5 text-xs" style={{ ...body, color: SLATE }}>
          <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Duration: <b style={{ color: INK }}>10 minutes</b></div>
          <div className="flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5" /> Questions: <b style={{ color: INK }}>15</b></div>
        </div>
        <button className="mt-3 w-full rounded-xl py-2 text-sm font-semibold text-white" style={{ background: BLUE }}>
          Start Round
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-white/80" style={body}>
        <RotateCcw className="h-3.5 w-3.5" style={{ color: "#FCA5A5" }} />
        Round 1 — <span className="font-semibold" style={{ color: "#FCA5A5" }}>Failed</span>, 0 attempts left
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="absolute -right-6 -top-6 flex items-center gap-1.5 rounded-2xl border bg-white px-3 py-2 shadow-lg"
        style={{ borderColor: BORDER }}
      >
        <Star className="h-4 w-4 fill-current" style={{ color: AMBER }} />
        <span className="text-sm font-bold" style={{ ...display, color: INK }}>320</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.75 }}
        className="absolute -bottom-7 -left-7 flex h-20 w-20 items-center justify-center rounded-full border bg-white shadow-lg"
        style={{ borderColor: BORDER }}
      >
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full" style={{ background: `conic-gradient(${BLUE} 68%, ${BORDER} 0)` }}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-xs font-bold" style={{ ...display, color: INK }}>
            68%
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Hero() {
  const navigate = useNavigate();
  return (
    <section
      className="relative flex min-h-[92vh] items-center overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: "url('/mzcet1.webp')",
        backgroundColor: INK,
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(115deg, ${INK}F2 0%, ${BLUE_DARK}CC 45%, ${INK}D9 100%)` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-2">
        <motion.div initial="hidden" animate="show" variants={staggerContainer}>
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold text-white"
            style={{ borderColor: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)", ...body }}
          >
            <Bot className="h-3.5 w-3.5" />
            Mount Zion - AI Interview Practice Platform
          </motion.span>

          <motion.h1 variants={fadeUp} className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl" style={display}>
            Confidence Begins
 <br className="hidden sm:block" />
            With Preparation <span style={{ color: "#7DD3FC" }}>Ace Every Interview.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-6 max-w-lg text-base leading-relaxed text-white/80" style={body}>
          Build confidence before your placement interviews. Upload your resume, answer personalized questions through voice recordings, and receive AI feedback to improve your communication and technical performance.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/resume")}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-105"
              style={{ background: BLUE, boxShadow: `0 12px 24px -8px ${BLUE}80`, ...body }}
            >
              Start Your Journey
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#report"
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.35)", ...body }}
            >
              See a Sample Report
            </a>
          </motion.div>

          <motion.p variants={fadeUp} className="mt-6 text-xs font-medium text-white/60" style={body}>
           Resume Analysis • 4 Interview Rounds • AI Feedback • Placement Ready
          </motion.p>
        </motion.div>

        <div className="flex justify-center lg:justify-end lg:pr-8">
          <RoundPreviewCard />
        </div>
      </div>
    </section>
  );
}

function TrustedBy() {
  const stats = [
    { value: "10,000+", label: "Questions generated" },
    { value: "4", label: "Interview rounds" },
    { value: "< 60 sec", label: "To your first score" },
  ];
  return (
    <section className="border-y" style={{ background: BG, borderColor: BORDER }}>
      <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={viewport} className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-4 sm:gap-x-0">
          {stats.map((s, i) => (
            <motion.div key={s.label} variants={fadeUp} className={`flex items-center gap-3 px-6 sm:px-10 ${i !== 0 ? "sm:border-l" : ""}`} style={{ borderColor: BORDER }}>
              <span className="text-xl font-extrabold sm:text-2xl" style={{ ...display, color: BLUE }}>{s.value}</span>
              <span className="text-sm font-medium" style={{ ...body, color: SLATE }}>{s.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <motion.span variants={fadeUp} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: BLUE_LIGHT, color: BLUE_DARK, ...body }}>
        {eyebrow}
      </motion.span>
      <motion.h2 variants={fadeUp} className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl" style={{ ...display, color: INK }}>
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p variants={fadeUp} className="mt-4 text-lg leading-relaxed" style={{ ...body, color: SLATE }}>
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

function Features() {
  const features = [
    { icon: FileText, title: "Resume-based questions", desc: "Upload your resume and our AI instantly writes questions tailored to your experience and target role." },
    { icon: Mic, title: "Voice mock interviews", desc: "Answer out loud with real-time recording. We transcribe and analyze your speech, tone, and pacing." },
    { icon: Brain, title: "Real-time AI feedback", desc: "Get confidence and clarity scores plus concrete suggestions to sharpen every answer instantly." },
    { icon: Layers, title: "Four interview rounds", desc: "Practice HR, Technical, Stress, and Scenario rounds so you're ready for any stage of the process." },
  ];
  return (
    <section id="features" className="bg-white py-20 sm:py-28">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={viewport} className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Features"
          title={<>Everything you need to <span style={{ color: BLUE }}>interview with confidence</span></>}
          subtitle="ResumeAI turns your resume into a personalized practice arena with AI coaching at every step."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="group rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-xl hover:shadow-sky-100"
              style={{ borderColor: BORDER }}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl transition" style={{ background: BLUE_LIGHT, color: BLUE_DARK }}>
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold" style={{ ...display, color: INK }}>{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ ...body, color: SLATE }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Upload, title: "Upload your resume", desc: "Drop in your PDF. Our AI reads your experience in seconds." },
    { icon: MessageSquare, title: "Practice with AI", desc: "Answer tailored questions out loud across four interview rounds, anytime." },
    { icon: BarChart3, title: "Get detailed feedback", desc: "Receive confidence and clarity scores, transcripts, and improvement tips." },
  ];
  return (
    <section id="how" className="py-20 sm:py-28" style={{ background: BG }}>
      <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={viewport} className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title={<>Three steps to <span style={{ color: BLUE }}>interview-ready</span></>}
          subtitle="From resume to refined answers in minutes — no coaching calls, no scheduling."
        />
        <div className="relative mt-14 grid gap-10 md:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px md:block" style={{ background: BORDER }} />
          {steps.map((s, i) => (
            <motion.div key={s.title} variants={fadeUp} className="relative flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border bg-white shadow-md shadow-sky-100" style={{ borderColor: BLUE_LIGHT, color: BLUE }}>
                <s.icon className="h-8 w-8" />
              </div>
              <span className="mt-4 text-xs font-bold uppercase tracking-widest" style={{ ...body, color: BLUE }}>Step {i + 1}</span>
              <h3 className="mt-2 text-xl font-bold" style={{ ...display, color: INK }}>{s.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed" style={{ ...body, color: SLATE }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function Stats() {
  const scores = [
    { label: "Confidence", value: 92 },
    { label: "Clarity", value: 88 },
  ];
  return (
    <section id="report" className="bg-white py-20 sm:py-28">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={viewport} className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="See your progress"
          title={<>A <span style={{ color: BLUE }}>sample feedback report</span></>}
          subtitle="After every mock interview, ResumeAI breaks down exactly how you did — and how to improve."
        />

        <motion.div variants={fadeUp} className="mx-auto mt-14 max-w-2xl rounded-3xl border bg-white p-8 shadow-xl shadow-slate-200/50" style={{ borderColor: BORDER }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide" style={{ ...body, color: SLATE }}>Technical Round Report</h3>
            <span className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: GREEN_BG, color: GREEN }}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
            </span>
          </div>

          <div className="mt-8 flex justify-center gap-10 sm:gap-16">
            {scores.map((s) => {
              const radius = 42;
              const circumference = 2 * Math.PI * radius;
              const offset = circumference - (s.value / 100) * circumference;
              return (
                <div key={s.label} className="flex flex-col items-center gap-2">
                  <div className="relative h-28 w-28">
                    <svg className="h-full w-full -rotate-90">
                      <circle cx="50%" cy="50%" r={radius} stroke={BORDER} strokeWidth="8" fill="transparent" />
                      <circle cx="50%" cy="50%" r={radius} stroke={BLUE} strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xl font-bold" style={{ ...display, color: INK }}>
                      {s.value}%
                    </div>
                  </div>
                  <span className="text-sm font-semibold" style={{ ...body, color: SLATE }}>{s.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl p-4" style={{ background: BLUE_LIGHT }}>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ ...body, color: BLUE_DARK }}>Key Improvement</p>
            <p className="mt-1 text-sm" style={{ ...body, color: INK }}>
              Great structure in your answers — try adding a specific example next time to make it even stronger.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { quote: "I went from stuttering through HR rounds to confidently handling stress questions. The AI feedback pinpointed exactly what to fix.", name: "Aisha Patel", role: "CS Senior, Stanford" },
    { quote: "ResumeAI generated technical questions straight from my resume. It felt like a real interview — minus the panic.", name: "Marcus Lee", role: "Bootcamp grad, Georgia Tech" },
    { quote: "The clarity score pushed me to slow down and structure my answers. I landed my dream offer at a FAANG company.", name: "Sofia Ramirez", role: "SWE Intern, Berkeley" },
  ];
  return (
    <section id="reviews" className="py-20 sm:py-28" style={{ background: BG }}>
      <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={viewport} className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Reviews"
          title={<>Loved by <span style={{ color: BLUE }}>ambitious candidates</span></>}
          subtitle="Thousands of students use ResumeAI to prepare smarter and interview calmer."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <motion.div key={t.name} variants={fadeUp} className="flex flex-col rounded-3xl border bg-white p-7 shadow-sm transition hover:shadow-lg" style={{ borderColor: BORDER }}>
              <div className="flex gap-0.5" style={{ color: AMBER }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 flex-1 text-base leading-relaxed" style={{ ...body, color: INK }}>"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: BLUE }}>
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-bold" style={{ ...body, color: INK }}>{t.name}</p>
                  <p className="text-xs" style={{ ...body, color: SLATE }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function Pricing() {
  const navigate = useNavigate();
  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "Everything you need to start practicing today.",
      features: ["1 resume upload", "HR round practice", "Basic AI feedback", "5 mock interviews / month"],
      cta: "Start Free",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      desc: "Unlimited practice with full AI coaching.",
      features: ["Unlimited resumes", "All 4 interview rounds", "Detailed feedback reports", "Unlimited mock interviews", "Priority support"],
      cta: "Go Pro",
      highlight: true,
    },
  ];
  return (
    <section id="pricing" className="py-20 sm:py-28" style={{ background: BG }}>
      <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={viewport} className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Pricing"
          title={<>Simple pricing, <span style={{ color: BLUE }}>serious results</span></>}
          subtitle="Start free and upgrade when you're ready to go all-in on interview prep."
        />

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          {tiers.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="relative rounded-3xl border bg-white p-8 transition"
              style={{ borderColor: t.highlight ? BLUE : BORDER, borderWidth: t.highlight ? 2 : 1, boxShadow: t.highlight ? `0 20px 40px -20px ${BLUE_LIGHT}` : undefined }}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-8 rounded-full px-3 py-1 text-xs font-semibold text-white shadow" style={{ background: BLUE, ...body }}>
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-bold" style={{ ...display, color: INK }}>{t.name}</h3>
              <p className="mt-1 text-sm" style={{ ...body, color: SLATE }}>{t.desc}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-4xl font-extrabold" style={{ ...display, color: INK }}>{t.price}</span>
                <span className="mb-1 text-sm" style={{ ...body, color: SLATE }}>/{t.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ ...body, color: INK }}>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: BLUE_LIGHT, color: BLUE_DARK }}>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/resume")}
                className="mt-8 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
                style={t.highlight ? { background: BLUE, color: "white", ...body, boxShadow: `0 12px 24px -10px ${BLUE}66` } : { border: `1px solid ${BORDER}`, color: INK, ...body }}
              >
                {t.cta}
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp} className="relative mt-16 overflow-hidden rounded-3xl px-6 py-14 text-center shadow-xl sm:px-12" style={{ background: `linear-gradient(120deg, ${BLUE}, ${BLUE_DARK})` }}>
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-white blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-white blur-3xl" />
          </div>
          <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl" style={display}>
            Ready to land your dream job?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-base text-sky-50" style={body}>
            Start practicing today and walk into your next interview with total confidence.
          </p>
          <button
            onClick={() => navigate("/resume")}
            className="relative mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-base font-semibold shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            style={{ color: BLUE_DARK, ...body }}
          >
            Start practicing today
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Footer() {
  const columns = [
    { title: "Product", links: ["Features", "Pricing", "Reviews", "Changelog"] },
    { title: "Company", links: ["About", "Careers", "Blog", "Contact"] },
    { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
  ];
  return (
    <footer className="border-t bg-white" style={{ borderColor: BORDER }}>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: BLUE }}>
                <Bot className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold tracking-tight" style={{ ...display, color: INK }}>
                Resume<span style={{ color: BLUE }}>AI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed" style={{ ...body, color: SLATE }}>
              AI-powered mock interviews that turn your resume into confident, interview-ready answers.
            </p>
            <div className="mt-5 flex gap-3">
              {[Globe, MessageCircle, Share2].map((Icon, i) => (
                <Link key={i} to="/" aria-label="social link" className="flex h-9 w-9 items-center justify-center rounded-xl border transition hover:bg-sky-50" style={{ borderColor: BORDER, color: SLATE }}>
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {columns.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-bold" style={{ ...display, color: INK }}>{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <Link to="/" className="text-sm transition hover:text-slate-900" style={{ ...body, color: SLATE }}>{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row" style={{ borderColor: BORDER }}>
          <p className="text-xs" style={{ ...body, color: SLATE }}>© {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
          <p className="text-xs" style={{ ...body, color: SLATE }}>Built with ♥ for ambitious candidates.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white" style={body}>
      <FontLoader />
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <Stats />
        
      </main>
      <Footer />
    </div>
  );
}