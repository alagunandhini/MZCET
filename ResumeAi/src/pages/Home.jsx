import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


const Home = () => {
    const [open, setOpen] = useState(null);


    return (
        <>
        <Navbar/>
        
            <div className="bg-white w-full min-h-[90vh] grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-gray-200">

                {/* Left Image */}
                <div className="flex items-center justify-center px-6">
                    <img
                        src="landingpage.png"
                        alt="Mz Mock AI"
                        className="w-full max-w-lg h-auto object-contain"
                    />
                </div>

                {/* Right Content */}
                <div className="flex flex-col justify-center px-8 lg:px-12">

                    <p className="text-sky-600 font-semibold text-3xl tracking-widest uppercase mb-3">
                        Mz Mock AI
                    </p>

                    <h1 className="text-4xl font-bold text-gray-500 leading-tight mb-6">
                        Prepare Smarter.
                        <br />
                        Interview Better.
                    </h1>

                    <p className="text-gray-600 text-lg leading-8 mb-8">
                        Build interview confidence with personalized AI feedback and realistic mock interview experiences.
                        
                    </p>

                    <div className="flex items-center gap-4">
                        <button className="bg-sky-500 text-white px-8 py-3 rounded-lg hover:bg-sky-600 transition duration-300 shadow-md">
                            Get Started →
                        </button>

                        <p className="text-sm text-gray-500">
                            Takes less than a minute
                        </p>
                    </div>

                </div>

            </div>



            {/* section-2 (steps)*/}
            <div className=" min-h-[80vh] py-6 ">
                <h1 className="font-bold text-2xl md:text-3xl  text-center mb-20 text-gray-500 mt-5">Steps To Use Mz mock AI  </h1>
                <div className="grid grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto px-4 gap-20">
                    {/* step-1 */}
                    <div className="bg-white flex flex-col justify-center  p-6 shadow-lg rounded-t-4xl rounded-s-4xl rounded-e-sm relative">
                        <div className=" bg-sky-300 rounded-full text-xl text-white w-12 h-12 flex items-center justify-center mb-4 absolute -top-6">1</div>
                        <div className="max-w-4xl mx-auto ">
                            <img src="step1.png" className="h-32 w-32 border-12 border-pink-300/10 bg-white rounded-full p-3 mt-10" />
                        </div>
                        <h1 className="font-bold text-xl text-gray-700 mt-6"> Upload Your Resume</h1>
                        <p className="text-gray-400 mt-2">Get your resume analyzed for personalized interview prep.</p>
                    </div>

                    {/* step-2 */}
                    <div className="bg-white flex flex-col justify-center p-6 shadow-lg rounded-t-4xl rounded-s-4xl rounded-e-sm relative">
                        <div className="bg-sky-300 rounded-full text-xl text-white w-12 h-12 flex items-center justify-center mb-4 absolute -top-6 ">2</div>
                        <div className="max-w-4xl mx-auto ">
                            <img src="steps2.png" className="h-32 w-32 object-cover border border-pink-300/10 bg-pink-300/10 rounded-full p-3 mt-10" />
                        </div>

                        <h1 className="font-bold text-xl text-gray-700 mt-6"> AI Analysis</h1>
                        <p className="text-gray-400 mt-2">Receive resume-based technical & HR interview questions.</p>
                    </div>

                    {/* step-3 */}
                    <div className="bg-white flex flex-col justify-center p-6 shadow-lg rounded-t-4xl rounded-s-4xl rounded-e-sm relative">
                        <div className="bg-sky-300 rounded-full text-xl text-white w-12 h-12 flex items-center justify-center mb-4 absolute -top-6">3</div>
                        <div className="max-w-4xl mx-auto ">
                            <img src="step3.png" className="h-32 w-32 border border-pink-300/10 bg-pink-300/10 rounded-full p-3 mt-10" />
                        </div>
                        <h1 className="font-bold text-xl text-gray-700 mt-6"> Practice & Improve</h1>
                        <p className="text-gray-400 mt-2">Answer with your voice and get instant AI feedback.</p>
                    </div>



                </div>

            </div>



            {/* section-3 */}
            <div className="min-h-[80vh] flex items-center py-10 bg-white  ">
                <div className="grid  grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto">
                    {/* left-img */}
                    <div className="flex justify-center items-center">
                        <img src="res.png" className="max-w-[90%]  max-h-[50vh] object-contain mt-8 md:mt-0" />
                    </div>
                    {/* right-content */}
                    <div className="flex flex-col justify-center items-center md:items-start px-10 md:px-0">
                        <h2 className="font-bold text-3xl text-gray-700 mb-3">AI-Powered Interview Assistant</h2>
                        <p className=" text-gray-600 text-lg mb-5 ">
                            Upload your resume and get tailored HR questions with sample answers. Prepare smartly with instant AI feedback and voice-based mock interviews to boost your confidence and land your dream job.
                        </p>
                        <ul className="list-disc list-inside text-gray-600 space-y-2">
                            <li>Get instant feedback on your resume and key skills.</li>
                            <li>Receive personalized HR interview questions.</li>
                            <li>Practice answers via voice and get AI-reviewed suggestions.</li>
                            <li>Build confidence and improve your chances of success.</li>

                        </ul>

                    </div>



                </div>
            </div>

            {/* section-4 (premium)*/}
            <div className="bg-pink-300/10 min-h-[40vh] mb-5 grid grid-cols-1 md:grid-cols-2   flex justify-center items-center">
                <div className="p-8 md:p-0 mx-0 md:ms-50 ">
                    <h1 className="text-3xl font-bold mb-3 text-gray-600">Premium AI Tools - Elevate Your Career</h1>
                    <p className="mb-4">Prepare smarter for interviews with AI. Go Premium for personalized help and exclusive tools to get ahead</p>
                    <div>  <button className="bg-pink-600/50 border border-gray-300 rounded-full py-2 w-40  text-white mt-2 cursor-pointer hover:bg-pink-400 ">Go To Premium</button></div>

                </div>
                <div className="flex justify-end ">
                    <img src="premium.png" className="w-90 h-90" />
                </div>

            </div>

            {/* section-5 (FAQ) */}
            <div className="min-h-[90vh] md:min-h-[80vh] bg-white">
                <div className="max-w-4xl mx-auto p-6">
                    <h2 className=" text-4xl font-bold text-center mb-8 text-gray-700 ">Frequently Asked Questions (FAQs)</h2>
                    {/* Question-1 */}
                    <div className="bg-white shadow-md  p-5 rounded-lg border border-gray-300 mt-5">
                        <button className="flex justify-between items-center w-full text-left " onClick={() => setOpen(open === 1 ? null : 1)}>
                            <h3 className="text-lg font-semibold text-gray-500"> Is this tool free to use?</h3>
                            <span className="text-2xl text-pink-300">{open === 1 ? "×" : "+"}</span>
                        </button>
                        {open === 1 && (
                            <p className="text-gray-600 mt-2"> Yes! Our basic AI resume based interview prep is completely free. Premium features will be available soon.
                            </p>
                        )}

                    </div>

                    {/* Question-2 */}
                    <div className="bg-white shadow-md  p-5 rounded-lg border border-gray-300 mt-5">
                        <button className="flex justify-between items-center w-full text-left " onClick={() => setOpen(open === 2 ? null : 2)}>
                            <h3 className="text-lg font-semibold text-gray-500">What file formats are supported?</h3>
                            <span className="text-2xl text-pink-300">{open === 2 ? "×" : "+"}</span>
                        </button>
                        {open === 2 && (
                            <p className="text-gray-600 mt-2"> You should upload resumes in PDF only</p>
                        )}

                    </div>

                    {/* Question-3 */}
                    <div className="bg-white shadow-md  p-5 rounded-lg border border-gray-300 mt-5">
                        <button className="flex justify-between items-center w-full text-left " onClick={() => setOpen(open === 3 ? null : 3)}>
                            <h3 className="text-lg font-semibold text-gray-500"> How accurate is the AI review?</h3>
                            <span className="text-2xl text-pink-300">{open === 3 ? "×" : "+"}</span>
                        </button>
                        {open === 3 && (
                            <p className="text-gray-600 mt-2"> Our AI provides 90% accurate feedback</p>
                        )}

                    </div>

                    {/* Question-4 */}
                    <div className="bg-white shadow-md  p-5 rounded-lg border border-gray-300 mt-5">
                        <button className="flex justify-between items-center w-full text-left " onClick={() => setOpen(open === 4 ? null : 4)}>
                            <h3 className="text-lg font-semibold text-gray-500"> Can I practice multiple times?</h3>
                            <span className="text-2xl text-pink-300">{open === 4 ? "×" : "+"}</span>
                        </button>
                        {open === 4 && (
                            <p className="text-gray-600 mt-2"> Yes! You can repeat mock interviews and get AI feedback each time to improve.</p>
                        )}

                    </div>


                </div>


            </div>
            <Footer />


        </>
    )

}
export default Home