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
import RoundDashboard from "./RoundDashboard";
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
  }, 1100);
    }


  };

  checkResume();

}, []);

const [questions, setQuestions] = useState({
  HR: [],
  Technical: [],
  Stress: [],
  Scenario: []
});// store generated questions
  const [loading, setLoading] = useState(false);
  const [showQuestionsUI, setShowQuestionsUI] = useState(false);
  const [transitionLoading, setTransitionLoading] = useState(false);
  const [transitionText, setTransitionText] = useState("");
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [questionStatus, setQuestionStatus] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
const { speakText, isSpeaking } = useSpeech();
  const sections = ["HR", "Technical", "Stress", "Scenario"];

  const [startPractice, setStartPractice] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [sessionId, setSessionId] = useState(uuidv4());
  const [feedback, setFeedback] = useState(null);
 
  const [sectionIndex, setSectionIndex] = useState();
  const [selectedRound, setSelectedRound] = useState(0);
const currentSection = sections[sectionIndex];
const [completedRounds, setCompletedRounds] = useState([]);
const question =
questions[currentSection]?.[currentIndex]?.q;
  const hydrated = useInterviewStorage({
  showQuestionsUI,
  startPractice,
  questions,
  currentIndex,
  sectionIndex,

  sessionId,

  setShowQuestionsUI,
  setStartPractice,
  setQuestions,

  setCurrentIndex,
  setSectionIndex,

  setSessionId,
});

useEffect(() => {
  if (!startPractice) return;

  const question = questions[currentSection]?.[currentIndex]?.q;

  if (question) {
    speakText(question);
  }
}, [startPractice, currentSection, currentIndex, questions]);


 

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // for start recording
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunks.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
      const key = `${currentSection}-${currentIndex}`;
      

      setQuestionStatus((prev) => ({
        ...prev,
        [key]: "answered",
      }));

    
      // send these data to backend to save in db and also convert audio into text
      const formData = new FormData();
      formData.append("audio", audioBlob, "answer.webm");
      formData.append("question", questions[currentSection][currentIndex]?.q);
      formData.append("sessionId", sessionId);

      const isLastQuestion =
        currentIndex === questions[currentSection].length - 1

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

  // for stop recording
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
         
        // unlock next round
  setCompletedRounds(prev => [
    ...prev,
    sectionIndex
  ]);

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

// funstion to move question
const next = () => {
  const totalQuestions = questions[currentSection]?.length || 0;
  // move to next question
  if (currentIndex < totalQuestions - 1) {
    setCurrentIndex((prev) => prev + 1);
  
  }

};

  // skip question logic
  const skipQuestion = () => {
    const key = `${currentSection}-${currentIndex}`;
    // mark skipped only if not answered
    setQuestionStatus((prev) => ({
      ...prev,
      [key]: prev[key] || "skipped",
    }));
    next();
  };


  // username
  const username = localStorage.getItem("username");

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
   
    setSectionIndex(0);

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

  console.log("sectionIndex:", sectionIndex);
console.log("currentSection:", currentSection);
console.log("questions:", questions);

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
<RoundDashboard

completedRounds={completedRounds}

setCompletedRounds={setCompletedRounds}

sections={sections}

selectedRound={selectedRound}
setSelectedRound={setSelectedRound}


setCurrentIndex={setCurrentIndex}
setSectionIndex={setSectionIndex}

setTransitionLoading={setTransitionLoading}
setTransitionText={setTransitionText}

setStartPractice={setStartPractice}

setShowQuestionsUI={setShowQuestionsUI}

/>
)}
{/* Page 3 - Practice Question */}

        {startPractice && (
         <InterviewRoom
  
        currentIndex={currentIndex}
        questions={questions}
        computedSection={currentSection}
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
         />  )}
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
