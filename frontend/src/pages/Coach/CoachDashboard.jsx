import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { CalendarDays } from "lucide-react";
import { coverGradient } from "../../utils/gradients";
import StatusBadge from "../../components/StatusBadge";
import { apiFetch } from "../../utils/api";

const CoachDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  // progress is a map of { [assignment_id]: { total, done } } used to power progress bars on each card
  const [progress, setProgress] = useState({});

  useEffect(() => {
    async function fetchData() {
      // Step 1: fetch the assignment list (all assignments this coach created)
      const assignRes = await apiFetch("/assignment", token);
      if (!assignRes.ok) return;
      const list = await assignRes.json();
      setAssignments(list);

      // Step 2: fetch each assignment's detail page in parallel to get lesson completion data
      // Promise.all fires all requests at the same time — faster than a sequential for-loop so that the dashboard loads quickly
      const details = await Promise.all(
        list.map((a) =>
          apiFetch(`/assignment/${a.id}`, token).then((r) => (r.ok ? r.json() : null)),
        ),
      );

      // Build a lookup: { [id]: { total: N, done: M } }
      // this is used to power the progress bars on each assignment card
      // When the cards render, each one needs its own progress. If you stored details as an array, every card would have to call details.find(d => d.id === a.id) —
      // that's O(n) for each card, so 10 cards scanning 10 items = 100 operations.
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

  // Derived stats — computed from assignments on every render (no extra state)
  // this is better than use state because it prevents bugs where the stats get out of sync with the assignments list due to a missed setState call
  const pending = assignments.filter((a) => a.status === "pending").length;
  const completed = assignments.filter((a) => a.status === "completed").length;

  // Group assignments by student to build the "My Students" section
  // Each student gets: how many assignments total, how many completed, and their latest assignment
  const studentMap = {};
  assignments.forEach((a) => {
    if (!studentMap[a.student_name]) {
      studentMap[a.student_name] = {
        name: a.student_name,
        total: 0,
        completed: 0,
        latest: null,
      };
    }
    studentMap[a.student_name].total += 1;
    if (a.status === "completed") studentMap[a.student_name].completed += 1;
    // Only set latest once (assignments are returned newest-first from the backend)
    if (!studentMap[a.student_name].latest)
      studentMap[a.student_name].latest = a;
  });
  // Object.values() converts { "Alice": {...}, "Bob": {...} } → [{ name: "Alice" }, { name: "Bob" }]
  // studentRows.length is used as the "Total Students" stat — accurate because it's derived from real assignments
  const studentRows = Object.values(studentMap);

  return (
    <div className="py-8 max-w-3xl mx-auto flex flex-col gap-8 px-4">
      <div className="rounded-xl bg-stone-800 text-stone-100 p-6 flex flex-col gap-1">
        <p className="text-sm uppercase tracking-widest opacity-60">
          Welcome back Coach
        </p>
        <h1 className="font-display text-5xl">{user?.name}</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Students",
            value: studentRows.length,
            color: "text-foreground",
          },
          {
            label: "Total Assignments",
            value: assignments.length,
            color: "text-foreground",
          },
          { label: "Pending", value: pending, color: "text-yellow-500" },
          { label: "Completed", value: completed, color: "text-green-500" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="border border-border rounded-xl p-4 flex flex-col gap-1"
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
          <h2 className="font-display text-2xl">Recent Assignments</h2>
          <button
            onClick={() => navigate("/coach/assignments")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View all →
          </button>
        </div>
        {assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assignments yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assignments.slice(0, 6).map((a) => (
              <div
                key={a.id}
                onClick={() => navigate(`/coach/assignments/${a.id}`)}
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
                    {a.student_name}
                  </p>

                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={a.status} />
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
                      View Assignment →
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {studentRows.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-2xl">My Students</h2>
          <div className="border border-border rounded-xl overflow-hidden">
            {studentRows.map((s, i) => (
              <div
                key={s.name}
                className={`flex items-center justify-between px-4 py-3 ${
                  i < studentRows.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <p className="font-medium">{s.name}</p>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-muted-foreground">
                    {s.completed}/{s.total} complete
                  </p>
                  <StatusBadge status={s.latest?.status} variant="row" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachDashboard;
