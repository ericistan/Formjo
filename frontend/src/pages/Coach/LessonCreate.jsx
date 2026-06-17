import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Regex Function to handle youtube.com/watch?v=, youtu.be/, youtube.com/shorts/, youtube.com/embed/
function extractYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

// Hardcoded options — no backend endpoint needed for these yet
const CATEGORIES = ["Striking", "Footwork", "Defence"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

const LessonCreate = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // All form fields in one state object
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: CATEGORIES[0],
    difficulty: DIFFICULTIES[0],
    media_type: "",
    media_url: "",
  });

  // Steps are kept separate — each entry is a plain string (the instruction)
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState(null);

  // One handler for all inputs
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/lesson`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...formData,
        // Map steps array to objects the backend expects
        steps: steps.map((instruction, i) => ({
          order_index: i + 1,
          instruction,
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.msg);
      return;
    }

    // On success, go back to the lesson list
    navigate("/coach/lessons");
  }

  // Reusable class string for native select + textarea to match shadcn Input look
  const selectClass =
    "border-input bg-background text-foreground flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  // Derived — recalculates on every render as media_url changes
  const youtubeId =
    formData.media_type === "youtube"
      ? extractYouTubeId(formData.media_url)
      : null;

  return (
    <div className="py-8 max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create a lesson</CardTitle>
        </CardHeader>
        <CardContent>
          {/* form id lets the submit Button in CardFooter trigger this form */}
          <form
            id="lesson-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Jab Cross Combo"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              {/* textarea for multi-line text */}
              <textarea
                id="description"
                name="description"
                placeholder="What will students learn?"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={selectClass + " py-2 h-auto resize-none"}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Category</Label>
              {/* Maps over CATEGORIES array to generate options */}
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={selectClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className={selectClass}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="media_type">
                Media type{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <select
                id="media_type"
                name="media_type"
                value={formData.media_type}
                onChange={handleChange}
                className={selectClass}
              >
                <option value="">None</option>
                <option value="youtube">YouTube</option>
                <option value="upload">Upload</option>
              </select>
            </div>

            {/* YouTube: URL input + live preview embed */}
            {formData.media_type === "youtube" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="media_url">YouTube URL</Label>
                <Input
                  id="media_url"
                  name="media_url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.media_url}
                  onChange={handleChange}
                />
                {/* Show embed as soon as a valid video ID is detected */}
                {youtubeId && (
                  <div className="rounded-md overflow-hidden aspect-video w-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title="YouTube preview"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
                {/* Nudge if user typed something but it's not a valid YouTube URL yet */}
                {formData.media_url && !youtubeId && (
                  <p className="text-xs text-muted-foreground">
                    Paste a valid YouTube link to see a preview.
                  </p>
                )}
              </div>
            )}

            {/* Upload: Cloudinary widget — opens their hosted file picker */}
            {formData.media_type === "upload" && (
              <div className="flex flex-col gap-2">
                <Label>Video upload</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // window.cloudinary is available because of the script tag in index.html
                    const widget = window.cloudinary.createUploadWidget(
                      {
                        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
                        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
                        sources: ["local", "url", "camera"],
                        resourceType: "video",
                        maxFileSize: 100000000, // 100MB
                      },
                      (error, result) => {
                        // result.event === "success" fires once upload completes
                        if (!error && result.event === "success") {
                          setFormData((prev) => ({
                            ...prev,
                            media_url: result.info.secure_url,
                          }));
                        }
                      }
                    );
                    widget.open();
                  }}
                >
                  Upload video
                </Button>
                {/* Show video preview and URL once Cloudinary returns the secure_url */}
                {formData.media_url && (
                  <>
                    <video
                      src={formData.media_url}
                      controls
                      className="w-full rounded-md"
                    />
                    <p className="text-xs text-muted-foreground break-all">
                      {formData.media_url}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Steps section */}
            <div className="flex flex-col gap-2">
              <Label>Steps</Label>
              {steps.map((instruction, index) => (
                <div key={index} className="flex items-center gap-2">
                  {/* Step number badge */}
                  <span className="text-sm text-muted-foreground w-5 shrink-0 text-right">
                    {index + 1}.
                  </span>
                  <Input
                    placeholder="e.g. 10 min jumping jacks"
                    value={instruction}
                    onChange={(e) => {
                      const updated = [...steps];
                      updated[index] = e.target.value;
                      setSteps(updated);
                    }}
                  />
                  {/* Remove this step */}
                  <button
                    type="button"
                    onClick={() =>
                      setSteps(steps.filter((_, i) => i !== index))
                    }
                    className="text-muted-foreground hover:text-destructive text-lg leading-none shrink-0"
                    aria-label="Remove step"
                  >
                    ×
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => setSteps([...steps, ""])}
              >
                + Add step
              </Button>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button type="submit" form="lesson-form" className="w-full">
            Create lesson
          </Button>
          {/* Cancel navigates back without submitting */}
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate("/coach/lessons")}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LessonCreate;
