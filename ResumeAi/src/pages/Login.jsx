import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'
import { useState, useEffect } from 'react';
import { CheckCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate();
    const [toast, setToast] = useState({ show: false, message: "", type: "success" })
    const location = useLocation();

    useEffect(() => {
        if (location.state) {
            setEmail(location.state.email || "");
            setPassword(location.state.password || "");
        }
    }, [location.state]);

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type });
        }, 5000)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userdata = await axios.post("https://ai-resumereview.onrender.com/users/login", { email, password });
            const token = userdata.data.token;
            var user = userdata.data.user;
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("username", JSON.stringify(user.name));
            localStorage.setItem("token", token);

            if (userdata) {
                showToast("login succesfull", "success");
                setTimeout(() => {
                    navigate("/resume");
                }, 2000);
            }
        } catch (e) {
            showToast("Failed to login", "error");
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
                        {/* Responsive Image size */}
                        <img src="3d.png" alt="Pinkyy AI" className="w-4/5 max-w-sm lg:max-w-md drop-shadow-xl" />
                        <div className="mt-8 text-center px-4">
                            <p className="text-lg md:text-xl text-gray-600 italic">"Hey buddy! ,nice to meet You again"</p>
                            <h1 className="text-4xl md:text-5xl font-bold text-pink-300 mt-2">Welcome Back</h1>
                        </div>
                    </div>
                </div>

                {/* colummn-2 */}
                <div className='bg-pink-300/10 flex flex-col items-center justify-center'>
                    {/* Added w-full and px-6 for mobile padding */}
                    <div className='p-6 md:p-10 w-full flex flex-col items-center justify-center'>
                        {/* Form container with max-width to prevent stretching too far on large screens */}
                        <form className='w-full max-w-md' onSubmit={handleSubmit}>
                            <h2 className='text-4xl font-bold mb-2 text-pink-300'> Log in</h2>
                            <p className='text-gray-400 mb-5'>Don't Have An Account? <Link to="/signup" className='hover:text-black'>Sign up</Link> </p>

                            {/* Email - Changed w-[50vh] to w-full */}
                            <div className='relative w-full mb-4'>
                                <input 
                                    type='email' 
                                    placeholder='Email' 
                                    id="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className='w-full p-4 border border-gray-500 rounded-md hover:border-pink-300 focus:outline-none focus:border-pink-300 '
                                />
                            </div>

                            {/* Password - Changed w-[50vh] to w-full */}
                            <div className='relative w-full mb-4'>
                                <input 
                                    type='password' 
                                    placeholder='Password' 
                                    id="pass" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className='peer w-full p-4 border border-gray-500 rounded-md hover:border-pink-300 focus:outline-none focus:border-pink-300 '
                                />
                            </div>

                            <div className='flex items-center justify-center'>
                                {/* Changed w-80 to w-full for better mobile fit */}
                                <button className='w-full max-w-xs bg-pink-300 text-white px-6 py-3 rounded-full cursor-pointer hover:bg-pink-400 transition-all duration-200 mb-4 mx-20'>
                                    Log In
                                </button>
                            </div>

                            <div className='flex justify-center items-center'>
                                <hr className='flex-grow border-t text-gray-700 my-4'></hr>
                                <span className='mx-4 text-gray-400'>OR</span>
                                <hr className='flex-grow border-t text-gray-400 my-4'></hr>
                            </div>

                            <h1 className='text-center my-4' >Continue with </h1>
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

                        <p className='mt-14 text-center text-sm mb-15'>By clicking “Sign In” you agree to our<br />
                            <span className='text-pink-300 border-b cursor-pointer'>Terms and Conditions </span>and <span className='text-pink-300 border-b cursor-pointer'>Privacy Policy</span>.</p>
                    </div>
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
    )
}

export default Login;