import { useState, useRef, useId } from "react";
import { Mic } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const CONSENT_KEY = "formjo_voice_consent";

// VoiceRecorder manages three states: idle, confirming (consent), and recording.
// When recording stops it calls onAudioReady(blob) — the parent owns preview + upload.
const VoiceRecorder = ({ onAudioReady }) => {
  // Check localStorage on first render — if already consented, skip the notice forever
  const [consented] = useState(() => !!localStorage.getItem(CONSENT_KEY));
  const [state, setState] = useState("idle"); // "idle" | "confirming" | "recording"
  const [dontShowAgain, setDontShowAgain] = useState(true);
  const checkboxId = useId();
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  function handleMicClick() {
    if (consented) {
      startRecording();
    } else {
      setState("confirming");
    }
  }

  function handleConsent() {
    if (dontShowAgain) localStorage.setItem(CONSENT_KEY, "true");
    startRecording();
  }

  function handleDecline() {
    setState("idle");
  }

  // Start recording audio using the MediaRecorder API.
  //getUserMedia asks the browser for microphone access and returns a live stream.
  //MediaRecorer creates a blob of audio data from the stream.
  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];

    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      stream.getTracks().forEach((t) => t.stop());
      onAudioReady(blob);
      setState("idle");
    };

    recorder.start();
    recorderRef.current = recorder;
    setState("recording");
  }

  function stopRecording() {
    recorderRef.current?.stop();
  }

  if (state === "recording") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-500/10 border border-red-400/30 w-full">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
        <span className="text-xs text-red-500 font-medium">Recording...</span>
        <button
          type="button"
          onClick={stopRecording}
          className="ml-auto text-xs text-red-500 hover:text-red-400 font-medium shrink-0"
        >
          Stop
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleMicClick}
        className="shrink-0 h-9 w-9 flex items-center justify-center rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        title="Record voice comment"
      >
        <Mic size={16} />
      </button>

      {/* Consent dialog — renders as a modal overlay, stays out of the flex row */}
      <AlertDialog
        open={state === "confirming"}
        onOpenChange={(open) => !open && handleDecline()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Before you record</AlertDialogTitle>
            <AlertDialogDescription>
              Voice comments are uploaded to our media server. Don't include
              sensitive personal information in your recording.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              id={checkboxId}
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="h-4 w-4 accent-primary cursor-pointer"
            />
            <label
              htmlFor={checkboxId}
              className="text-sm text-muted-foreground cursor-pointer select-none"
            >
              Don't show this again
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDecline}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConsent}>
              Got it, record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VoiceRecorder;
