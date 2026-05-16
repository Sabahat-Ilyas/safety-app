import { useState, useEffect, useCallback, useRef } from 'react';

export const useVoiceRecognition = (onTrigger) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    const startListening = useCallback(() => {
        if (!('webkitSpeechRecognition' in window)) {
            console.warn("Speech recognition not supported in this browser.");
            return;
        }

        if (isListening) return;

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event) => {
            let currentTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                currentTranscript += event.results[i][0].transcript.toLowerCase();
                if (event.results[i].isFinal) {
                    setTranscript(prev => prev + event.results[i][0].transcript);
                }
            }

            if (currentTranscript) {
                console.log("Heard (interim/final):", currentTranscript);

                // Faster Trigger Word Detection (Interim or Final)
                const emergencyKeywords = ['help', 'help me', 'bachao', 'emergency', 'save me', 'police', 'danger', 'madad', 'help please'];
                
                if (emergencyKeywords.some(kw => currentTranscript.includes(kw))) {
                    onTrigger();
                }
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            // Don't auto-stop on error, try to keep going or handle specific errors
        };

        recognition.onend = () => {
            // If we intended to keep listening, restart. 
            // But managing this restart logic with a ref check is cleaner in useEffect or explicit logic.
            // For now, if we are "isListening" state true, we restart?
            // Actually, simplest is to let the user restart or rely on the "continuous" flag.
            // If it stops (e.g. silence timeout), we might want to restart.
            if (recognitionRef.current && isListening) {
                try {
                    recognition.start();
                } catch (e) {
                    // Ignore start errors
                }
            } else {
                setIsListening(false);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [isListening, onTrigger]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
    }, []);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    return { isListening, startListening, stopListening, transcript };
};
