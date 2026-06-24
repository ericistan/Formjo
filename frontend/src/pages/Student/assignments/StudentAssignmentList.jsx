import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";

const GRADIENTS = [
  "from-slate-700 to-slate-900",
  "from-amber-700 to-orange-900",
  "from-indigo-700 to-violet-900",
  "from-teal-700 to-emerald-900",
  "from-rose-700 to-red-900",
  "from-stone-600 to-zinc-800",
];
const coverGradient = (id) => GRADIENTS[id % GRADIENTS.length];

const StudentAssignmentList = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    async function fetchAssignments() {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/student/assignments`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) return;
      const data = await response.json();
      setAssignments(data);
    }
    fetchAssignments();
  }, []);

  return (
    <div className="py-8 max-w-3xl mx-auto px-4 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">My Assignments</h1>
        <span className="text-sm text-muted-foreground">{assignments.length} total</span>
      </div>

      {assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No assignments yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {assignments.map((a) => (
            <div
              key={a.id}
              onClick={() => navigate(`/student/assignments/${a.id}`)}
              className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:border-foreground transition-colors flex flex-col"
            >
              {/* Cover */}
              <div className={`bg-gradient-to-br ${coverGradient(a.id)} h-36 flex items-end p-4`}>
                <h3 className="font-display text-xl text-white leading-tight">
                  {a.module_title}
                </h3>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-3 p-4">
                <p className="text-sm text-muted-foreground">Coach {a.coach_name}</p>

                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded flex items-center gap-1 ${
                      a.status === "completed"
                        ? "bg-green-500/20 text-green-600"
                        : "bg-yellow-500/10 text-yellow-600"
                    }`}
                  >
                    {a.status === "completed" ? "✓ Completed" : "◷ In Progress"}
                  </span>
                  {a.due_date && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="size-3" />
                      {new Date(a.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="pt-1 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest text-center">
                    {a.status === "completed" ? "View Feedback →" : "Start Lesson →"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentList;
