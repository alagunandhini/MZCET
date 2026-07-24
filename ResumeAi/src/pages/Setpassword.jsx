import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle } from "lucide-react";

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
            <div className="min-h-screen bg-white w-full flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-pink-300/5 border border-pink-100 rounded-2xl p-8 md:p-10">
                    <h2 className="text-3xl font-bold mb-2 text-pink-300 text-center">Set Your Password</h2>
                    <p className="text-gray-400 mb-8 text-center text-sm">
                        This is your first login. Please set a new password to continue — you won't be able to use the default password again.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className='relative w-full mb-4'>
                            <input
                                type='password'
                                placeholder='New Password'
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className='w-full p-4 border border-gray-500 rounded-md hover:border-pink-300 focus:outline-none focus:border-pink-300'
                            />
                        </div>

                        <div className='relative w-full mb-6'>
                            <input
                                type='password'
                                placeholder='Confirm New Password'
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className='w-full p-4 border border-gray-500 rounded-md hover:border-pink-300 focus:outline-none focus:border-pink-300'
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className='w-full bg-pink-300 text-white px-6 py-3 rounded-full cursor-pointer hover:bg-pink-400 transition-all duration-200 disabled:opacity-50'
                        >
                            {submitting ? "Saving..." : "Set Password & Continue"}
                        </button>
                    </form>
                </div>
            </div>

            {toast.show && (
                <div className="fixed bottom-5 right-5 left-5 md:left-auto z-[100] animate-slideIn">
                    <div className={`px-8 py-3 rounded-lg shadow-lg text-sm ${toast.type === "success" ? "bg-pink-400 " : "bg-gray-900"} text-white flex gap-3`}>
                        {toast.type === "success" ? (<CheckCircle size={18} className="text-pink-500" />) : (<span className="font-extrabold text-red-500">!</span>)}
                        {toast.message}
                    </div>
                </div>
            )}
        </>
    );
};

export default SetPassword;