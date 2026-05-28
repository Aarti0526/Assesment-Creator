import { useCallback, useRef, useState } from "react";

function playSfx(src: string) {
   const audio = new Audio(src);
   audio.volume = 0.5;
   audio.play().catch(() => {});
}

interface UseSpeechToTextOptions {
   onTranscript: (text: string) => void;
}

export function useSpeechToText({ onTranscript }: UseSpeechToTextOptions) {
   const [isRecording, setIsRecording] = useState(false);
   const [isTranscribing, setIsTranscribing] = useState(false);
   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
   const chunksRef = useRef<Blob[]>([]);

   const startRecording = useCallback(async () => {
      try {
         const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
         });

         const mediaRecorder = new MediaRecorder(stream, {
            mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
               ? "audio/webm;codecs=opus"
               : "audio/webm",
         });

         chunksRef.current = [];

         mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
               chunksRef.current.push(e.data);
            }
         };

         mediaRecorder.onstop = async () => {
            stream.getTracks().forEach((track) => track.stop());

            const audioBlob = new Blob(chunksRef.current, {
               type: "audio/webm",
            });

            if (audioBlob.size === 0) return;

            setIsTranscribing(true);
            try {
               const formData = new FormData();
               formData.append("file", audioBlob, "recording.webm");

               const response = await fetch("/api/transcribe", {
                  method: "POST",
                  body: formData,
               });

               if (response.ok) {
                  const data = await response.json();
                  if (data.text) {
                     onTranscript(data.text);
                  }
               }
            } finally {
               setIsTranscribing(false);
            }
         };

         mediaRecorderRef.current = mediaRecorder;
         mediaRecorder.start();
         playSfx("/assets/sound-fx/voice-on.mp3");
         setIsRecording(true);
      } catch {
         // User denied mic permission or browser doesn't support it
      }
   }, [onTranscript]);

   const stopRecording = useCallback(() => {
      if (mediaRecorderRef.current?.state === "recording") {
         mediaRecorderRef.current.stop();
         playSfx("/assets/sound-fx/voice-end.mp3");
         setIsRecording(false);
      }
   }, []);

   const toggleRecording = useCallback(() => {
      if (isRecording) {
         stopRecording();
      } else {
         startRecording();
      }
   }, [isRecording, startRecording, stopRecording]);

   return {
      isRecording,
      isTranscribing,
      toggleRecording,
   };
}
