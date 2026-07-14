import { useState } from "react";

const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakText = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.8;
    utter.pitch = 1.1;

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
        ) || voices[0];

      utter.voice = femaleVoice;
      window.speechSynthesis.speak(utter);
    };

    const voices = window.speechSynthesis.getVoices();

    if (voices.length > 0) {
      setFemaleVoiceAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = setFemaleVoiceAndSpeak;
    }
  };

  return {
    speakText,
    isSpeaking,
  };
};

export default useSpeech;