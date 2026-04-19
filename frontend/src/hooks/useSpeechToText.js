import { useState, useRef, useEffect } from "react";
import useCurrentOrgCurrency from "./useCurrentOrgCurrency";

export const useSpeechToText = (onTranscriptionComplete) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognition = useRef(null);
  const silenceTimer = useRef(null);
  const {setting} = useCurrentOrgCurrency();
  const localeCode = setting?.localeCode || "en-IN"
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) setIsSupported(true);
  }, []);

  const resetSilenceTimer = () => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(() => {
      stopListening();
    }, 2000);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    recognition.current = new SpeechRecognition();
    recognition.current.continuous = true;
    recognition.current.interimResults = true;
    recognition.current.lang = "en-US";

    recognition.current.onstart = () => {
      setIsListening(true);
      resetSilenceTimer();
    };

    recognition.current.onresult = (event) => {
      resetSilenceTimer();
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      
      if (event.results[0].isFinal) {
        onTranscriptionComplete(transcript);
      }
    };

    recognition.current.onerror = () => setIsListening(false);
    recognition.current.onend = () => setIsListening(false);

    recognition.current.start();
  };

  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop();
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      setIsListening(false);
    }
  };

  return { isListening, isSupported, startListening, stopListening };
};