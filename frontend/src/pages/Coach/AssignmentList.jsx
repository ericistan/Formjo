import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const GRADIENTS = [
  "from-slate-700 to-slate-900",
  "from-amber-700 to-orange-900",
  "from-indigo-700 to-violet-900",
  "from-teal-700 to-emerald-900",
  "from-rose-700 to-red-900",
  "from-stone-600 to-zinc-800",
];
const coverGradient = (id) => GRADIENTS[id % GRADIENTS.length];

const AssignmentList = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    async function fetchAssignments() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/assignment`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      setAssignments(await response.json());
    }
    fetchAssignments();
  }, []);

  const studentGroups = assignments.reduce((acc, a) => {
    if (!acc[a.student_name]) acc[a.student_name] = [];
    acc[a.student_name].push(a);
    return acc;
  }, {});

  return (
    <div className="py-8 max-w-3xl mx-auto px-4 flex flex-col gap-6">
      <button
        onClick={() => navigate("/coach/dashboard")}
        className="text-sm text-muted-foreground hover:text-foreground self-start"
      >
        ← Back to dashboard
      </button>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">My Students</h1>
        <Button onClick={() => navigate("/coach/assignments/create")}>
          Assign module
        </Button>
      </div>

      {assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No assignments yet.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(studentGroups).map(([studentName, studentAssignments]) => (
            <div key={studentName} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl">{studentName}</h2>
                <span className="text-sm text-muted-foreground">
                  {studentAssignments.length} module{studentAssignments.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {studentAssignments.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => navigate(`/coach/assignments/${a.id}`)}
                    className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:border-foreground transition-colors flex flex-col"
                  >
                    <div className={`bg-gradient-to-br ${coverGradient(a.id)} h-28 flex items-end p-4`}>
                      <h3 className="font-display text-lg text-white leading-tight">
                        {a.module_title}
                      </h3>
                    </div>
                    <div className="flex flex-col gap-2 p-4">
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
                          <span className="text-xs text-muted-foreground">
                            ⊟ {new Date(a.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="pt-1 border-t border-border">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest text-center">
                          View Assignment →
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentList;
