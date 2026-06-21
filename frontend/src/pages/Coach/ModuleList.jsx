import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ModuleList = () => {
  const { token } = useAuth();
  const [modules, setModules] = useState([]);

  useEffect(() => {
    async function fetchModules() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/module`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setModules(data);
    }
    fetchModules();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl">My Modules</h1>
        <Link to="/coach/modules/create">
          <Button>Create module</Button>
        </Link>
      </div>

      {modules.length === 0 ? (
        <p className="text-muted-foreground">
          No modules yet. Create your first one.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {modules.map((mod) => (
            <Link key={mod.id} to={`/coach/modules/${mod.id}`}>
              <Card className="hover:border-foreground transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle>{mod.title}</CardTitle>
                </CardHeader>
                {mod.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {mod.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModuleList;
