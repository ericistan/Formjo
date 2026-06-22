import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const StudentAssignmentList = () => {
  const { token } = useAuth();
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
    <div className="py-8 max-w-3xl mx-auto px-4">
      <h1 className="text-3xl mb-6">My Assignments</h1>

      {assignments.length === 0 ? (
        <p className="text-muted-foreground">No assignments yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {assignments.map((a) => (
            <Link key={a.id} to={`/student/assignments/${a.id}`}>
              <Card className="hover:border-foreground transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle>{a.module_title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    From {a.coach_name} · {a.status}
                    {a.due_date &&
                      ` · Due ${new Date(a.due_date).toLocaleDateString()}`}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentList;
