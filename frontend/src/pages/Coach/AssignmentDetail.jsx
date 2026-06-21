import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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

const AssignmentDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);

  async function fetchData() {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/assignment/${id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.ok) setAssignment(await response.json());
  }

  useEffect(() => {
    fetchData();
  }, [id]);

  async function handleDelete() {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/assignment/${id}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
    );
    if (response.ok) navigate("/coach/assignments");
  }

  if (!assignment)
    return <p className="p-6 text-muted-foreground">Loading assignment...</p>;

  return (
    <div className="py-8 max-w-lg mx-auto flex flex-col gap-6">
      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this assignment?</AlertDialogTitle>
              <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-4xl">{assignment.module_title}</h1>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
              assignment.status === "completed"
                ? "bg-green-500/20 text-green-600"
                : "bg-yellow-500/20 text-yellow-600"
            }`}
          >
            {assignment.status === "completed" ? "Completed" : "In Progress"}
          </span>
        </div>
        <p className="text-muted-foreground">
          {assignment.student_name} ({assignment.student_email})
        </p>
        {assignment.due_date && (
          <p className="text-sm text-muted-foreground">
            Due {new Date(assignment.due_date).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-2xl">Lessons</h2>
        {assignment.lessons && assignment.lessons.map((lesson, index) => (
          <div
            key={lesson.id}
            onClick={() => navigate(`/coach/assignments/${id}/lessons/${lesson.id}`)}
            className="flex items-center justify-between gap-3 border border-border rounded-lg px-4 py-3 cursor-pointer hover:border-foreground transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground text-sm">{index + 1}.</span>
              <div className="flex flex-col gap-0.5">
                <p className="font-medium">{lesson.title}</p>
                <p className="text-xs text-muted-foreground">
                  {lesson.category} · {lesson.difficulty}
                </p>
              </div>
            </div>
            {lesson.is_complete && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 shrink-0">
                Done
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentDetail;
