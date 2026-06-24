import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../utils/api";
import { ChevronLeft } from "lucide-react";
import { extractYouTubeId } from "../../../utils/youtube";
import SubmissionCard from "../../../components/SubmissionCard";

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
      apiFetch(`/lesson/${lessonId}`, token),
      // Submissions are filtered by both assignment_id AND lesson_id — a student could submit to multiple lessons
      apiFetch(`/submission?assignment_id=${id}&lesson_id=${lessonId}`, token),
    ]);
    if (lessonRes.ok) setLesson(await lessonRes.json());
    if (subRes.ok) setSubmissions(await subRes.json());

    // Third fetch runs after — we need the assignment detail to find is_complete for this specific lesson
    // The assignment endpoint returns all lessons with their completion status
    const assignRes = await apiFetch(`/assignment/${id}`, token);
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
    const response = await apiFetch(`/assignment/${id}/lesson/${lessonId}/complete`, token, { method });
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
              viewerRole="coach"
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CoachAssignmentLesson;
