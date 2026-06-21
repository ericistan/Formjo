import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

function extractYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

const LessonDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    async function fetchLesson() {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/lesson/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (response.ok) setLesson(data);
    }
    fetchLesson();
  }, [id]);

  if (!lesson) {
    return (
      <p className="p-6 text-muted-foreground">Loading lesson details...</p>
    );
  }

  async function handleDelete() {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/lesson/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.ok) {
      navigate("/coach/lessons");
    } else {
      console.error("Failed to delete lesson");
    }
  }

  return (
    <div className="py-8 max-w-lg mx-auto flex flex-col gap-6">
      {/* Coach action bar */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => navigate(`/coach/lessons/${id}/edit`)}
        >
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this lesson?</AlertDialogTitle>
              <AlertDialogDescription>
                This can't be undone. The lesson and all its steps will be
                permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Lesson content — student view */}
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-4xl">{lesson.title}</h1>
        <p className="text-sm text-muted-foreground">
          {lesson.category} · {lesson.difficulty}
        </p>
        {lesson.description && <p>{lesson.description}</p>}

        {/* Media */}
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
          <video
            src={lesson.media_url}
            controls
            className="w-full rounded-md"
          />
        )}

        {/* Steps */}
        {lesson.steps.length > 0 && (
          <ol className="flex flex-col gap-2">
            {lesson.steps.map((step) => (
              <li key={step.id} className="flex gap-3">
                <span className="text-muted-foreground shrink-0">
                  {step.order_index}.
                </span>
                <span>{step.instruction}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default LessonDetail;
