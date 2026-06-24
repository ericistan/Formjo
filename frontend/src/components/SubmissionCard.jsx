import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VoiceRecorder from "./VoiceRecorder";
import { extractYouTubeId } from "../utils/youtube";
import { apiFetch } from "../utils/api";

const SubmissionCard = ({ submission, token, attemptNumber, viewerRole = "student" }) => {
  const isCoach = viewerRole === "coach";
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [sending, setSending] = useState(false);

  async function fetchComments() {
    const response = await apiFetch(`/comment?submission_id=${submission.id}`, token);
    if (response.ok) setComments(await response.json());
  }

  useEffect(() => {
    fetchComments();
  }, [submission.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() && !audioBlob) return;
    setSending(true);

    let finalAudioUrl = null;
    if (audioBlob) {
      const formData = new FormData();
      formData.append("file", audioBlob, "voice-comment.webm");
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`,
        { method: "POST", body: formData },
      );
      const uploadData = await uploadRes.json();
      finalAudioUrl = uploadData.secure_url;
      URL.revokeObjectURL(audioPreviewUrl);
    }

    const response = await apiFetch("/comment", token, {
      method: "POST",
      body: JSON.stringify({
        submission_id: submission.id,
        body: text || null,
        audio_url: finalAudioUrl,
      }),
    });
    if (response.ok) {
      setText("");
      setAudioBlob(null);
      setAudioPreviewUrl(null);
      fetchComments();
    }
    setSending(false);
  }

  async function handleDeleteComment(commentId) {
    const response = await apiFetch(`/comment/${commentId}`, token, { method: "DELETE" });
    if (response.ok) fetchComments();
  }

  const getAuthorLabel = (c) => {
    const commentIsCoach = c.author_role === "coach";
    if (isCoach) return commentIsCoach ? "You" : c.author_name;
    return commentIsCoach ? `Coach ${c.author_name}` : "You";
  };

  return (
    <div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden">
      {/* Attempt header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Attempt {attemptNumber}
          </span>
          {isCoach && submission.student_name && (
            <>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs font-semibold">{submission.student_name}</span>
            </>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(submission.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Video */}
      {submission.media_type === "youtube" ? (
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${extractYouTubeId(submission.media_url)}`}
            title="Submission video"
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      ) : (
        <video src={submission.media_url} controls className="w-full" />
      )}

      {/* Notes */}
      {submission.notes && (
        <div className="flex flex-col gap-1 px-4 pt-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {isCoach ? "Student notes" : "Your notes"}
          </p>
          <p className="text-sm">{submission.notes}</p>
        </div>
      )}

      {/* Feedback thread */}
      <div className="m-4 rounded-lg bg-muted overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Feedback
          </p>
        </div>

        {comments.length === 0 ? (
          <div className="px-4 py-4">
            <p className="text-sm text-muted-foreground">No feedback yet.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {comments.map((c) => (
              <div key={c.id} className="flex flex-col gap-1.5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{getAuthorLabel(c)}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                  {isCoach && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-muted-foreground hover:text-destructive text-sm leading-none shrink-0"
                      title="Delete"
                    >
                      ×
                    </button>
                  )}
                </div>
                {c.body && <p className="text-sm leading-relaxed">{c.body}</p>}
                {c.audio_url && (
                  <audio src={c.audio_url} controls className="w-full h-8 mt-1" />
                )}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-3 border-t border-border">
          {audioPreviewUrl ? (
            <div className="flex items-center gap-2">
              <audio src={audioPreviewUrl} controls className="flex-1 h-8" />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(audioPreviewUrl);
                  setAudioBlob(null);
                  setAudioPreviewUrl(null);
                }}
                className="text-xs text-muted-foreground hover:text-destructive shrink-0"
                title="Discard recording"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder={isCoach ? "Leave feedback..." : "Reply to feedback..."}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="bg-background"
              />
              <VoiceRecorder
                onAudioReady={(blob) => {
                  setAudioBlob(blob);
                  setAudioPreviewUrl(URL.createObjectURL(blob));
                }}
              />
            </div>
          )}
          <Button type="submit" size="sm" disabled={(!text.trim() && !audioBlob) || sending}>
            {sending ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SubmissionCard;
