import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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

const StudentDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  // progress is a map of { [assignment_id]: { total, done } } used to show lesson progress bars
  const [progress, setProgress] = useState({});

  useEffect(() => {
    async function fetchData() {
      // Step 1: fetch the assignment list (lightweight — no lesson details)
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/student/assignments`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) return;
      const list = await response.json();
      setAssignments(list);

      // Step 2: fetch details for ALL assignments in parallel using Promise.all
      // This is much faster than awaiting each one in a for-loop (sequential)
      const details = await Promise.all(
        list.map(
          (a) =>
            fetch(
              `${import.meta.env.VITE_API_URL}/student/assignments/${a.id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            ).then((r) => (r.ok ? r.json() : null)), // return null if this individual fetch fails
        ),
      );

      // Build a lookup map keyed by assignment id so cards can quickly find their progress
      const map = {};
      details.forEach((d) => {
        if (d) {
          map[d.id] = {
            total: d.lessons.length,
            done: d.lessons.filter((l) => l.is_complete).length,
          };
        }
      });
      setProgress(map);
    }
    fetchData();
  }, []);

  // Derived stats — recalculate every render from assignments array (no extra state needed)
  const total = assignments.length;
  const completed = assignments.filter((a) => a.status === "completed").length;
  const inProgress = assignments.filter((a) => a.status === "pending").length;

  return (
    <div className="py-8 max-w-3xl mx-auto flex flex-col gap-8 px-4">
      <div className="rounded-xl bg-foreground text-background p-6 flex flex-col gap-1">
        <p className="text-sm uppercase tracking-widest opacity-60">
          Welcome back
        </p>
        <h1 className="font-display text-5xl">{user?.name}</h1>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Assigned", value: total, color: "text-foreground" },
          { label: "Completed", value: completed, color: "text-green-600" },
          { label: "In Progress", value: inProgress, color: "text-yellow-600" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1"
          >
            <p className={`font-display text-4xl ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">My Assignments</h2>
          <span className="text-sm text-muted-foreground">
            {assignments.length} total
          </span>
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
                <div
                  className={`bg-gradient-to-br ${coverGradient(a.id)} h-36 flex items-end p-4`}
                >
                  <h3 className="font-display text-xl text-white leading-tight">
                    {a.module_title}
                  </h3>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-3 p-4">
                  <p className="text-sm text-muted-foreground">
                    Coach {a.coach_name}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded flex items-center gap-1 ${
                        a.status === "completed"
                          ? "bg-green-500/20 text-green-600"
                          : "bg-yellow-500/10 text-yellow-600"
                      }`}
                    >
                      {a.status === "completed"
                        ? "✓ Completed"
                        : "◷ In Progress"}
                    </span>
                    {a.due_date && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="size-3" />
                        {new Date(a.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {progress[a.id] && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Lessons</span>
                        <span>
                          {progress[a.id].done}/{progress[a.id].total} done
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progress[a.id].done === progress[a.id].total
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                          style={{
                            width: progress[a.id].total
                              ? `${(progress[a.id].done / progress[a.id].total) * 100}%`
                              : "0%",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-1 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest text-center">
                      {a.status === "completed"
                        ? "View Feedback →"
                        : "Start Lesson →"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
