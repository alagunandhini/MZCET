import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, ArrowLeft, GraduationCap, ArrowRight } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Design tokens — shared with Home.jsx                                       */
/* -------------------------------------------------------------------------- */

const BLUE = "#0EA5E9";
const BLUE_DARK = "#0284C7";
const BLUE_LIGHT = "#E0F2FE";
const INK = "#0F172A";
const SLATE = "#64748B";
const BORDER = "#E2E8F0";
const BG = "#F8FAFC";

const display = { fontFamily: "'Sora', system-ui, sans-serif" };
const body = { fontFamily: "'Inter', system-ui, sans-serif" };

function FontLoader() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      .field:focus { outline: none; border-color: ${BLUE}; box-shadow: 0 0 0 4px ${BLUE_LIGHT}; }

      @keyframes backdropFade {
        from { opacity: 0; backdrop-filter: blur(0px); }
        to   { opacity: 1; backdrop-filter: blur(6px); }
      }
      @keyframes cardPop {
        0%   { opacity: 0; transform: scale(0.82) translateY(18px); }
        60%  { opacity: 1; transform: scale(1.03) translateY(-2px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes botFloat {
        0%, 100% { transform: translateY(0) rotate(-2deg); }
        50%      { transform: translateY(-10px) rotate(2deg); }
      }
      @keyframes ringPulse {
        0%   { transform: scale(0.9); opacity: 0.55; }
        70%  { transform: scale(1.35); opacity: 0; }
        100% { transform: scale(1.35); opacity: 0; }
      }
      @keyframes sparkleTwinkle {
        0%, 100% { opacity: 0.2; transform: scale(0.8); }
        50%      { opacity: 1; transform: scale(1.15); }
      }
      @keyframes textRise {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes dotBounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
        40%           { transform: translateY(-5px); opacity: 1; }
      }

      .welcome-backdrop { animation: backdropFade 0.35s ease-out forwards; }
      .welcome-card { animation: cardPop 0.55s cubic-bezier(.34,1.56,.64,1) forwards; }
      .welcome-bot { animation: botFloat 3.2s ease-in-out infinite; }
      .welcome-ring { animation: ringPulse 2.2s ease-out infinite; }
      .welcome-ring.delay { animation-delay: 1.1s; }
      .welcome-sparkle { animation: sparkleTwinkle 1.6s ease-in-out infinite; }
      .welcome-text { animation: textRise 0.5s ease-out 0.25s both; }
      .welcome-dot { animation: dotBounce 1s ease-in-out infinite; }

      @media (prefers-reduced-motion: reduce) {
        * { animation-duration: 0.01ms !important; }
        .welcome-bot { animation: none; }
      }
    `}</style>
  );
}

/* Animated "welcome back" card shown right after a successful login. */
function WelcomeOverlay({ name, onContinue }) {
  const firstName = (name || "").trim().split(" ")[0] || "there";

  return (
    <div
      className="welcome-backdrop fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: "rgba(15, 23, 42, 0.45)" }}
    >
      <div
        className="welcome-card relative w-full max-w-sm rounded-3xl border bg-white px-6 pb-6 pt-3 text-center shadow-2xl"
        style={{ borderColor: BORDER }}
      >
        <img
          src="completed logo.png"
          alt="Completed"
          className=" mx-auto -mt-16 w-36 drop-shadow-md sm:w-44 md:-mt-24 md:w-52"
        />

        <div className="mt-1">
          <p
            className="welcome-text flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ color: BLUE_DARK }}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Mount Zion
          </p>

          <h1
            className="welcome-text mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl"
            style={{ ...display, color: INK }}
          >
            Welcome {firstName}!
          </h1>

          <p className="welcome-text mt-2 text-sm" style={{ color: SLATE }}>
            You're logged in. Ready to pick up where you left off?
          </p>

          <button
            onClick={onContinue}
            className="welcome-text mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-105"
            style={{ background: BLUE, boxShadow: `0 10px 20px -8px ${BLUE}80`, ...body }}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

const Login = () => {
  const [registerNumber, setRegisterNumber] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [welcome, setWelcome] = useState({ show: false, name: "", isFirstLogin: false, hasResume: false });
  const location = useLocation();

  useEffect(() => {
    if (location.state) {
      setRegisterNumber(location.state.registerNumber || "");
      setPassword(location.state.password || "");
    }
  }, [location.state]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userdata = await axios.post("http://localhost:3007/users/login", { registerNumber, password });

      if (userdata.data.message !== "login Sucessful") {
        showToast(userdata.data.message || "Failed to login", "error");
        return;
      }

      const token = userdata.data.token;
      var user = userdata.data.user;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("username", JSON.stringify(user.name));
      localStorage.setItem("token", token);

      setWelcome({
        show: true,
        name: user.name,
        isFirstLogin: userdata.data.isFirstLogin,
        hasResume: userdata.data.hasResume,
      });
    } catch (e) {
      showToast("Failed to login", "error");
    }
  };

  const handleContinue = () => {
    if (welcome.isFirstLogin) {
      navigate("/set-password");
    } else {
      navigate("/resume", {
        state: {
          hasResume: welcome.hasResume,
        },
      });
    }
  };

  return (
    <>
      <FontLoader />
      <div
        className="relative flex min-h-screen w-full items-center justify-center px-4 py-10"
        style={{ background: BG, ...body }}
      >
        {/* soft ambient blobs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-70" style={{ background: BLUE_LIGHT, filter: "blur(60px)" }} />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full opacity-60" style={{ background: "#EDE9FE", filter: "blur(60px)" }} />

        <Link
          to="/"
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border bg-white/80 px-3.5 py-2 text-sm font-semibold backdrop-blur-md transition hover:-translate-y-0.5 sm:left-6 sm:top-6"
          style={{ borderColor: BORDER, color: INK }}
        >
          <ArrowLeft className="h-4 w-4" style={{ color: BLUE }} />
          Home
        </Link>

        <div className="relative w-full max-w-md">
          <div className="rounded-3xl border bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10" style={{ borderColor: BORDER }}>
            <div className="flex flex-col items-center text-center">
              <img src="mzcet-logo.png" className="h-16 w-16" alt="MZCET Logo" />
              <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: BLUE_DARK }}>
                <GraduationCap className="h-3.5 w-3.5" />
                Mount Zion
              </p>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ ...display, color: INK }}>
                Welcome back
              </h1>
              <p className="mt-1.5 text-sm" style={{ color: SLATE }}>
                Log in to pick up your interview practice where you left off.
              </p>
            </div>

            <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="registerNumber" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: SLATE }}>
                  Register number
                </label>
                <input
                  type="text"
                  placeholder="Enter your register number"
                  id="registerNumber"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value)}
                  className="field w-full rounded-xl border px-4 py-3 text-sm transition"
                  style={{ borderColor: BORDER, color: INK }}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="pass" className="block text-xs font-semibold uppercase tracking-wide" style={{ color: SLATE }}>
                    Password
                  </label>
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  id="pass"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field w-full rounded-xl border px-4 py-3 text-sm transition"
                  style={{ borderColor: BORDER, color: INK }}
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-105"
                style={{ background: BLUE, boxShadow: `0 10px 20px -8px ${BLUE}80`, ...body }}
              >
                Log in
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed" style={{ color: SLATE }}>
            By logging in, you agree to our{" "}
            <span className="cursor-pointer font-semibold underline" style={{ color: INK }}>Terms and Conditions</span> and{" "}
            <span className="cursor-pointer font-semibold underline" style={{ color: INK }}>Privacy Policy</span>.
          </p>
        </div>
      </div>

      {toast.show && (
        <div className="fixed bottom-5 left-5 right-5 z-[100] md:left-auto">
          <div
            className="flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-medium text-white shadow-lg"
            style={{ background: toast.type === "success" ? BLUE_DARK : "#B91C1C" }}
          >
            {toast.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {toast.message}
          </div>
        </div>
      )}

      {welcome.show && <WelcomeOverlay name={welcome.name} onContinue={handleContinue} />}
    </>
  );
};

export default Login;