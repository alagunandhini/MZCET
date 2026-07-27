import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertCircle, GraduationCap } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Design tokens — shared with Home.jsx / Login.jsx                         */
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
      @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; } }
    `}</style>
  );
}

const SetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const navigate = useNavigate();

    // If there's no token, they shouldn't be here at all — send them to login
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, []);

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type });
        }, 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            showToast("Password must be at least 6 characters", "error");
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }

        setSubmitting(true);
        const token = localStorage.getItem("token");

        try {
            const res = await axios.post(
                "http://localhost:3007/users/reset-password",
                { newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                showToast("Password set successfully!", "success");
                setTimeout(() => {
                    navigate("/resume");
                }, 1500);
            } else {
                showToast(res.data.message || "Failed to set password", "error");
            }
        } catch (err) {
            showToast("Something went wrong. Please try again.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <FontLoader />
            <div
                className="relative flex min-h-screen w-full items-center justify-center px-4 py-10"
                style={{ background: BG, ...body }}
            >
                {/* soft ambient blobs, kept behind the card — matches Login.jsx */}
                <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full opacity-70" style={{ background: BLUE_LIGHT, filter: "blur(60px)" }} />
                <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full opacity-60" style={{ background: "#EDE9FE", filter: "blur(60px)" }} />

                <div className="relative w-full max-w-md">
                    <div className="rounded-3xl border bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10" style={{ borderColor: BORDER }}>
                        {/* brand mark */}
                        <div className="flex flex-col items-center text-center">
                            <img src="mzcet-logo.png" className="h-16 w-16" />
                            <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: BLUE_DARK }}>
                                <GraduationCap className="h-3.5 w-3.5" />
                                 MZ Resume AI
                            </p>
                            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ ...display, color: INK }}>
                                Set your password
                            </h1>
                            <p className="mt-1.5 text-sm leading-relaxed" style={{ color: SLATE }}>
                               Set your new password to continue 
                            </p>
                        </div>

                        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="newPassword" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: SLATE }}>
                                    New password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter a new password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="field w-full rounded-xl border px-4 py-3 text-sm transition"
                                    style={{ borderColor: BORDER, color: INK }}
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: SLATE }}>
                                    Confirm new password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Re-enter your new password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="field w-full rounded-xl border px-4 py-3 text-sm transition"
                                    style={{ borderColor: BORDER, color: INK }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-2 w-full rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                                style={{ background: BLUE, boxShadow: `0 10px 20px -8px ${BLUE}80`, ...body }}
                            >
                                {submitting ? "Saving..." : "Set password & continue"}
                            </button>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-xs leading-relaxed" style={{ color: SLATE }}>
                        Use at least 6 characters password.
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
        </>
    );
};

export default SetPassword;