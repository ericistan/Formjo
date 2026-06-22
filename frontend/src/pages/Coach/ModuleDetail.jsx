import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

const ModuleDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [mod, setMod] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignData, setAssignData] = useState({ student_id: "", due_date: "" });
  const [assignSuccess, setAssignSuccess] = useState(false);

  async function fetchData() {
    const [moduleRes, studentsRes, assignmentsRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/module/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${import.meta.env.VITE_API_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${import.meta.env.VITE_API_URL}/assignment?module_id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    const moduleData = await moduleRes.json();
    if (moduleRes.ok) setMod(moduleData);
    if (studentsRes.ok) setStudents(await studentsRes.json());
    if (assignmentsRes.ok) setAssignments(await assignmentsRes.json());
  }

  useEffect(() => {
    fetchData();
  }, [id]);

  async function handleDelete() {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/module/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (response.ok) navigate("/coach/modules");
  }

  async function handleAssign(e) {
    e.preventDefault();
    const response = await fetch(`${import.meta.env.VITE_API_URL}/assignment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        module_id: Number(id),
        student_id: Number(assignData.student_id),
        due_date: assignData.due_date || null,
      }),
    });
    if (response.ok) {
      setAssignSuccess(true);
      setShowAssignForm(false);
      setAssignData({ student_id: "", due_date: "" });
      fetchData();
    }
  }

  const selectClass =
    "border-input bg-background text-foreground flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (!mod)
    return <p className="p-6 text-muted-foreground">Loading module...</p>;

  return (
    <div className="py-8 max-w-3xl mx-auto px-4 flex flex-col gap-6">
      <button
        onClick={() => navigate("/coach/modules")}
        className="text-sm text-muted-foreground hover:text-foreground self-start"
      >
        ← Back to modules
      </button>
      <div className="flex justify-end gap-2">
        <Button onClick={() => { setShowAssignForm(!showAssignForm); setAssignSuccess(false); }}>
          Assign to student
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`/coach/modules/${id}/edit`)}
        >
          Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this module?</AlertDialogTitle>
              <AlertDialogDescription>
                This can't be undone. The module will be permanently removed.
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

      {assignSuccess && (
        <p className="text-sm text-green-600">Module assigned successfully.</p>
      )}

      {showAssignForm && (
        <form onSubmit={handleAssign} className="flex flex-col gap-3 border border-border rounded-lg p-4">
          <h2 className="font-display text-xl">Assign to student</h2>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="student_id">Student</Label>
            <select
              id="student_id"
              value={assignData.student_id}
              onChange={(e) => setAssignData({ ...assignData, student_id: e.target.value })}
              className={selectClass}
              required
            >
              <option value="">Select a student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="due_date">
              Due date <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="due_date"
              type="date"
              value={assignData.due_date}
              onChange={(e) => setAssignData({ ...assignData, due_date: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Assign</Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAssignForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className={`bg-gradient-to-br ${coverGradient(mod.id)} rounded-xl p-8 flex flex-col gap-2`}>
        <h1 className="font-display text-5xl text-white">{mod.title}</h1>
        {mod.description && (
          <p className="text-white/70 text-sm">{mod.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-2xl">Lessons</h2>
        {mod.lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No lessons in this module.
          </p>
        ) : (
          mod.lessons.map((lesson, index) => (
            <Card
              key={lesson.id}
              className="cursor-pointer hover:border-foreground transition-colors"
              onClick={() => navigate(`/coach/lessons/${lesson.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-muted-foreground text-base font-normal">
                    {index + 1}.
                  </span>
                  {lesson.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {lesson.category} · {lesson.difficulty}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-2xl">Assigned to</h2>
        {assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not assigned to anyone yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-sm border border-border rounded-lg px-4 py-3">
                <span>{a.student_name}</span>
                <span className="text-muted-foreground">
                  {a.status}
                  {a.due_date && ` · Due ${new Date(a.due_date).toLocaleDateString()}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleDetail;
