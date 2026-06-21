import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SubmissionCard = ({ submission, token }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    async function fetchComments() {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/comment?submission_id=${submission.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.ok) setComments(await response.json());
    }
    fetchComments();
  }, [submission.id]);

  return (
    <div className="flex flex-col gap-2 border border-border rounded-lg p-4">
      <video src={submission.media_url} controls className="w-full rounded-md" />
      {submission.notes && (
        <p className="text-sm text-muted-foreground">{submission.notes}</p>
      )}
      <p className="text-xs text-muted-foreground">
        {new Date(submission.created_at).toLocaleDateString()}
      </p>
      {comments.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Coach feedback</p>
          {comments.map((c) => (
            <div key={c.id} className="flex flex-col gap-0.5">
              <p className="text-sm">{c.body}</p>
              <p className="text-xs text-muted-foreground">{c.author_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function extractYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

const StudentLessonDetail = () => {
  const { id, lessonId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [notes, setNotes] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const selectClass =
    "border-input bg-background text-foreground flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  async function fetchData() {
    const [lessonRes, subRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/lesson/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${import.meta.env.VITE_API_URL}/submission?assignment_id=${id}&lesson_id=${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    const lessonData = await lessonRes.json();
    if (lessonRes.ok) setLesson(lessonData);
    if (subRes.ok) setSubmissions(await subRes.json());
  }

  useEffect(() => {
    fetchData();
  }, [lessonId]);

  function handleCloudinaryUpload() {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        sources: ["local", "url", "camera"],
        resourceType: "video",
        maxFileSize: 100000000,
      },
      (error, result) => {
        if (!error && result.event === "success") {
          setMediaUrl(result.info.secure_url);
        }
      },
    );
    widget.open();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!mediaUrl) return;
    setUploading(true);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/submission`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        assignment_id: Number(id),
        lesson_id: Number(lessonId),
        media_url: mediaUrl,
        media_type: "video",
        notes: notes || null,
      }),
    });
    if (response.ok) {
      setNotes("");
      setMediaUrl("");
      setMediaType("");
      fetchData();
    }
    setUploading(false);
  }

  if (!lesson)
    return <p className="p-6 text-muted-foreground">Loading lesson...</p>;

  return (
    <div className="py-8 max-w-lg mx-auto flex flex-col gap-6">
      <button
        onClick={() => navigate(`/student/assignments/${id}`)}
        className="text-sm text-muted-foreground hover:text-foreground self-start"
      >
        ← Back to module
      </button>

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl">{lesson.title}</h1>
        <p className="text-sm text-muted-foreground">
          {lesson.category} · {lesson.difficulty}
        </p>
        {lesson.description && <p>{lesson.description}</p>}
      </div>

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
        <h2 className="font-display text-2xl">My Submissions</h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          submissions.map((sub) => (
            <SubmissionCard key={sub.id} submission={sub} token={token} />
          ))
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium">Add a submission</h3>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="media_type">Media type</Label>
            <select
              id="media_type"
              value={mediaType}
              onChange={(e) => { setMediaType(e.target.value); setMediaUrl(""); }}
              className={selectClass}
            >
              <option value="">Select type</option>
              <option value="upload">Upload video</option>
              <option value="url">Video URL</option>
            </select>
          </div>

          {mediaType === "upload" && (
            <div className="flex flex-col gap-2">
              <Button type="button" variant="outline" onClick={handleCloudinaryUpload}>
                Upload video
              </Button>
              {mediaUrl && (
                <video src={mediaUrl} controls className="w-full rounded-md" />
              )}
            </div>
          )}

          {mediaType === "url" && (
            <div className="flex flex-col gap-2">
              <Input
                placeholder="https://..."
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
              {mediaUrl && (
                <video src={mediaUrl} controls className="w-full rounded-md" />
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">
              Notes <span className="text-muted-foreground">(optional)</span>
            </Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. This is my jab cross attempt"
              rows={2}
              className="border-input bg-background text-foreground flex w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <Button type="submit" disabled={!mediaUrl || uploading}>
            {uploading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default StudentLessonDetail;
