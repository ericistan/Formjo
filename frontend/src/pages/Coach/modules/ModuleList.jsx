import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const GRADIENTS = [
  "from-slate-700 to-slate-900",
  "from-amber-700 to-orange-900",
  "from-indigo-700 to-violet-900",
  "from-teal-700 to-emerald-900",
  "from-rose-700 to-red-900",
  "from-stone-600 to-zinc-800",
];
const coverGradient = (id) => GRADIENTS[id % GRADIENTS.length];

const ModuleList = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);

  useEffect(() => {
    async function fetchModules() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/module`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      setModules(await response.json());
    }
    fetchModules();
  }, []);

  return (
    <div className="py-8 max-w-3xl mx-auto px-4 flex flex-col gap-6">
      <button
        onClick={() => navigate("/coach/dashboard")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground self-start"
      >
        <ChevronLeft className="size-4" /> Back to dashboard
      </button>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">My Modules</h1>
        <Button onClick={() => navigate("/coach/modules/create")}>
          Create module
        </Button>
      </div>

      {modules.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No modules yet. Create your first one.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules.map((mod) => (
            <div
              key={mod.id}
              onClick={() => navigate(`/coach/modules/${mod.id}`)}
              className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:border-foreground transition-colors flex flex-col"
            >
              <div className={`bg-gradient-to-br ${coverGradient(mod.id)} h-36 flex items-end p-4`}>
                <h3 className="font-display text-xl text-white leading-tight">
                  {mod.title}
                </h3>
              </div>
              <div className="flex flex-col gap-3 p-4">
                {mod.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">{mod.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No description</p>
                )}
                <div className="pt-1 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest text-center">
                    View Module →
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

export default ModuleList;
