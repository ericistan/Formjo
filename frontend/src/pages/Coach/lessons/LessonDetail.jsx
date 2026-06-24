import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
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
    <div className="py-8 max-w-3xl mx-auto px-4 flex flex-col gap-6">
      {/* Coach action bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => navigate("/coach/lessons")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Back
        </button>
        <div className="flex gap-2">
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
      </div>

      {/* Lesson content card */}
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

      {lesson.steps.length > 0 && (
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
    </div>
  );
};

export default LessonDetail;
