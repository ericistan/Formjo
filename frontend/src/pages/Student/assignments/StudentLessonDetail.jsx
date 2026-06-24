import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import SubmissionCard from "../../../components/SubmissionCard";
import { extractYouTubeId } from "../../../utils/youtube";

// URL: /student/assignments/:id/lessons/:lessonId
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
  const [showForm, setShowForm] = useState(false);

  // Tailwind classes for native selects/textareas to match shadcn Input styling
  const selectClass =
    "border-input bg-background text-foreground flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  // fetchData is defined outside useEffect so handleSubmit can call it to refresh after a new submission
  async function fetchData() {
    const [lessonRes, subRes] = await Promise.all([
      apiFetch(`/lesson/${lessonId}`, token),
      apiFetch(`/submission?assignment_id=${id}&lesson_id=${lessonId}`, token),
    ]);
    const lessonData = await lessonRes.json();
    if (lessonRes.ok) setLesson(lessonData);
    if (subRes.ok) setSubmissions(await subRes.json());
  }

  useEffect(() => {
    fetchData();
  }, [lessonId]);

  function handleCloudinaryUpload() {
    // window.cloudinary is the widget from the <script> tag in index.html
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
    const response = await apiFetch("/submission", token, {
      method: "POST",
      body: JSON.stringify({
        assignment_id: Number(id),
        lesson_id: Number(lessonId),
        media_url: mediaUrl,
        media_type: mediaType,
        notes: notes || null,
      }),
    });
    if (response.ok) {
      setNotes("");
      setMediaUrl("");
      setMediaType("");
      setShowForm(false);
      fetchData();
    }
    setUploading(false);
  }

  if (!lesson)
    return <p className="p-6 text-muted-foreground">Loading lesson...</p>;

  return (
    <div className="py-8 max-w-3xl mx-auto px-4 flex flex-col gap-6">
      <button
        onClick={() => navigate(`/student/assignments/${id}`)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground self-start"
      >
        <ChevronLeft className="size-4" /> Back to module
      </button>

      <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
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
        <div className="flex flex-col gap-1.5 p-4">
          <h1 className="font-display text-4xl">{lesson.title}</h1>
          <p className="text-sm text-muted-foreground">
            {lesson.category} · {lesson.difficulty}
          </p>
          {lesson.description && (
            <p className="text-sm mt-1">{lesson.description}</p>
          )}
        </div>
      </div>

      {lesson.steps && lesson.steps.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
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
          <h2 className="font-display text-2xl">My Submissions</h2>
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
            <SubmissionCard
              key={sub.id}
              submission={sub}
              token={token}
              attemptNumber={submissions.length - index}
            />
          ))
        )}

        {submissions.length > 0 && !showForm ? (
          <Button variant="outline" onClick={() => setShowForm(true)}>
            Submit another attempt
          </Button>
        ) : null}

        {(submissions.length === 0 || showForm) && (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 bg-card border border-border rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Add a submission</h3>
              {showForm && submissions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setMediaType("");
                    setMediaUrl("");
                    setNotes("");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="media_type">Media type</Label>
              <select
                id="media_type"
                value={mediaType}
                onChange={(e) => {
                  setMediaType(e.target.value);
                  setMediaUrl("");
                }}
                className={selectClass}
              >
                <option value="">Select type</option>
                <option value="upload">Upload video</option>
                <option value="youtube">YouTube URL</option>
              </select>
            </div>

            {mediaType === "upload" && (
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloudinaryUpload}
                >
                  Upload video
                </Button>
                {mediaUrl && (
                  <video
                    src={mediaUrl}
                    controls
                    className="w-full rounded-md"
                  />
                )}
              </div>
            )}

            {mediaType === "youtube" && (
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
                {mediaUrl && extractYouTubeId(mediaUrl) && (
                  <div className="aspect-video rounded-md overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYouTubeId(mediaUrl)}`}
                      title="Preview"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
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
        )}
      </div>
    </div>
  );
};

export default StudentLessonDetail;
