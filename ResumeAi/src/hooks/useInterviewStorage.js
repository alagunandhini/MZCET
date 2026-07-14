import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const useInterviewStorage = ({
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
}) => {
  const [hydrated, setHydrated] = useState(false);

// storing each state, when each state changes
  // Save state
  useEffect(() => {
    if (!hydrated) return;

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
  // Restore state
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

  return hydrated;
};

export default useInterviewStorage;