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

const GRADIENTS = [
  "from-slate-700 to-slate-900",
  "from-amber-700 to-orange-900",
  "from-indigo-700 to-violet-900",
  "from-teal-700 to-emerald-900",
  "from-rose-700 to-red-900",
  "from-stone-600 to-zinc-800",
];
const coverGradient = (id) => GRADIENTS[id % GRADIENTS.length];

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
    <div className="py-8 max-w-3xl mx-auto px-4 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/coach/assignments")}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to students
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">Delete assignment</Button>
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

      {/* Hero */}
      <div className={`bg-gradient-to-br ${coverGradient(assignment.id)} rounded-xl p-8 flex flex-col gap-3`}>
        <p className="text-xs font-medium uppercase tracking-widest text-white/50">Assignment</p>
        <h1 className="font-display text-5xl text-white">{assignment.module_title}</h1>
        <div className="flex items-center gap-3 flex-wrap mt-1">
          <span className="text-sm text-white/70">{assignment.student_name}</span>
          {assignment.due_date && (
            <span className="text-xs text-white/50">
              · Due {new Date(assignment.due_date).toLocaleDateString()}
            </span>
          )}
          <span
            className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
              assignment.status === "completed"
                ? "bg-green-500/30 text-green-200"
                : "bg-yellow-500/20 text-yellow-200"
            }`}
          >
            {assignment.status === "completed" ? "✓ Completed" : "◷ In Progress"}
          </span>
        </div>
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
