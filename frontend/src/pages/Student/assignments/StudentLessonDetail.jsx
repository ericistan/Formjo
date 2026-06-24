import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import VoiceRecorder from "../../../components/VoiceRecorder";

function extractYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

// SubmissionCard renders one attempt: the video, notes, and the feedback thread below it
// Each card manages its own comment state independently — React handles this per-instance
const SubmissionCard = ({ submission, token, attemptNumber }) => {
  const [comments, setComments] = useState([]);
  const [reply, setReply] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
  // sending prevents double-submits and shows "..." while the request is in flight
  const [sending, setSending] = useState(false);

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

  async function handleReply(e) {
    e.preventDefault();
    if (!reply.trim() && !audioBlob) return;
    setSending(true);

    // If there's a voice recording, upload to Cloudinary before posting the comment
    let finalAudioUrl = null;
    if (audioBlob) {
      const formData = new FormData();
      formData.append("file", audioBlob, "voice-comment.webm");
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      );
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        submission_id: submission.id,
        body: reply || null,
        audio_url: finalAudioUrl,
      }),
    });
    if (response.ok) {
      setReply("");
      setAudioBlob(null);
      setAudioPreviewUrl(null);
      // Re-fetch so the new comment appears immediately without a page reload
      fetchComments();
    }
    setSending(false);
  }

  return (
    <div className="flex flex-col bg-card border border-border rounded-xl overflow-hidden">
      {/* Attempt header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Attempt {attemptNumber}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(submission.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Video — iframe for YouTube embeds, native <video> element for Cloudinary uploads */}
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

      {/* Notes are optional — && short-circuits if notes is null/empty */}
      {submission.notes && (
        <div className="flex flex-col gap-1 px-4 pt-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Your notes
          </p>
          <p className="text-sm">{submission.notes}</p>
        </div>
      )}

      {/* Feedback thread — student sees "Coach Name" for coach comments, "You" for their own */}
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
                    {/* Coach's comments show their name; the student's own comments show "You" */}
                    <span className="text-xs font-semibold">
                      {isCoach ? `Coach ${c.author_name}` : "You"}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {c.body && (
                    <p className="text-sm leading-relaxed">{c.body}</p>
                  )}
                  {c.audio_url && (
                    <audio
                      src={c.audio_url}
                      controls
                      className="w-full h-8 mt-1"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <form
          onSubmit={handleReply}
          className="flex flex-col gap-2 p-3 border-t border-border"
        >
          {audioPreviewUrl ? (
            // Voice recorded — show preview + discard; Send button below handles upload + post
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
            // Idle — text input with mic button
            <div className="flex gap-2">
              <Input
                placeholder="Reply to feedback..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
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
          <Button
            type="submit"
            size="sm"
            disabled={(!reply.trim() && !audioBlob) || sending}
          >
            {sending ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
};

// StudentLessonDetail — most complex student page
// Shows the lesson content, all past submissions (each as a SubmissionCard), and the submission form
// URL: /student/assignments/:id/lessons/:lessonId
const StudentLessonDetail = () => {
  // Both :id (assignment) and :lessonId are read from the URL via useParams
  const { id, lessonId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  // Form fields — managed as separate state values (could also be a single object like in LessonCreate)
  const [notes, setNotes] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  // uploading disables the Submit button while the POST request is in flight
  const [uploading, setUploading] = useState(false);
  // showForm hides/shows the submission form — hidden by default once the student has submitted
  const [showForm, setShowForm] = useState(false);

  // Tailwind classes for native selects/textareas to match shadcn Input styling
  const selectClass =
    "border-input bg-background text-foreground flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  // fetchData is defined outside useEffect so handleSubmit can call it to refresh after a new submission
  async function fetchData() {
    // Fetch lesson content and existing submissions in parallel
    const [lessonRes, subRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/lesson/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      // Filter submissions by both assignment_id and lesson_id — students can submit to multiple lessons
      fetch(
        `${import.meta.env.VITE_API_URL}/submission?assignment_id=${id}&lesson_id=${lessonId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    ]);
    const lessonData = await lessonRes.json();
    if (lessonRes.ok) setLesson(lessonData);
    if (subRes.ok) setSubmissions(await subRes.json());
  }

  useEffect(() => {
    fetchData();
  }, [lessonId]);

  function handleCloudinaryUpload() {
    // window.cloudinary is available from the <script> tag in index.html (Cloudinary's upload widget)
    // createUploadWidget opens a hosted file picker — Cloudinary handles the actual upload to their CDN
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        sources: ["local", "url", "camera"],
        resourceType: "video",
        maxFileSize: 100000000, // 100MB
      },
      (error, result) => {
        // This callback fires multiple times — only act when the upload fully succeeds
        if (!error && result.event === "success") {
          // secure_url is the permanent CDN URL for the uploaded video
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
        assignment_id: Number(id), // URL params are strings — Number() converts for the backend
        lesson_id: Number(lessonId),
        media_url: mediaUrl,
        media_type: mediaType,
        notes: notes || null, // empty string → null so the DB stores NULL, not ""
      }),
    });
    if (response.ok) {
      // Reset all form fields
      setNotes("");
      setMediaUrl("");
      setMediaType("");
      setShowForm(false);
      // Re-fetch so the new submission appears in the list immediately
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

        {/* Show "Submit another attempt" button ONLY if there are existing submissions and the form is hidden */}
        {submissions.length > 0 && !showForm ? (
          <Button variant="outline" onClick={() => setShowForm(true)}>
            Submit another attempt
          </Button>
        ) : null}

        {/* Show the form when: no submissions yet (first attempt) OR the student clicked "Submit another" */}
        {(submissions.length === 0 || showForm) && (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 bg-card border border-border rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Add a submission</h3>
              {/* Cancel button only appears if there are already submissions (the form is being shown additionally) */}
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
              {/* Changing media type resets mediaUrl so stale URLs from a previous selection don't carry over */}
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
