import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Sparkles,
  Menu,
  X,
  Mic,
  FileText,
  Brain,
  Layers,
  ArrowRight,
  Play,
  Upload,
  MessageSquare,
  BarChart3,
  Star,
  Globe,
  MessageCircle,
  Share2,
  Check,
  User,
  ChevronDown,
  LogOut,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Shared animation variants                                                  */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const viewport = { once: true, amount: 0.2 };

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

/* -------------------------------------------------------------------------- */
/*  Announcement Banner                                                        */
/* -------------------------------------------------------------------------- */

function AnnouncementBanner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="relative w-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 text-white">
      {/* <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2.5 text-center text-sm font-medium">
        <span>🎉 New: AI-powered feedback reports are here →</span>
        <a
          href="#features"
          className="hidden underline-offset-2 hover:underline sm:inline-flex"
        >
          Learn more
        </a>
        <button
          onClick={() => setOpen(false)}
          aria-label="Dismiss announcement"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 transition hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div> */}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Navbar                                                                     */
/* -------------------------------------------------------------------------- */

function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const links = [
    { label: "Home", to: "/" },
    { label: "Resume", to: "/resume" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Logo (left) */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Resume<span className="text-sky-500">AI</span>
          </span>
        </Link>

        {/* Links + Profile/Actions (grouped right) */}
        <div className="flex items-center gap-8">
          <div className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                {l.label}
              </Link>
            ))}
          </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {token ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 transition hover:border-sky-200 hover:bg-sky-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white">
                  {username ? username.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {username || "Profile"}
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <>
                  {/* click-away overlay */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                    <div className="flex flex-col items-center text-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-xl font-bold text-white">
                        {username ? username.charAt(0).toUpperCase() : <User className="h-6 w-6" />}
                      </span>
                      <p className="mt-2 text-sm font-bold text-slate-900">
                        {username || "User"}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
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
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                Login
              </Link>
              <button
                onClick={() => navigate("/resume")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-md"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-slate-700 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2">
              {token ? (
                <>
                  <div className="flex flex-col items-center rounded-xl border border-slate-200 py-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-lg font-bold text-white">
                      {username ? username.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                    </span>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {username || "User"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700"
                  >
                    Login
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/resume");
                    }}
                    className="rounded-xl bg-sky-500 px-4 py-2 text-center text-sm font-semibold text-white"
                  >
                    Get Started Free
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                       */
/* -------------------------------------------------------------------------- */

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute left-0 top-60 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:py-28">
        {/* Copy */}
        <div className="text-center md:text-left">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700"
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered interview prep
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
          >
            
            <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
              AI-powered
            </span>{" "}
            practice
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-600 md:mx-0"
          >
            Upload your resume and get mock
            interviews across HR, Technical, Stress, and Scenario rounds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:justify-start"
          >
            <button
              onClick={() => navigate("/resume")}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-xl sm:w-auto"
            >
              Start Free Practice
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
            </button>
            <a
              href="#how"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-base font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md sm:w-auto"
            >
              <Play className="h-5 w-5 text-sky-500" />
              Watch Demo
            </a>
          </motion.div>

          
        </div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md md:max-w-none"
        >
          <div className="relative flex items-center justify-center py-10">
            {/* Soft glow circle behind image */}
            <div className="absolute h-72 w-72 rounded-full bg-gradient-to-br from-sky-200 to-blue-200 blur-3xl" />

            <motion.img
              src="/3d blue.png"
              alt="ResumeAI mascot"
              className="relative h-64 w-64 object-contain drop-shadow-xl sm:h-72 sm:w-72"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Floating stat: Confidence */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute -left-2 top-6 rounded-xl border border-slate-100 bg-white px-4 py-2.5 shadow-lg sm:left-4"
            >
              <p className="text-[11px] text-slate-500">Confidence</p>
              <p className="text-lg font-bold text-sky-500">92%</p>
            </motion.div>

            {/* Floating stat: Clarity */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="absolute -right-2 top-16 rounded-xl border border-slate-100 bg-white px-4 py-2.5 shadow-lg sm:right-4"
            >
              <p className="text-[11px] text-slate-500">Clarity</p>
              <p className="text-lg font-bold text-blue-500">88%</p>
            </motion.div>

            {/* Floating badge: AI Feedback */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="absolute bottom-4 left-1/2 max-w-[220px] -translate-x-1/2 rounded-xl border border-slate-100 bg-white px-4 py-2.5 text-center shadow-lg"
            >
              <p className="text-[11px] text-slate-500">AI Feedback</p>
              <p className="text-xs font-semibold text-slate-900">
                Great structure! Add an example.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Trusted By                                                                 */
/* -------------------------------------------------------------------------- */

function TrustedBy() {
  const stats = [
    { value: "10,000+", label: "Questions generated" },
    { value: "4", label: "Interview rounds" },
    { value: "AI-powered", label: "Feedback in seconds" },
  ];
  return (
    <section className="border-y border-slate-100 bg-slate-50/60">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-4 sm:gap-x-0">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeIn}
              className={`flex items-center gap-3 px-6 sm:px-10 ${
                i !== 0 ? "sm:border-l sm:border-slate-200" : ""
              }`}
            >
              <span className="text-xl font-extrabold text-sky-500 sm:text-2xl">
                {s.value}
              </span>
              <span className="text-sm font-medium text-slate-500">
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section heading helper                                                     */
/* -------------------------------------------------------------------------- */

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <motion.span
        variants={fadeUp}
        className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700"
      >
        {eyebrow}
      </motion.span>
      <motion.h2
        variants={fadeUp}
        className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          className="mt-4 text-lg leading-relaxed text-slate-600"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Features                                                                   */
/* -------------------------------------------------------------------------- */

function Features() {
  const features = [
    {
      icon: FileText,
      title: "Resume-based questions",
      desc: "Upload your resume and our AI instantly generates questions tailored to your experience and target role.",
    },
    {
      icon: Mic,
      title: "Voice mock interviews",
      desc: "Answer out loud with real-time recording. We transcribe and analyze your speech, tone, and pacing.",
    },
    {
      icon: Brain,
      title: "Real-time AI feedback",
      desc: "Get confidence and clarity scores plus concrete suggestions to sharpen every answer instantly.",
    },
    {
      icon: Layers,
      title: "Four interview rounds",
      desc: "Practice HR, Technical, Stress, and Scenario rounds so you're ready for any stage of the process.",
    },
  ];
  return (
    <section id="features" className="py-20 sm:py-28">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto max-w-7xl px-4 sm:px-6"
      >
        <SectionHeading
          eyebrow="Features"
          title={
            <>
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
                interview with confidence
              </span>
            </>
          }
          subtitle="ResumeAI turns your resume into a personalized practice arena with AI coaching at every step."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 text-sky-600 transition group-hover:from-sky-400 group-hover:to-blue-600 group-hover:text-white">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  How It Works                                                               */
/* -------------------------------------------------------------------------- */

function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "Upload your resume",
      desc: "Drop in your PDF or LinkedIn profile. Our AI reads your experience in seconds.",
    },
    {
      icon: MessageSquare,
      title: "Practice with AI",
      desc: "Answer tailored questions out loud across four interview rounds, anytime.",
    },
    {
      icon: BarChart3,
      title: "Get detailed feedback",
      desc: "Receive confidence and clarity scores, transcripts, and improvement tips.",
    },
  ];
  return (
    <section id="how" className="bg-slate-50/70 py-20 sm:py-28">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto max-w-7xl px-4 sm:px-6"
      >
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              Three steps to{" "}
              <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
                interview-ready
              </span>
            </>
          }
          subtitle="From resume to refined answers in minutes — no coaching calls, no scheduling."
        />

        <div className="relative mt-14 grid gap-10 md:grid-cols-3">
          {/* connecting line */}
          <div className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-sky-200 via-blue-200 to-sky-200 md:block" />
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              variants={fadeUp}
              className="relative flex flex-col items-center text-center"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-sky-100 bg-white text-sky-600 shadow-md shadow-sky-100">
                <s.icon className="h-8 w-8" />
              </div>
              <span className="mt-4 text-xs font-bold uppercase tracking-widest text-sky-500">
                Step {i + 1}
              </span>
              <h3 className="mt-2 text-xl font-bold text-slate-900">
                {s.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-600">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stats                                                                      */
/* -------------------------------------------------------------------------- */

function Stats() {
  const scores = [
    { label: "Confidence", value: 92, color: "#38bdf8" },
    { label: "Clarity", value: 88, color: "#6366f1" },
  ];

  return (
    <section className="py-20 sm:py-28">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto max-w-7xl px-4 sm:px-6"
      >
        <SectionHeading
          eyebrow="See your progress"
          title={
            <>
              A{" "}
              <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
                sample feedback report
              </span>
            </>
          }
          subtitle="After every mock interview, ResumeAI breaks down exactly how you did — and how to improve."
        />

        <motion.div
          variants={fadeUp}
          className="mx-auto mt-14 max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400">
              Technical Round Report
            </h3>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              Completed
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
                      <circle cx="50%" cy="50%" r={radius} stroke="#e2e8f0" strokeWidth="8" fill="transparent" />
                      <circle
                        cx="50%" cy="50%" r={radius}
                        stroke={s.color} strokeWidth="8" fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-900">
                      {s.value}%
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-500">{s.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl bg-sky-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-sky-600">Key Improvement</p>
            <p className="mt-1 text-sm text-slate-700">
              Great structure in your answers — try adding a specific example next time to make it even stronger.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
/* -------------------------------------------------------------------------- */
/*  Testimonials                                                               */
/* -------------------------------------------------------------------------- */

function Testimonials() {
  const items = [
    {
      quote:
        "I went from stuttering through HR rounds to confidently handling stress questions. The AI feedback pinpointed exactly what to fix.",
      name: "Aisha Patel",
      role: "CS Senior, Stanford",
    },
    {
      quote:
        "ResumeAI generated technical questions straight from my resume. It felt like a real interview — minus the panic.",
      name: "Marcus Lee",
      role: "Bootcamp grad, Georgia Tech",
    },
    {
      quote:
        "The clarity score pushed me to slow down and structure my answers. I landed my dream offer at a FAANG company.",
      name: "Sofia Ramirez",
      role: "SWE Intern, Berkeley",
    },
  ];
  return (
    <section id="reviews" className="py-20 sm:py-28">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto max-w-7xl px-4 sm:px-6"
      >
        <SectionHeading
          eyebrow="Reviews"
          title={
            <>
              Loved by{" "}
              <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
                ambitious candidates
              </span>
            </>
          }
          subtitle="Thousands of students use ResumeAI to prepare smarter and interview calmer."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              className="flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:shadow-lg"
            >
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 flex-1 text-base leading-relaxed text-slate-700">
                "{t.quote}"
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-bold text-white">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pricing / CTA                                                              */
/* -------------------------------------------------------------------------- */

function Pricing() {
  const navigate = useNavigate();

  const tiers = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "Everything you need to start practicing today.",
      features: [
        "1 resume upload",
        "HR round practice",
        "Basic AI feedback",
        "5 mock interviews / month",
      ],
      cta: "Start Free",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      desc: "Unlimited practice with full AI coaching.",
      features: [
        "Unlimited resumes",
        "All 4 interview rounds",
        "Detailed feedback reports",
        "Unlimited mock interviews",
        "Priority support",
      ],
      cta: "Go Pro",
      highlight: true,
    },
  ];
  return (
    <section id="pricing" className="bg-slate-50/70 py-20 sm:py-28">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        className="mx-auto max-w-7xl px-4 sm:px-6"
      >
        <SectionHeading
          eyebrow="Pricing"
          title={
            <>
              Simple pricing,{" "}
              <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
                serious results
              </span>
            </>
          }
          subtitle="Start free and upgrade when you're ready to go all-in on interview prep."
        />

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          {tiers.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              className={`relative rounded-3xl border p-8 transition ${
                t.highlight
                  ? "border-sky-300 bg-white shadow-xl shadow-sky-100"
                  : "border-slate-200 bg-white shadow-sm hover:shadow-md"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-8 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 px-3 py-1 text-xs font-semibold text-white shadow">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-bold text-slate-900">{t.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{t.desc}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-4xl font-extrabold text-slate-900">
                  {t.price}
                </span>
                <span className="mb-1 text-sm text-slate-500">
                  /{t.period}
                </span>
              </div>
              <ul className="mt-6 space-y-3">
                {t.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/resume")}
                className={`mt-8 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${
                  t.highlight
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 hover:shadow-xl"
                    : "border border-slate-300 text-slate-700 hover:border-slate-400 hover:shadow-md"
                }`}
              >
                {t.cta}
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Closing CTA banner */}
        <motion.div
          variants={fadeUp}
          className="relative mt-16 overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-6 py-14 text-center shadow-xl sm:px-12"
        >
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-white blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-white blur-3xl" />
          </div>
          <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to land your dream job?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-base text-sky-50">
            Start practicing today and walk into your next interview with
            total confidence.
          </p>
          <button
            onClick={() => navigate("/resume")}
            className="relative mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-base font-semibold text-sky-600 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Start practicing today
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                     */
/* -------------------------------------------------------------------------- */

function Footer() {
  const columns = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Reviews", "Changelog"],
    },
    {
      title: "Company",
      links: ["About", "Careers", "Blog", "Contact"],
    },
    {
      title: "Legal",
      links: ["Privacy", "Terms", "Security", "Cookies"],
    },
  ];
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Resume<span className="text-sky-500">AI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              AI-powered mock interviews that turn your resume into confident,
              interview-ready answers.
            </p>
            <div className="mt-5 flex gap-3">
              {[Globe, MessageCircle, Share2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social link"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-slate-500 transition hover:text-slate-900"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} ResumeAI. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Built with ♥ for ambitious candidates.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Home (default export)                                                      */
/* -------------------------------------------------------------------------- */

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <AnnouncementBanner />
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Features />
        <HowItWorks />
        <Stats />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
