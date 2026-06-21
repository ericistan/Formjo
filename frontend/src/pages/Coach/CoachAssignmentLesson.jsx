import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function extractYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

const SubmissionCard = ({ submission, token }) => {
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState("");

  async function fetchComments() {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/comment?submission_id=${submission.id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.ok) setComments(await response.json());
  }

  useEffect(() => {
    fetchComments();
  }, [submission.id]);

  async function handleComment(e) {
    e.preventDefault();
    if (!body.trim()) return;
    const response = await fetch(`${import.meta.env.VITE_API_URL}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ submission_id: submission.id, body }),
    });
    if (response.ok) {
      setBody("");
      fetchComments();
    }
  }

  async function handleDeleteComment(commentId) {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/comment/${commentId}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.ok) fetchComments();
  }

  return (
    <div className="flex flex-col gap-3 border border-border rounded-lg p-4">
      <video src={submission.media_url} controls className="w-full rounded-md" />
      {submission.notes && (
        <p className="text-sm text-muted-foreground">{submission.notes}</p>
      )}
      <p className="text-xs text-muted-foreground">
        {submission.student_name} · {new Date(submission.created_at).toLocaleDateString()}
      </p>

      <div className="flex flex-col gap-2 pt-2 border-t border-border">
        {comments.length === 0 ? (
          <p className="text-xs text-muted-foreground">No feedback yet.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm">{c.body}</p>
                <p className="text-xs text-muted-foreground">{c.author_name}</p>
              </div>
              <button
                onClick={() => handleDeleteComment(c.id)}
                className="text-muted-foreground hover:text-destructive text-lg leading-none shrink-0"
              >
                ×
              </button>
            </div>
          ))
        )}
        <form onSubmit={handleComment} className="flex gap-2 mt-1">
          <Input
            placeholder="Leave feedback..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button type="submit" size="sm">Send</Button>
        </form>
      </div>
    </div>
  );
};

const CoachAssignmentLesson = () => {
  const { id, lessonId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  async function fetchData() {
    const [lessonRes, subRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/lesson/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(
        `${import.meta.env.VITE_API_URL}/submission?assignment_id=${id}&lesson_id=${lessonId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    ]);
    if (lessonRes.ok) setLesson(await lessonRes.json());
    if (subRes.ok) setSubmissions(await subRes.json());

    const assignRes = await fetch(
      `${import.meta.env.VITE_API_URL}/assignment/${id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (assignRes.ok) {
      const assignData = await assignRes.json();
      const found = assignData.lessons.find((l) => l.id === Number(lessonId));
      if (found) setIsComplete(found.is_complete);
    }
  }

  useEffect(() => {
    fetchData();
  }, [id, lessonId]);

  async function handleToggleComplete() {
    const method = isComplete ? "DELETE" : "POST";
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/assignment/${id}/lesson/${lessonId}/complete`,
      { method, headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.ok) fetchData();
  }

  if (!lesson)
    return <p className="p-6 text-muted-foreground">Loading lesson...</p>;

  return (
    <div className="py-8 max-w-lg mx-auto flex flex-col gap-6">
      <button
        onClick={() => navigate(`/coach/assignments/${id}`)}
        className="text-sm text-muted-foreground hover:text-foreground self-start"
      >
        ← Back to assignment
      </button>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-4xl">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground">
            {lesson.category} · {lesson.difficulty}
          </p>
        </div>
        <button
          onClick={handleToggleComplete}
          className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors mt-1 ${
            isComplete
              ? "bg-green-500 border-green-500 text-white"
              : "border-border hover:border-foreground"
          }`}
          title={isComplete ? "Mark incomplete" : "Mark complete"}
        >
          {isComplete && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>

      {lesson.description && <p>{lesson.description}</p>}

      {lesson.media_type === "youtube" && lesson.media_url && (
        <div className="aspect-video rounded-md overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${extractYouTubeId(lesson.media_url)}`}
            title="Lesson video"
            className="w-full h-full"
            allowFullScreen
          />
        </div>
      )}
      {lesson.media_type === "upload" && lesson.media_url && (
        <video src={lesson.media_url} controls className="w-full rounded-md" />
      )}

      {lesson.steps && lesson.steps.length > 0 && (
        <ol className="flex flex-col gap-2">
          {lesson.steps.map((step) => (
            <li key={step.id} className="flex gap-3">
              <span className="text-muted-foreground shrink-0">{step.order_index}.</span>
              <span>{step.instruction}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-2xl">Submissions</h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          submissions.map((sub) => (
            <SubmissionCard key={sub.id} submission={sub} token={token} />
          ))
        )}
      </div>
    </div>
  );
};

export default CoachAssignmentLesson;
