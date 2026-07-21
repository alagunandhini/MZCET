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

const [questions, setQuestions] = useState({});// store generated questions
  const [loading, setLoading] = useState(false);
  const [showQuestionsUI, setShowQuestionsUI] = useState(false);
  const [transitionLoading, setTransitionLoading] = useState(false);
  const [transitionText, setTransitionText] = useState("");
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [questionStatus, setQuestionStatus] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
const { speakText, isSpeaking } = useSpeech();
  const sections = Object.keys(questions);

  const [startPractice, setStartPractice] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [sessionId, setSessionId] = useState(uuidv4());
  const [feedback, setFeedback] = useState(null);
 
  const [sectionIndex, setSectionIndex] = useState(0);
  const [selectedRound, setSelectedRound] = useState(0);
const currentSection = sections[sectionIndex];
const [completedRounds, setCompletedRounds] = useState([]);
const question = questions[currentSection]?.questions?.[currentIndex]?.q;
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

 const question = questions[currentSection]?.questions?.[currentIndex]?.q

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
      formData.append("question", questions[currentSection]?.questions?.[currentIndex]?.q);
      formData.append("sessionId", sessionId);

      const isLastQuestion =
        currentIndex === questions[currentSection]?.questions?.length - 1

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
      .forEach((track) => track.stop()); // 
    setIsRecording(false);
  };

// this function executes , when last question of each round
const endInterview = async () => {
  const token = localStorage.getItem("token");

  console.log("Token:", token);

  try {
    const res = await fetch("http://localhost:3007/end-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionId,
        round: currentSection,
      }),
    });

    const data = await res.json();

    console.log("Status:", res.status);
    console.log("Response:", data);

    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }

    if (data.success) {
      setFeedback(data.feedback);

      const isPass = data.feedback.result?.toLowerCase().includes("pass");
      if (isPass) {
        setCompletedRounds(prev => [...prev, sectionIndex]);
      }

      setShowCompletionScreen(true);
    }
  } catch (err) {
    console.error("END SESSION ERROR:", err);
    showToast("Something went wrong generating your feedback. Please try again.", "error");
    // don't leave them stuck on InterviewRoom - send them back to the dashboard instead
    setShowQuestionsUI(true);
    setStartPractice(false);
  } finally {
    setIsAnalyzing(false);
  }
};


// funstion to move question
const next = () => {
 const totalQuestions = questions[currentSection]?.questions?.length || 0;
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
  setTransitionText("Back to Dashboard");
  setTransitionLoading(true);

  setTimeout(() => {
    setShowCompletionScreen(false);
    setStartPractice(false);      
    setShowQuestionsUI(true);      
    setCurrentIndex(0);
   
    setQuestionStatus({});
    setSessionId(uuidv4());
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
questions={questions}
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
         sectionName={
   questions[currentSection]?.name
 }

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
