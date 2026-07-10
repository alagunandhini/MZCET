import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
// to read and extract the file content
// import * as pdfjsLib from 'pdfjs-dist';
import Navbar from "../components/Navbar";
import { useEffect } from "react";
import { useRef } from "react";
import { FaMicrophone } from "react-icons/fa";
import { FaStop } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import TransitionLoader from "../components/TransitionLoader";
import InterviewCompleted from "../components/InterviewCompleted";
import { motion, AnimatePresence } from "framer-motion";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import { CheckCircle } from "lucide-react";


// Set workerSrc to CDN URL
//pdfjs-dist needs a web worker to process PDFs in a background thread.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const Resume = () => {
  const [resumeText, setResumeText] = useState();
  const [file, setFile] = useState(null); //to acess the file uploaded
  const navigate = useNavigate();
  const onDrop = useCallback((acceptedFiles) => {
    var file = acceptedFiles[0]; // stores the first file in arrary
    setFile(file); // save the file in file variable
    console.log(file);

    if (file.type === "application/pdf") {
      readPdf(file); //checking wheather file is pdf or not
    } else {
      alert("Upload Pdf file");
    }
  }, []); // it calls once file get from users
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
  }); // to accept only pdf file , it is DropZone function for for drag and drop

  const readPdf = async (file) => {
    const reader = new FileReader(); // create a new file reader
    // when file readed this function triggers
    reader.onload = async function () {
      const array = new Uint8Array(this.result); //file into a Uint8Array (pdf want this format)
      const pdf = await pdfjsLib.getDocument({ data: array }).promise;
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i); //get each page
        const content = await page.getTextContent(); //get file content
        const strings = content.items.map((item) => item.str);
        text += strings.join(" ");
      }
      console.log(text);
      setResumeText(text);
    };
    reader.readAsArrayBuffer(file);
  };

// toast notification , if user not login 
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
 // toast notification functtion
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });

    // remove after 3 sec
    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 5000);
  };

 //  if token is not there then it autamatically in login page 
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
  }
}, []);


  const [questions, setQuestions] = useState([]); // store generated questions
  const [loading, setLoading] = useState(false);
  const [showQuestionsUI, setShowQuestionsUI] = useState(false);
  const [transitionLoading, setTransitionLoading] = useState(false);
  const [transitionText, setTransitionText] = useState("");
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [questionStatus, setQuestionStatus] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // it send the resume text to backend , to get Ai interview question
  const analyzeInterview = async () => {
    if (!resumeText) {
      alert("Please upload your resume first!");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      showToast("Please login to continue", "error");
      setTimeout(() => {
        navigate("/login");
      }, 2000);

      return;
    }

    //  show loader
    setTransitionText("Generating interview questions…");
    setTransitionLoading(true);

    // send the resume text ,fetch Ai response
    try {
      const response = await fetch("https://ai-resumereview.onrender.com/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ text: resumeText }),
      });

      // store the backend response
      const data = await response.json();

      if (data.success) {
        try {
          console.log("BACKEND RAW RESPONSE:", data.analysis);

          const parsedQuestions = JSON.parse(data.analysis); // convert string to object
          setQuestions(parsedQuestions); // now each section is an array

          setTransitionLoading(false);
          setShowQuestionsUI(true);
        } catch (err) {
          console.error("Failed to parse AI response:", err);
          alert("AI response is invalid");
        }
      }
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      alert("Something went wrong");
    }
  };

  const sections = ["HR", "Technical", "Stress", "Scenario"];
  const [activeSection, SetActiveSection] = useState("HR");
  const [startPractice, setStartPractice] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [sessionId, setSessionId] = useState(uuidv4());
  const [feedback, setFeedback] = useState(null);
  const [mode, setMode] = useState("practice");
  const [sectionIndex, setSectionIndex] = useState();
  const computedSection =
    mode === "interview" ? sections[sectionIndex] : activeSection;

  // automatic voice read
  useEffect(() => {
    if (startPractice) {
      const question = questions[computedSection]?.[currentIndex]?.q;
      if (question) speakText(question);
    }
  }, [currentIndex, computedSection, startPractice]);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunks.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      const key = `${activeSection}-${currentIndex}`;

      setQuestionStatus((prev) => ({
        ...prev,
        [key]: "answered",
      }));

      if (mode === "practice") {
        speakText("Okay good.");
        setTimeout(() => next(), 1200);
        return;
      }

      // send these data to backend to save in db and also convert audio into text
      const formData = new FormData();
      formData.append("audio", audioBlob, "answer.webm");
      formData.append("question", questions[computedSection][currentIndex]?.q);
      formData.append("sessionId", sessionId);

      const isLastQuestion =
        currentIndex === questions[computedSection].length - 1 &&
        sectionIndex === sections.length - 1;

      try {
        if (isLastQuestion) {
          setIsAnalyzing(true);
          speakText("Great! Analyzing your interview. Please wait.");
          // WAIT for LAST answer to save
          const res = await fetch("https://ai-resumereview.onrender.com/upload-audio", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (data.success) {
            await endInterview();
          }
        } else {
          //  Fire & forget for normal questions
          fetch("https://ai-resumereview.onrender.com/upload-audio", {
            method: "POST",
            body: formData,
          }).catch((err) => console.error("Backend audio save failed", err));

          speakText("Okay good. Next question.");
          setTimeout(() => next(), 1200);
        }
      } catch (err) {
        console.error("Audio upload failed", err);
      }
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (!isRecording) return;

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream
      .getTracks()
      .forEach((track) => track.stop()); // 🔴 IMPORTANT
    setIsRecording(false);
  };

  const endInterview = async () => {
   
    try {
      const res = await fetch("https://ai-resumereview.onrender.com/end-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
       speakText(
      "Well done , You have completed your Interview . Click to view Feedback"
    );
      if (data.success) {
        setFeedback(data.feedback);
        // show completion screen
        setShowCompletionScreen(true);
      }
    } catch (err) {
      console.log("failed in fetching data");
    } finally {
      // stop loader
      setIsAnalyzing(false);
    }
  };

  // TEXT TO SPEECH WITH FEMALE VOICE
  const speakText = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel(); // stop any current speech

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.8;
    utter.pitch = 1.1; // soft female tone
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);

    const setFemaleVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice =
        voices.find(
          (v) =>
            v.name.includes("Female") ||
            v.name.includes("Samantha") ||
            v.name.includes("Google UK English Female") ||
            v.name.includes("Microsoft Zira") ||
            v.name.includes("Microsoft Aria")
        ) || voices[0]; // fallback if no female found

      utter.voice = femaleVoice;
      window.speechSynthesis.speak(utter);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // voices are ready
      setFemaleVoiceAndSpeak();
    } else {
      // wait for voices to load
      window.speechSynthesis.onvoiceschanged = setFemaleVoiceAndSpeak;
    }
  };

  const next = () => {
    const index = questions[computedSection]?.length || 0;

    // move normally for other question
    if (currentIndex < index - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    // reaches when last question came in practce mode
    if (mode === "practice") {
      speakText("practice completed");
      setTransitionText("practice Completed...");
      setTransitionLoading(true);

      setTimeout(() => {
        setTransitionLoading(false);
        setStartPractice(false);
        setShowQuestionsUI(true);
        setCurrentIndex(0);
      }, 2000);
      return;
    }

    // when reaches last question of each section , it call moveToNextSectionWithLoader
    if (mode === "interview") {
      if (sectionIndex < sections.length - 1) {
        moveToNextSectionWithLoader(sectionIndex + 1);
      }
    }
  };

  // skip question logic
  const skipQuestion = () => {
    const key = `${activeSection}-${currentIndex}`;

    // mark skipped only if not answered
    setQuestionStatus((prev) => ({
      ...prev,
      [key]: prev[key] || "skipped",
    }));

    // speakText("Okay, skipping this question.");

    next();
  };

  // const prev = () => {
  //   if (currentIndex > 0) {
  //     setCurrentIndex(currentIndex - 1);
  //   }
  // };

  // trigger when reaches last Question of each question
  const moveToNextSectionWithLoader = (nextIndex) => {
    // next section to move forward
    const nextSection = sections[nextIndex];
    setTransitionText(`Round-${nextIndex} completed`);
    setTransitionLoading(true);

    setTimeout(() => {
      setTransitionLoading(false);
      setSectionIndex(nextIndex); // updating the current section index
      SetActiveSection(nextSection); // updates current section
      setCurrentIndex(0);
    }, 3000);
  };
  const [hydrated, setHydrated] = useState(false);

  // storing each state, when each state changes
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const appState = {
      showQuestionsUI,
      startPractice,
      questions,
      activeSection,
      currentIndex,
      sectionIndex,
      mode,
      sessionId,
    };
    localStorage.setItem("interviewstate", JSON.stringify(appState));
  }, [
    hydrated,
    showQuestionsUI,
    startPractice,
    questions,
    activeSection,
    currentIndex,
    sectionIndex,
    mode,
    sessionId,
  ]);

  // when refresh it will will on same screen
  useEffect(() => {
    const savedState = localStorage.getItem("interviewstate");
    if (savedState) {
      const state = JSON.parse(savedState);
      setShowQuestionsUI(state.showQuestionsUI);
      setStartPractice(state.startPractice);
      setQuestions(state.questions || []);
      SetActiveSection(state.activeSection || "HR");
      setCurrentIndex(state.currentIndex || 0);
      setSectionIndex(state.sectionIndex || 0);
      setMode(state.mode || "practice");
      setSessionId(state.sessionId || uuidv4());
    }
    setHydrated(true);
  }, []);

  // username
  const username = localStorage.getItem("username");

  //  automatic speak when question ui comes
  useEffect(() => {
    if (showQuestionsUI && !startPractice) {
      const timer = setTimeout(() => {
        speakText(`Hey ${username} , are you Ready to practice`);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showQuestionsUI, startPractice]);

  const answeredCount = Object.values(questionStatus).filter(
    (v) => v === "answered"
  ).length;

  const skippedCount = Object.values(questionStatus).filter(
    (v) => v === "skipped"
  ).length;

  return (
    <>
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-[100] animate-slideIn">
          <div
            className={`px-8 py-3 rounded-lg shadow-lg  text-sm ${
              toast.type === "success" ? "bg-pink-400 " : "bg-gray-900"
            } text-white flex gap-3`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={18} className="text-pink-500" />
            ) : (
              <span className="font-extrabold  ">!</span>
            )}

            {toast.message}
          </div>
        </div>
      )}
      {!showQuestionsUI && <Navbar />}

      {/* Loader for all */}
      {transitionLoading && <TransitionLoader text={transitionText} />}

      <div className="min-h-screen ">
        {/* Page 1 - Upload Resume */}

        {!showQuestionsUI && (
          <div className=" grid grid-cols-1 md:grid-cols-6  bg-white">
            {/* LEFT SECTION */}
            <div className="hidden md:flex md:col-span-2 flex-col items-center px-10 py-14 border-r border-gray-200 bg-gradient-to-b from-pink-50 to-white">
              <img
                src="resume1.png"
                className="rounded-xl w-full max-w-xs shadow-lg object-contain"
                alt="Resume Preview"
              />
              <p className="mt-8 text-[11px] text-gray-400 font-semibold tracking-widest uppercase">
                Powered by AI Analysis
              </p>
            </div>

            {/* RIGHT SECTION */}
            <div className="md:col-span-4 px-8 md:px-14 py-14 flex flex-col">
              {/* HEADER */}
              <h1 className="text-4xl font-bold text-gray-800 leading-tight mb-3 md:ms-30">
                Upload Your Resume
              </h1>
              <p className="text-gray-600 max-w-xl mb-10 md:ms-30">
                Upload your resume to receive AI-generated interview questions
                based on your skills, projects, and experience.
              </p>

              {/* UPLOAD BOX */}
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-pink-300 rounded-xl 
                     h-[38vh] max-w-2xl w-full mx-auto
                     flex flex-col items-center justify-center
                     text-center cursor-pointer
                     hover:border-pink-400 hover:bg-pink-50
                     transition-all duration-300"
              >
                <input {...getInputProps()} />
                <img src="border.png" className="w-28 mb-4" />
                <p className="font-semibold text-gray-700">
                  Upload your resume
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag & drop or click to upload
                </p>
              </div>

              {/* FILE STATUS */}
              {file && (
                <p className="mt-4 text-sm text-green-600 text-center">
                  ✅ {file.name} uploaded successfully
                </p>
              )}

              {/* CTA BUTTON */}
              <button
                onClick={analyzeInterview}
                className="mt-8 self-center bg-pink-400 text-white 
                     px-10 py-4 rounded-lg font-semibold
                     hover:bg-pink-500 transition duration-300 shadow-md"
              >
                Generate Questions
              </button>
            </div>
          </div>
        )}

        {/* Page 2 - Generate question  */}

        {showQuestionsUI && !startPractice && (
          <div className="col-span-6 min-h-screen bg-white p-6 md:pb-0">
            {/* TOP TABS */}
            <div className="w-full flex flex-col md:flex-row items-center justify-center md:justify-between mb-6 ">
              <div className="flex  justify-center gap-2 md:gap-2 bg-pink-50 px-2 md:px-4 py-2 rounded-2xl shadow-inner">
                {sections.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => SetActiveSection(tab)}
                    className={`px-3 sm:px-6 md:px-36 py-2 rounded-xl font-semibold text-sm sm:text-base md:text-base transition-all duration-300
              ${
                activeSection === tab
                  ? "bg-pink-300 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-pink-200"
              }
            `}
                  >
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            {/* QUESTION BOX */}
            <div className="mt-3 md:mt-10 flex flex-col md:flex-row items-center justify-center md:gap-10 ">
              <div className=" h-[50vh] md:h-[72vh] flex flex-col items-center justify-center ">
                <motion.img
                  src="robot.png"
                  className="w-50 h-50 md:w-70 md:h-70 me-4"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: isSpeaking ? [1, 1.08, 1] : 1,
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: isSpeaking ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                />

                {isSpeaking ? (
                  <div className="flex gap-2 mt-1 mb-4">
                    {[...Array(6)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="w-2 h-6 bg-pink-300 rounded-full"
                        animate={{ scaleY: [1, 2, 1] }}
                        transition={{
                          duration: 0.5,

                          repeat: Infinity,

                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-1 font-medium text-gray-600"
                  >
                    Hi, Pinkyy here! 💗 <br />
                    <span className="text-pink-400">Ready to start?</span>
                  </motion.p>
                )}

                <button
                  onClick={() => {
                    setMode("practice");
                    setCurrentIndex(0);
                    setTransitionText("Preparing practice mode…");
                    setTransitionLoading(true);

                    setTimeout(() => {
                      setTransitionLoading(false);
                      setStartPractice(true);
                    }, 3000);
                  }}
                  className="bg-pink-300 text-white px-8 py-4 rounded-full cursor-pointer mt-5 hover:bg-pink-400 hover:translate-y-[-3px] active:scale-90 transition-all duration-200
  "
                >
                  Start Practice
                </button>
              </div>
              {/* right panel with Questions */}
              <div className="md:w-[75%] h-[72vh] border-2 border-gray-400 rounded-xl p-6 overflow-y-scroll bg-white shadow-md">
                <h2 className="text-2xl font-bold text-pink-400 mb-4 text-center">
                  {activeSection} Questions
                </h2>

                {(() => {
                  const qArray = questions[activeSection] || [];

                  return (
                    <div className="space-y-8">
                      {qArray.map((item, idx) => (
                        <div key={idx} className="mb-6">
                          <p className="font-bold text-gray-800">
                            Q{idx + 1}. {item.q}
                          </p>
                          <p className="mt-2 text-gray-600 pl-4">{item.a}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex justify-center md:justify-end gap-4 mt-5 md:mt-4">
              <button
                className="px-6 py-2 rounded-full text-white bg-pink-300 shadow hover:bg-pink-400 hover:translate-y-[-3px] active:scale-90 transition-all duration-200
"
                onClick={() => {
                  setMode("interview");
                  setSectionIndex(0);
                  SetActiveSection(sections[sectionIndex]);
                  setCurrentIndex(0);
                  setTransitionText("Starting Mock Interview");
                  setTransitionLoading(true);

                  setTimeout(() => {
                    setTransitionLoading(false);
                    setStartPractice(true);
                  }, 3000);
                }}
              >
                Start Interview
              </button>
              <button
                onClick={() => {
                  setTransitionText("Back To Upload Page...");
                  setTransitionLoading(true);
                  setTimeout(() => {
                    setTransitionLoading(false);
                    setShowQuestionsUI(false);
                  }, 2000);
                }}
                className="px-8 py-3 rounded-full text-pink-400 bg-white border-2 border-pink-200 shadow hover:bg-pink-50 hover:translate-y-[-3px] active:scale-90 transition-all duration-200
 font-bold"
                title="Go Home"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Page 3 - Practice Question */}

        {startPractice && (
          <div className="w-full min-h-screen flex flex-col items-center justify-between  ">
            <div className="w-full text-center">
              <p className="  text-xl font-bold bg-pink-300 p-2 text-gray-50">
                {activeSection} Round
              </p>
            </div>

            {/* TOP SECTION */}
            <div className="w-full flex items-center justify-between px-10 pt-4 ">
              <p className="text-xl font-semibold text-gray-600">
                {currentIndex + 1}/{questions[computedSection]?.length}
              </p>

              <div className="flex gap-2 md:ms-40  ">
                <button
                  onClick={() => {
                    // stop recording if active
                    if (isRecording) {
                      mediaRecorderRef.current?.stop();
                      setIsRecording(false);
                    }

                    // stop any speaking voice
                    window.speechSynthesis.cancel();

                    // NEW interview session
                    setSessionId(uuidv4());

                    // reset practice state
                    setCurrentIndex(0);
                    SetActiveSection(activeSection); // optional but recommended
                  }}
                  className="md:ms-250 mb-2 px-6 py-2 rounded-full text-white bg-pink-300 shadow hover:bg-pink-200 transition"
                >
                  Start Again
                </button>

                <button
                  onClick={() => setShowExitModal(true)}
                  className=" mb-2 px-6 py-2 rounded-full text-white bg-pink-300 shadow hover:bg-pink-200 transition"
                  title="Go Home"
                >
                  Exit
                </button>
              </div>
            </div>

            {/* LEFT SECTION */}
            <div className="flex flex-col md:flex-row w-full px-6 md:px-10 mt-5 gap-4">
              {/* ROBOT */}
              <div className="flex justify-center md:w-1/4 w-full">
                <div className="flex flex-col items-center">
                  <motion.img
                    src="robot.png"
                    className="w-50 h-50 md:w-70 md:h-70 me-4"
                    initial={{}}
                    animate={{
                      scale: isSpeaking ? [1, 1.04, 1] : 1,
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: isSpeaking ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  />
                  {/* voice wave in bottom of robot */}
                  {isSpeaking ? (
                    <div className="flex gap-2 mt-1 mb-4">
                      {[...Array(6)].map((_, i) => (
                        <motion.span
                          key={i}
                          className="w-2 h-6 bg-pink-300 rounded-full"
                          animate={{ scaleY: [1, 2, 1] }}
                          transition={{
                            duration: 0.5,

                            repeat: Infinity,

                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center mt-1 font-medium text-gray-600"
                    >
                      Hi, Pinkyy here! 💗 <br />
                      <span className="text-gray-600">
                        Start speaking When You Are Ready{" "}
                      </span>
                    </motion.p>
                  )}
                </div>
              </div>

              {/* QUESTION BOX */}
              <div className="flex flex-col md:w-200 w-full">
                <div
                  className="
    border border-gray-300
    rounded-tl-3xl rounded-tr-3xl rounded-br-3xl rounded-bl-md
    px-4 sm:px-8 lg:px-20
    py-4
    w-full
    min-h-[80px]
    text-center
    shadow-sm
    bg-white
    overflow-hidden
  "
                >
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentIndex}
                      initial={{ x: 60, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -60, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="text-base md:text-xl font-semibold text-gray-800"
                    >
                      Q{currentIndex + 1}.{" "}
                      {questions[computedSection][currentIndex]?.q}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Voice Wave Animation */}
                {isRecording && (
                  <div className="voice-wave md:mt-50 md:me-20 mt-8 flex justify-center ">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="wave-bar"></div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* BOTTOM BUTTONS */}
            <div className="flex flex-col items-center justify-center md:ms-6 mt-10 gap-6 mb-5">
              {/* SPEAK NOW BUTTON */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all
    ${
      isRecording
        ? "bg-pink-400 animate-pulse ring-8 ring-pink-300/50"
        : "bg-pink-300 hover:bg-pink-400"
    }
  `}
              >
                {isRecording ? (
                  <FaStop size={40} className="text-white" />
                ) : (
                  <FaMicrophone size={40} className="text-white" />
                )}
              </button>

              <button
                onClick={skipQuestion}
                disabled={isRecording}
                className={`px-10 py-3 border rounded-xl text-gray-700
    ${
      isRecording
        ? "opacity-40 cursor-not-allowed bg-gray-100"
        : "hover:bg-gray-100"
    }`}
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loader-ANalyze interview */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pink-100/80 backdrop-blur-md p-6 md:p-0">
          <div className=" rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-6 animate-fadeIn">
            {/* Robot */}
            <img src="/robot.png" className="w-32 animate-bounceSlow" />

            {/* Text */}
            <h2 className="text-2xl font-bold text-pink-400 text-center">
              Analyzing Your Interview
            </h2>

            {/* Dots loader */}
            <div className="flex gap-2">
              <span className="dot"></span>
              <span className="dot delay-200"></span>
              <span className="dot delay-400"></span>
            </div>

            <p className="text-gray-500 text-sm">Please Wait.....</p>
          </div>
        </div>
      )}

      {/* completed screen */}
      {showCompletionScreen && (
        <InterviewCompleted
          sessionId={sessionId}
          answered={answeredCount}
          skipped={skippedCount}
          feedback={feedback}
          onNextRound={() => {
            setTransitionText("Restarting interview...");
            setTransitionLoading(true);

            setTimeout(() => {
              setShowCompletionScreen(false);
              setMode("interview");
              setSectionIndex(0);
              SetActiveSection(sections[0]);
              setCurrentIndex(0);
              setQuestionStatus({});
              setSessionId(uuidv4());

              setStartPractice(true);
              setTransitionLoading(false);
            }, 2200);

            // later you can route to round 2
          }}
        />
      )}

      {/* Exit button pop box */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-5 md:p-0">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full border border-pink-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Exit Practice?
            </h2>
            <p className="text-gray-600 mb-8">
              Are you sure you want to exit the practice session?
            </p>

            <div className="flex justify-center gap-6">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-6 py-2 rounded-full border border-gray-400 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowExitModal(false);

                  setTransitionText("Returning to questions…");
                  setTransitionLoading(true);

                  setTimeout(() => {
                    setSessionId(uuidv4());
                    setTransitionLoading(false);
                    setStartPractice(false);
                    setShowQuestionsUI(true);
                    setCurrentIndex(0);
                  }, 2000);
                }}
                className="px-6 py-2 rounded-full bg-pink-300 text-white hover:bg-pink-400"
              >
                Yes, Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Resume;
