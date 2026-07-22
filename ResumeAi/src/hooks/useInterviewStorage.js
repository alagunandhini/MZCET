import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const useInterviewStorage = ({
  showQuestionsUI,
  startPractice,
  questions,
  currentIndex,
  sectionIndex,
  sessionId,
  showCompletionScreen,
  feedback,

  setShowQuestionsUI,
  setStartPractice,
  setQuestions,
  setCurrentIndex,
  setSectionIndex,
  setSessionId,
  setShowCompletionScreen,
  setFeedback,
}) => {
  const [hydrated, setHydrated] = useState(false);

  // Save state whenever it changes
  useEffect(() => {
    if (!hydrated) return;

   
 const appState = {
      showQuestionsUI,
      startPractice,
      questions,
      currentIndex,
      sectionIndex,
      sessionId,
      showCompletionScreen,
      feedback,
    };

    localStorage.setItem("interviewState", JSON.stringify(appState));
  }, [
    hydrated,
    showQuestionsUI,
    startPractice,
    questions,
    currentIndex,
    sectionIndex,
    sessionId,
    showCompletionScreen,
    feedback,
  ]);

  // Restore state after refresh
  useEffect(() => {
    const savedState = localStorage.getItem("interviewState");

    if (savedState) {
      const state = JSON.parse(savedState);

    setShowQuestionsUI(state.showQuestionsUI ?? false);
      setStartPractice(state.startPractice ?? false);
      setQuestions(state.questions || []);
      setCurrentIndex(state.currentIndex ?? 0);
      setSectionIndex(state.sectionIndex ?? 0);
      setSessionId(state.sessionId || uuidv4());
      setShowCompletionScreen(state.showCompletionScreen ?? false);
      setFeedback(state.feedback ?? null);
    }

    setHydrated(true);
  }, [
    setShowQuestionsUI,
    setStartPractice,
    setQuestions,
    setCurrentIndex,
    setSectionIndex,
    setSessionId,
    setShowCompletionScreen,
    setFeedback,
  ]);

  return hydrated;
};

export default useInterviewStorage;