import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

const SignUp = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [toast, setToast] = useState({ show: false, message: "", type: "success" })

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type });
        }, 5000)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) {
            showToast("Fill all fields", "error");
            return;
        }
        if (password.length < 6) {
            showToast("Password length should > 6", "error");
            return;
        }
        try {
            const res = await axios.post("https://ai-resumereview.onrender.com/users/signup", { name, email, password });
            var user = res.data.user;
            const token = res.data.token;
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);

            if (res) {
                showToast("Account Created sucessfully", "success");
                setTimeout(() => {
                    navigate("/login", { state: { email, password } })
                }, 2000)
            }
        } catch (e) {
            if (e.response && e.response.status === 400) {
                showToast("Email already exist", "error");
            } else
                showToast("Failed to create an account", "error");
        }
    }

    return (
        <>
            <div className="min-h-screen bg-white w-full grid grid-cols-1 md:grid-cols-2">
                {/* column-1 */}
                <div className='flex flex-col'>
                    <div className='p-2'>
                        <Link to="/" className='bg-pink-300 w-24 px-3 py-3 rounded-tl-4xl rounded-br-4xl text-white cursor-pointer hover:bg-pink-400 transition duration-200 ease-in-out flex justify-center items-center'>🏠︎ Home</Link>
                    </div>
                    <div className="flex flex-col items-center justify-center flex-grow py-10">
                        <img src="3d.png" alt="Pinkyy AI" className="w-4/5 max-w-sm lg:max-w-md drop-shadow-xl" />
                        <div className="mt-8 text-center px-4">
                            <p className="text-lg md:text-xl text-gray-600 italic">"Hi, I am Pinkyy AI, Your Resume Reviewer"</p>
                            <h1 className="text-4xl md:text-5xl font-bold text-pink-300 mt-2">Welcomes You</h1>
                        </div>
                    </div>
                </div>

                {/* column-2 */}
                <div className='bg-pink-300/10 flex flex-col items-center justify-center p-6 md:p-10'>
                    <div className='w-full max-w-md'>
                        <form className='w-full' onSubmit={handleSubmit}>
                            <h2 className='text-4xl font-bold mb-2 text-pink-300'> Sign Up</h2>
                            <p className='text-gray-400 mb-8'>Already a member? <Link to="/login" className='hover:text-black'>Log in</Link> </p>
                            
                            <div className='relative w-full mb-4'>
                                <input type='text' placeholder='Full Name' value={name} onChange={(e) => setName(e.target.value)} className='w-full p-4 border border-gray-500 rounded-md hover:border-pink-300 focus:outline-none focus:border-pink-300' />
                            </div>

                            <div className='relative w-full mb-4'>
                                <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} className='w-full p-4 border border-gray-500 rounded-md hover:border-pink-300 focus:outline-none focus:border-pink-300' />
                            </div>

                            <div className='relative w-full mb-4'>
                                <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} className='w-full p-4 border border-gray-500 rounded-md hover:border-pink-300 focus:outline-none focus:border-pink-300' />
                            </div>

                            <div className='flex items-center justify-center'>
                                <button className='w-full bg-pink-300 text-white px-6 py-3 rounded-full cursor-pointer hover:bg-pink-400 transition-all duration-200 mb-4 font-semibold mx-20'>Sign Up</button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <hr className='flex-grow border-t border-gray-300 my-4'></hr>
                                <span className='mx-4 text-gray-400 text-sm'>OR</span>
                                <hr className='flex-grow border-t border-gray-300 my-4'></hr>
                            </div>

                            {/* Single Google Authenticate Button */}
                            <div className='flex flex-col items-center justify-center gap-4 mt-2 mx-20'>
                                <button 
                                    type="button"
                                     onClick={()=> alert("Sorry Not Integrated yet! pls type...")}
                                    className="flex items-center justify-center gap-3 w-full border border-gray-300 bg-gray-100/50 p-3 rounded-full hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                                >
                                    <img src="google.png" className='w-6 h-6' alt="google" />
                                    <span className="text-gray-700 font-medium">Continue with Google</span>
                                </button>
                            </div>
                        </form>

                        <p className='mt-14 text-center text-sm'>
                            By clicking “Sign Up” you agree to our<br />
                            <span className='text-pink-300 border-b cursor-pointer'>Terms and Conditions </span>and <span className='text-pink-300 border-b cursor-pointer'>Privacy Policy</span>.
                        </p>
                    </div>
                </div>
            </div>

            {toast.show && (
                <div className="fixed bottom-5 left-5 right-5 md:left-auto md:right-5 z-[100] animate-slideIn">
                    <div className={`px-8 py-3 rounded-lg shadow-lg text-sm ${toast.type === "success" ? "bg-pink-400 " : "bg-gray-900"} text-white flex gap-3 items-center justify-center`}>
                        {toast.type === "success" ? (<CheckCircle size={18} className="text-white" />) : (<span className="font-extrabold text-white">!</span>)}
                        {toast.message}
                    </div>
                </div>
            )}
        </>
    )
}

export default SignUp;