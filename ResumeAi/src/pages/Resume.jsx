import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
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
import InterviewRoom  from "./InterviewRoom";
import InterviewLoader from "../components/InterviewLoader";
import ExitModal from "../components/ExitModal";
import QuestionPreview from "../pages/QuestionPreview";
import { CheckCircle } from "lucide-react";
import ResumeUpload from "../pages/ResumeUpload";
import useToast from "../hooks/useToast";
import useSpeech from "../hooks/useSpeech";
import useInterviewStorage from "../hooks/useInterviewStorage";
import axios from "axios";

const Resume = () => {
 const navigate = useNavigate();
 const { toast, showToast } = useToast();
 const [checkingResume, setCheckingResume] = useState(true);

 //  if token is not there then it autamatically in login page 
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
  }
}, []);

// Check whether resume already exists
useEffect(() => {

  const checkResume = async () => {
const token = localStorage.getItem("token");
  try {
      const res = await axios.get(
        "http://localhost:3007/users/resume-status",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.hasResume) {
        setShowQuestionsUI(true);
      }

    } catch (err) {
      console.log(err);
    }
     finally {
      // Always stop loading
      setTimeout(() => {
    setCheckingResume(false);
  }, 1500);
    }


  };

  checkResume();

}, []);

  const [questions, setQuestions] = useState([]); // store generated questions
  const [loading, setLoading] = useState(false);
  const [showQuestionsUI, setShowQuestionsUI] = useState(false);
  const [transitionLoading, setTransitionLoading] = useState(false);
  const [transitionText, setTransitionText] = useState("");
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [questionStatus, setQuestionStatus] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
const { speakText, isSpeaking } = useSpeech();
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
  const hydrated = useInterviewStorage({
  showQuestionsUI,
  startPractice,
  questions,
  activeSection,
  currentIndex,
  sectionIndex,
  mode,
  sessionId,

  setShowQuestionsUI,
  setStartPractice,
  setQuestions,
  SetActiveSection,
  setCurrentIndex,
  setSectionIndex,
  setMode,
  setSessionId,
});

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
          const res = await fetch("http://localhost:3007/upload-audio", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (data.success) {
            await endInterview();
          }
        } else {
          //  Fire & forget for normal questions
          fetch("http://localhost:3007/upload-audio", {
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
      const res = await fetch("http://localhost:3007/end-session", {
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
    next();
  };



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

  const handleNextRound = () => {
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
};

const handleExitPractice = () => {
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
};
 if (checkingResume) {
    return <TransitionLoader text="Checking resume..." />;
  }

  return (
    <> {toast.show && (
        <div className="fixed bottom-5 right-5 z-[100] animate-slideIn">
          <div
            className={`px-8 py-3 rounded-lg shadow-lg  text-sm ${
              toast.type === "success" ? "bg-pink-400 " : "bg-gray-900"
            } text-white flex gap-3`} >
            {toast.type === "success" ? (
              <CheckCircle size={18} className="text-pink-500" />
            ) : (
              <span className="font-extrabold  ">!</span>
            )}  {toast.message}
          </div>
        </div> )}
      
      {!showQuestionsUI && <Navbar />}
      {/* Loader for all */}
      {transitionLoading && <TransitionLoader text={transitionText} />}

  <div className="min-h-screen ">
    
     {/* Page 1 - Upload Resume */}
         {!showQuestionsUI && (
             <ResumeUpload
      setQuestions={setQuestions}
      setShowQuestionsUI={setShowQuestionsUI}
      showToast={showToast}
      setTransitionLoading={setTransitionLoading}
      setTransitionText={setTransitionText}
      setLoading={setLoading}
    />
        )}

{/* Page 2 - Generate question  */}
        {showQuestionsUI && !startPractice && (
  <QuestionPreview
    sections={sections}
    activeSection={activeSection}
    SetActiveSection={SetActiveSection}
    questions={questions}
    isSpeaking={isSpeaking}
    setMode={setMode}
    setCurrentIndex={setCurrentIndex}
    setTransitionLoading={setTransitionLoading}
    setTransitionText={setTransitionText}
    setStartPractice={setStartPractice}
    setSectionIndex={setSectionIndex}
    sectionIndex={sectionIndex}
    showQuestionsUI={showQuestionsUI}
    setShowQuestionsUI={setShowQuestionsUI}
  />
)}
{/* Page 3 - Practice Question */}

        {startPractice && (
         <InterviewRoom
        activeSection={activeSection}
        currentIndex={currentIndex}
        questions={questions}
        computedSection={computedSection}
        isSpeaking={isSpeaking}
         isRecording={isRecording}
         startRecording={startRecording}
         stopRecording={stopRecording}
         skipQuestion={skipQuestion}
         setShowExitModal={setShowExitModal}
         setSessionId={setSessionId}
         mediaRecorderRef={mediaRecorderRef}
         setIsRecording={setIsRecording}
         setCurrentIndex={setCurrentIndex}
         SetActiveSection={SetActiveSection} />  )}
      </div>


 {/* Loader-ANalyze interview */}
<InterviewLoader isAnalyzing={isAnalyzing} />

{/* interview completed page */}
{showCompletionScreen && (
  <InterviewCompleted
    sessionId={sessionId}
    answered={answeredCount}
    skipped={skippedCount}
    feedback={feedback}
    onNextRound={handleNextRound}
  />
)}

{/* exit module */}
<ExitModal
  showExitModal={showExitModal}
  onCancel={() => setShowExitModal(false)}
  onExit={handleExitPractice} />
    </>);
};
export default Resume;
