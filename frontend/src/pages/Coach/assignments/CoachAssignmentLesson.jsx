import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import VoiceRecorder from "../../../components/VoiceRecorder.jsx";

function extractYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

// SubmissionCard is a self-contained component — it manages its own comments state
// Props: submission (the video + notes), token (for auth headers), attemptNumber (display label)
const SubmissionCard = ({ submission, token, attemptNumber }) => {
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  const [sending, setSending] = useState(false);

  // fetchComments is defined outside useEffect so it can be called again after posting/deleting
  async function fetchComments() {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/comment?submission_id=${submission.id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.ok) setComments(await response.json());
  }

  // submission.id in the dependency array means this re-fetches if the user navigates to a different submission
  useEffect(() => {
    fetchComments();
  }, [submission.id]);

  async function handleComment(e) {
    e.preventDefault();
    if (!body.trim() && !audioBlob) return;
    setSending(true);

    // If there's a voice recording, upload the blob to Cloudinary before posting
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

    const response = await fetch(`${import.meta.env.VITE_API_URL}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        submission_id: submission.id,
        body: body || null,
        audio_url: finalAudioUrl,
      }),
    });
    if (response.ok) {
      setBody("");
      setAudioBlob(null);
      setAudioPreviewUrl(null);
      fetchComments();
    }
    setSending(false);
  }

  async function handleDeleteComment(commentId) {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/comment/${commentId}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.ok) fetchComments();
  }

  return (
    <div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden">
      {/* Attempt header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Attempt {attemptNumber}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs font-semibold">
            {submission.student_name}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(submission.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Video — render as iframe for YouTube, native <video> for direct uploads */}
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
            Student notes
          </p>
          <p className="text-sm">{submission.notes}</p>
        </div>
      )}

      {/* Feedback thread — coach sees "You" for their own comments, student name for student replies */}
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
            {comments.map((c) => {
              const isCoach = c.author_role === "coach";
              return (
                <div key={c.id} className="flex flex-col gap-1.5 px-4 py-3">
                  <div className="flex items-center gap-2">
                    {/* "You" for coach's own messages, student's name for student replies */}
                    <span className="text-xs font-semibold">
                      {isCoach ? "You" : c.author_name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                    {/* × button deletes the comment — coach can delete any comment in their thread */}
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-muted-foreground hover:text-destructive text-sm leading-none shrink-0"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                  {c.body && <p className="text-sm leading-relaxed">{c.body}</p>}
                  {c.audio_url && (
                    <audio src={c.audio_url} controls className="w-full h-8 mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={handleComment} className="flex flex-col gap-2 p-3 border-t border-border">
          {audioPreviewUrl ? (
            // Voice recorded — show preview + discard; Send button below handles upload + post
            <div className="flex items-center gap-2">
              <audio src={audioPreviewUrl} controls className="flex-1 h-8" />
              <button
                type="button"
                onClick={() => { URL.revokeObjectURL(audioPreviewUrl); setAudioBlob(null); setAudioPreviewUrl(null); }}
                className="text-xs text-muted-foreground hover:text-destructive shrink-0"
                title="Discard recording"
              >
                ✕
              </button>
            </div>
          ) : (
            // Idle — text input with mic button
            <div className="flex gap-2">
              <Input
                placeholder="Leave feedback..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
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
          <Button type="submit" size="sm" disabled={(!body.trim() && !audioBlob) || sending}>
            {sending ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
};

// CoachAssignmentLesson — the coach's view of one lesson within an assignment
// URL: /coach/assignments/:id/lessons/:lessonId
// :id = assignment ID, :lessonId = lesson ID (both extracted from URL via useParams)
const CoachAssignmentLesson = () => {
  const { id, lessonId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  // isComplete tracks whether this lesson has been marked done for this specific assignment
  const [isComplete, setIsComplete] = useState(false);

  async function fetchData() {
    // First two fetches run in parallel: lesson content + student submissions for this lesson
    const [lessonRes, subRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/lesson/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      // Submissions are filtered by both assignment_id AND lesson_id — a student could submit to multiple lessons
      fetch(
        `${import.meta.env.VITE_API_URL}/submission?assignment_id=${id}&lesson_id=${lessonId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    ]);
    if (lessonRes.ok) setLesson(await lessonRes.json());
    if (subRes.ok) setSubmissions(await subRes.json());

    // Third fetch runs after — we need the assignment detail to find is_complete for this specific lesson
    // The assignment endpoint returns all lessons with their completion status
    const assignRes = await fetch(
      `${import.meta.env.VITE_API_URL}/assignment/${id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (assignRes.ok) {
      const assignData = await assignRes.json();
      // Find this specific lesson within the assignment's lesson list
      const found = assignData.lessons.find((l) => l.id === Number(lessonId));
      if (found) setIsComplete(found.is_complete);
    }
  }

  useEffect(() => {
    fetchData();
  }, [id, lessonId]);

  async function handleToggleComplete() {
    // POST = mark complete, DELETE = mark incomplete — the backend uses the HTTP method as the toggle signal
    const method = isComplete ? "DELETE" : "POST";
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/assignment/${id}/lesson/${lessonId}/complete`,
      { method, headers: { Authorization: `Bearer ${token}` } },
    );
    // Re-fetch everything so isComplete and the button label update correctly
    if (response.ok) fetchData();
  }

  if (!lesson)
    return <p className="p-6 text-muted-foreground">Loading lesson...</p>;

  return (
    <div className="py-8 max-w-3xl mx-auto px-4 flex flex-col gap-6">
      <button
        onClick={() => navigate(`/coach/assignments/${id}`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground self-start"
      >
        <ChevronLeft className="size-4" /> Back to assignment
      </button>

      <div className="border border-border rounded-xl overflow-hidden flex flex-col">
        {lesson.media_type === "youtube" && lesson.media_url && (
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(lesson.media_url)}`}
              title="Lesson video"
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        )}
        {lesson.media_type === "upload" && lesson.media_url && (
          <video src={lesson.media_url} controls className="w-full" />
        )}
        <div className="flex flex-col gap-1 p-4">
          <h1 className="font-display text-4xl">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground">
            {lesson.category} · {lesson.difficulty}
          </p>
          {lesson.description && (
            <p className="text-sm mt-1">{lesson.description}</p>
          )}
        </div>
        <div className="px-4 pb-4">
          {/* Full-width toggle button — green when complete, reverts to neutral on hover to signal "undo" */}
          <button
            onClick={handleToggleComplete}
            className={`w-full py-2 rounded-lg text-sm font-medium border transition-colors ${
              isComplete
                ? "bg-green-500/10 text-green-600 border-green-500/30 hover:bg-red-500/10 hover:text-red-600 hover:border-red-400/40"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            {isComplete ? "✓ Lesson complete" : "Mark as complete"}
          </button>
        </div>
      </div>

      {lesson.steps && lesson.steps.length > 0 && (
        <div className="border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-display text-2xl">Steps</h2>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {lesson.steps.map((step) => (
              <div key={step.id} className="flex items-center gap-4 px-4 py-3">
                <span className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold shrink-0">
                  {step.order_index}
                </span>
                <span className="text-sm font-medium">{step.instruction}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Submissions</h2>
          {submissions.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {submissions.length} attempt{submissions.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          submissions.map((sub, index) => (
            // attemptNumber counts DOWN so the newest submission shows "Attempt 1"
            // submissions[0] is newest (returned DESC from backend), so index 0 → attemptNumber = total
            <SubmissionCard
              key={sub.id}
              submission={sub}
              token={token}
              attemptNumber={submissions.length - index}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CoachAssignmentLesson;
