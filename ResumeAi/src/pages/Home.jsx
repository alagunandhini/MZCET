import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Small inline icons for the instructions panel — no external icon package required
const RuleIcon = ({ path }) => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {path}
    </svg>
);

const icons = {
    upload: <path d="M12 16V4M12 4l-4 4M12 4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />,
    lock: <path d="M6 10V7a6 6 0 1112 0v3M5 10h14v10H5V10z" />,
    attempts: <path d="M9 3v4H5l6 6-6 6h4v4h6v-4h4l-6-6 6-6h-4V3H9z" />,
    zero: <><circle cx="12" cy="12" r="9" /><path d="M8 16L16 8" /></>,
    tab: <path d="M4 5h16v14H4V5zm0 4h16M9 9v10" />,
    warning: <path d="M12 3l9 16H3l9-16zM12 10v4m0 3h.01" />,
    mic: <path d="M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3zm-7-3a7 7 0 0014 0M12 19v3" />,
    session: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></>,
};

const rules = [
    { icon: "upload", text: <>Upload your <span className="font-semibold text-gray-700">resume only once</span> — it stays attached to this session.</> },
    { icon: "lock", text: "Questions are generated from that resume only. Re-uploading or regenerating isn't available mid-session." },
    { icon: "attempts", text: <>Every round gives you <span className="font-semibold text-gray-700">3 attempts</span> — make them count.</> },
    { icon: "zero", text: <>Run out of attempts and the round scores <span className="font-semibold text-red-500">0</span> automatically.</> },
    { icon: "tab", text: "Stay on the interview tab. Switching, minimizing, or leaving the page is tracked." },
    { icon: "warning", text: <><span className="font-semibold text-red-500">5 tab-switch warnings</span> and the interview ends on its own.</> },
    { icon: "mic", text: "Turn on your microphone before you start — answers are spoken, not typed." },
    { icon: "session", text: "Finish in one sitting. One continuous session gives the most accurate read on your prep." },
];

const steps = [
    {
        img: "blue step 2.png",
        title: "Upload your resume",
        text: "Drop in your resume and let it become the basis for everything that follows.",
    },
    {
        img: "blue step 3.png",
        title: "Get your questions",
        text: "AI reads your resume and builds a matching set of technical and HR questions.",
    },
    {
        img: "blue step 1.png",
        title: "Answer & improve",
        text: "Speak your answers out loud and get feedback you can act on immediately.",
    },
];

// Feature cards — each icon reuses the same inline-svg pattern as the instructions panel
const FeatureIcon = ({ path }) => (
    <svg viewBox="0 0 24 24" className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {path}
    </svg>
);

const features = [
    {
        icon: <path d="M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3zm-7-3a7 7 0 0014 0M12 19v3" />,
        title: "Real-time speech analysis",
        text: "Every spoken answer is scored live for confidence and clarity — not just graded after the fact.",
    },
    {
        icon: <path d="M9 3v4H5l6 6-6 6h4v4h6v-4h4l-6-6 6-6h-4V3H9z" />,
        title: "Round-based practice",
        text: "Technical and HR rounds generated straight from your resume, three attempts each.",
    },
    {
        icon: <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />,
        title: "Instant AI feedback",
        text: "A full performance report the moment you finish — no waiting, no guessing.",
    },
    {
        icon: <path d="M4 19V5m6 14V9m6 10V13" />,
        title: "Progress tracking",
        text: "See attempts, scores, and pass/fail history for every round in one dashboard.",
    },
];

const Home = () => {
    const [open, setOpen] = useState(null);

    // Shared scroll-reveal animation — fades up into view once, doesn't replay on scroll back
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const staggerContainer = {
        hidden: {},
        show: { transition: { staggerChildren: 0.12 } },
    };

    return (
        <>
            <Navbar />

            {/* Hero */}
            <div className="bg-white w-full min-h-[90vh] grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-gray-200 overflow-hidden">

                {/* Left Image — it already carries its own glow + floating stat cards, so let it breathe instead of stacking more UI on top */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="relative flex items-center justify-center px-6"
                >
                    <img
                        src="homeimgfinal.png"
                        alt="Mz Mock AI — friendly AI interviewer showing live confidence and clarity scores"
                        className="w-full max-w-xl h-auto object-contain drop-shadow-xl"
                    />
                </motion.div>

                {/* Right Content */}
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={staggerContainer}
                    className="flex flex-col justify-center px-8 lg:px-12"
                >

                    <motion.p variants={fadeUp} className="text-sky-600 font-semibold text-sm tracking-[0.3em] uppercase mb-4">
                        Mz Mock AI
                    </motion.p>

                    <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-gray-700 leading-[1.1] mb-6">
                        Prepare smarter.
                        <br />
                        <span className="bg-gradient-to-r from-sky-500 to-sky-400 bg-clip-text text-transparent">
                            Interview better.
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeUp} className="text-gray-500 text-lg leading-8 mb-8 max-w-md">
                        Upload your resume, answer out loud, and get AI feedback on your confidence and clarity — question by question, in real time.
                    </motion.p>

                    <motion.div variants={fadeUp} className="flex items-center gap-4 mb-10">
                        <button className="bg-sky-500 text-white px-8 py-3 rounded-lg hover:bg-sky-600 hover:scale-105 transition duration-300 shadow-md shadow-sky-200">
                            Get Started →
                        </button>
                        <button className="text-sky-600 font-semibold px-2 py-3 hover:text-sky-700 transition">
                            See how it works
                        </button>
                    </motion.div>

                    {/* stat strip — echoes the scores shown in the illustration, in words this time */}
                    <motion.div variants={fadeUp} className="flex items-center gap-8 border-t border-gray-100 pt-6 max-w-md">
                        <div>
                            <p className="text-2xl font-bold text-sky-600">92%</p>
                            <p className="text-gray-400 text-sm">Avg. confidence score</p>
                        </div>
                        <div className="w-px h-10 bg-gray-100" />
                        <div>
                            <p className="text-2xl font-bold text-sky-600">88%</p>
                            <p className="text-gray-400 text-sm">Avg. clarity score</p>
                        </div>
                        <div className="w-px h-10 bg-gray-100" />
                        <div>
                            <p className="text-2xl font-bold text-sky-600">Live</p>
                            <p className="text-gray-400 text-sm">Spoken feedback</p>
                        </div>
                    </motion.div>

                </motion.div>

            </div>

            {/* section-2 (steps) */}
            <div className="min-h-[80vh] py-6 bg-gradient-to-b from-white via-sky-50/40 to-white">
                <h1 className="font-bold text-2xl md:text-3xl text-center mb-2 text-gray-500 mt-5">
                    Steps To Use Mz Mock AI
                </h1>
                <p className="text-center text-gray-400 mb-20">Three steps, one session, no repeats.</p>

                <div className="max-w-7xl mx-auto px-4">
                    {/* connector line behind the numbered badges — the steps are a real sequence */}
                    <div className="hidden md:block relative h-0">
                        <div className="absolute top-[-2.5rem] left-[16.6%] right-[16.6%] border-t-2 border-dashed border-sky-200" />
                    </div>

                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-20"
                    >
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.title}
                                variants={fadeUp}
                                whileHover={{ y: -6 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="bg-white flex flex-col justify-center p-6 shadow-lg rounded-t-4xl rounded-s-4xl rounded-e-sm relative"
                            >
                                <div className="bg-white ring-4 ring-sky-100 rounded-full text-xl font-semibold text-sky-600 w-12 h-12 flex items-center justify-center mb-4 absolute -top-6">
                                    {i + 1}
                                </div>
                                <div className="max-w-4xl mx-auto">
                                    <img
                                        src={step.img}
                                        className="h-40 w-40 border border-sky-300/10 bg-sky-300/10 rounded-full p-3 mt-10 object-cover"
                                    />
                                </div>
                                <h2 className="font-bold text-xl text-gray-700 mt-6">{step.title}</h2>
                                <p className="text-gray-400 mt-2">{step.text}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Instructions */}
            <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                variants={staggerContainer}
                className="w-full bg-gray-50 border border-sky-100 rounded-2xl p-8 shadow-sm mt-10 max-w-7xl mx-auto"
            >
                <motion.h2 variants={fadeUp} className="text-3xl font-bold text-sky-600 mb-2 text-center">
                    Interview Instructions
                </motion.h2>
                <motion.p variants={fadeUp} className="text-center text-gray-400 mb-8">Read this once, before you hit start.</motion.p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-5xl mx-auto">
                    {rules.map((rule, i) => (
                        <motion.div
                            key={i}
                            variants={fadeUp}
                            className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                        >
                            <span className="shrink-0 mt-0.5 bg-sky-50 rounded-lg p-2">
                                <RuleIcon path={icons[rule.icon]} />
                            </span>
                            <p className="text-gray-600 leading-7">{rule.text}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Feature Cards */}
            <div className="max-w-7xl mx-auto px-4 mt-24">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="font-bold text-2xl md:text-3xl text-center mb-2 text-gray-500"
                >
                    Why Mz Mock AI
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center text-gray-400 mb-12"
                >
                    Everything you need to walk into the real interview prepared.
                </motion.p>

                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.title}
                            variants={fadeUp}
                            whileHover={{ y: -6, boxShadow: "0 12px 24px -8px rgba(14,165,233,0.25)" }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                        >
                            <div className="bg-sky-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                <FeatureIcon path={feature.icon} />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-700 mb-2">{feature.title}</h3>
                            <p className="text-gray-400 leading-6">{feature.text}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Product Preview */}
            <div className="max-w-7xl mx-auto px-4 mt-24 mb-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="font-bold text-2xl md:text-3xl text-center mb-2 text-gray-500"
                >
                    See It In Action
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center text-gray-400 mb-12"
                >
                    A quick look at your scorecard after a round.
                </motion.p>

                {/* Browser-chrome mockup wrapping a scaled-down InterviewCompleted-style scorecard */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="max-w-3xl mx-auto rounded-2xl border border-gray-200 shadow-xl overflow-hidden"
                >
                    {/* fake browser top bar */}
                    <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400" />
                        <span className="w-3 h-3 rounded-full bg-amber-400" />
                        <span className="w-3 h-3 rounded-full bg-emerald-400" />
                        <span className="ml-4 text-xs text-gray-400">mzmockai.com/interview</span>
                    </div>

                    {/* mock scorecard content */}
                    <div className="bg-gradient-to-br from-sky-50 via-white to-purple-50 p-8 sm:p-12 flex justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-white rounded-3xl border border-sky-100 p-6 sm:p-10 w-full max-w-md text-center shadow-xl"
                        >
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">Well Done 🎉</h3>
                            <p className="text-gray-500 mb-6 text-sm">You've completed your Interview</p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="rounded-xl border border-sky-100 bg-sky-50/50 py-4">
                                    <p className="text-xs text-gray-500 font-medium">Score</p>
                                    <p className="text-xl font-bold text-sky-500">86</p>
                                </div>
                                <div className="rounded-xl border border-sky-100 bg-sky-50/50 py-4">
                                    <p className="text-xs text-gray-500 font-medium">Result</p>
                                    <p className="text-xl font-bold text-emerald-500">PASS</p>
                                </div>
                            </div>

                            <button className="py-3 px-8 rounded-full bg-sky-400 text-white text-sm font-semibold shadow-sm hover:bg-sky-500 hover:scale-105 transition">
                                View Feedback
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            <Footer />

            {/* Earlier drafts (AI assistant intro, premium upsell, FAQ) kept below, commented out,
                so nothing already written is lost — revisit these when ready. */}

            {/* section-3
            <div className="min-h-[80vh] flex items-center py-10 bg-white  ">
                <div className="grid  grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto">
                    {/* left-img */}
            {/* <div className="flex justify-center items-center">
                        <img src="res.png" className="max-w-[90%]  max-h-[50vh] object-contain mt-8 md:mt-0" />
                    </div>
                    {/* right-content */}
            {/* <div className="flex flex-col justify-center items-center md:items-start px-10 md:px-0">
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

                    </div> */}


            {/* 
                </div>
            </div> */}

            {/* section-4 (premium)*/}
            {/* <div className="bg-pink-300/10 min-h-[40vh] mb-5 grid grid-cols-1 md:grid-cols-2   flex justify-center items-center">
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
            {/* <div className="min-h-[90vh] md:min-h-[80vh] bg-white">
                <div className="max-w-4xl mx-auto p-6">
                    <h2 className=" text-4xl font-bold text-center mb-8 text-gray-700 ">Frequently Asked Questions (FAQs)</h2>
                    {/* Question-1 */}
            {/* <div className="bg-white shadow-md  p-5 rounded-lg border border-gray-300 mt-5">
                        <button className="flex justify-between items-center w-full text-left " onClick={() => setOpen(open === 1 ? null : 1)}>
                            <h3 className="text-lg font-semibold text-gray-500"> Is this tool free to use?</h3>
                            <span className="text-2xl text-pink-300">{open === 1 ? "×" : "+"}</span>
                        </button>
                        {open === 1 && (
                            <p className="text-gray-600 mt-2"> Yes! Our basic AI resume based interview prep is completely free. Premium features will be available soon.
                            </p> */}
            {/* )}

                    </div> */}

            {/* Question-2 */}
            {/* <div className="bg-white shadow-md  p-5 rounded-lg border border-gray-300 mt-5">
                        <button className="flex justify-between items-center w-full text-left " onClick={() => setOpen(open === 2 ? null : 2)}>
                            <h3 className="text-lg font-semibold text-gray-500">What file formats are supported?</h3> */}
            {/* <span className="text-2xl text-pink-300">{open === 2 ? "×" : "+"}</span>
                        </button>
                        {open === 2 && (
                            <p className="text-gray-600 mt-2"> You should upload resumes in PDF only</p>
                        )} */}

            {/* </div> */}

            {/* Question-3 */}
            {/* <div className="bg-white shadow-md  p-5 rounded-lg border border-gray-300 mt-5">
                        <button className="flex justify-between items-center w-full text-left " onClick={() => setOpen(open === 3 ? null : 3)}>
                            <h3 className="text-lg font-semibold text-gray-500"> How accurate is the AI review?</h3>
                            <span className="text-2xl text-pink-300">{open === 3 ? "×" : "+"}</span>
                        </button>
                        {open === 3 && (
                            <p className="text-gray-600 mt-2"> Our AI provides 90% accurate feedback</p>
                        )}

                    </div> */}

            {/* Question-4 */}
            {/* <div className="bg-white shadow-md  p-5 rounded-lg border border-gray-300 mt-5">
                        <button className="flex justify-between items-center w-full text-left " onClick={() => setOpen(open === 4 ? null : 4)}>
                            <h3 className="text-lg font-semibold text-gray-500"> Can I practice multiple times?</h3>
                            <span className="text-2xl text-pink-300">{open === 4 ? "×" : "+"}</span>
                        </button>
                        {open === 4 && (
                            <p className="text-gray-600 mt-2"> Yes! You can repeat mock interviews and get AI feedback each time to improve.</p>
                        )}

                    </div>


                </div> */}

            {/* 
            </div> */}

        </>
    )

}
export default Home;
