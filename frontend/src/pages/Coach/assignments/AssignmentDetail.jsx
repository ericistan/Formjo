import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../utils/api";
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
import { coverGradient } from "../../../utils/gradients";
import StatusBadge from "../../../components/StatusBadge";

const AssignmentDetail = () => {
  // :id from the URL — e.g. /coach/assignments/7 → id = "7"
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);

  // fetchData is defined outside useEffect so handleDelete can call it to refresh after changes
  async function fetchData() {
    const response = await apiFetch(`/assignment/${id}`, token);
    if (response.ok) setAssignment(await response.json());
  }

  useEffect(() => {
    fetchData();
  }, [id]);

  async function handleDelete() {
    const response = await apiFetch(`/assignment/${id}`, token, { method: "DELETE" });
    // On success, navigate back — no need to update state since the record no longer exists
    if (response.ok) navigate("/coach/assignments");
  }

  if (!assignment)
    return <p className="p-6 text-muted-foreground">Loading assignment...</p>;

  return (
    <div className="py-8 max-w-3xl mx-auto px-4 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/coach/assignments")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> Back to students
        </button>
        {/* AlertDialog is a shadcn component that shows a confirmation modal before a destructive action */}
        {/* AlertDialogTrigger wraps the button that opens the modal */}
        {/* AlertDialogAction confirms and runs handleDelete; AlertDialogCancel dismisses safely */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Delete assignment
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this assignment?</AlertDialogTitle>
              <AlertDialogDescription>
                This can't be undone.
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

      {/* Hero */}
      <div
        className={`bg-gradient-to-br ${coverGradient(assignment.id)} rounded-xl p-8 flex flex-col gap-3`}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-white/50">
          Assignment
        </p>
        <h1 className="font-display text-5xl text-white">
          {assignment.module_title}
        </h1>
        <div className="flex items-center gap-3 flex-wrap mt-1">
          <span className="text-sm text-white/70">
            {assignment.student_name}
          </span>
          {assignment.due_date && (
            <span className="text-xs text-white/50">
              · Due {new Date(assignment.due_date).toLocaleDateString()}
            </span>
          )}
          <StatusBadge status={assignment.status} variant="hero" className="ml-auto" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-2xl">Lessons</h2>
        {/* Navigate to the coach's per-lesson view where they can see submissions and leave feedback */}
        {assignment.lessons &&
          assignment.lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              onClick={() =>
                navigate(`/coach/assignments/${id}/lessons/${lesson.id}`)
              }
              className="flex items-center justify-between gap-3 border border-border rounded-lg px-4 py-3 cursor-pointer hover:border-foreground transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm">
                  {index + 1}.
                </span>
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
