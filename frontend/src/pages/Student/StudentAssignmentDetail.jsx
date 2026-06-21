import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const StudentAssignmentDetail = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);

  useEffect(() => {
    async function fetchAssignment() {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/student/assignments/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await response.json();
      if (response.ok) setAssignment(data);
    }
    fetchAssignment();
  }, [id]);

  if (!assignment)
    return <p className="p-6 text-muted-foreground">Loading assignment...</p>;

  const allComplete =
    assignment.lessons.length > 0 &&
    assignment.lessons.every((l) => l.is_complete);

  return (
    <div className="py-8 max-w-lg mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-4xl">{assignment.module_title}</h1>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
              allComplete
                ? "bg-green-500/20 text-green-600"
                : "bg-yellow-500/20 text-yellow-600"
            }`}
          >
            {allComplete ? "Completed" : "In Progress"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          From {assignment.coach_name}
          {assignment.due_date &&
            ` · Due ${new Date(assignment.due_date).toLocaleDateString()}`}
        </p>
        {assignment.module_description && (
          <p className="text-muted-foreground mt-1">
            {assignment.module_description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-2xl">Lessons</h2>
        {assignment.lessons.map((lesson, index) => (
          <Card
            key={lesson.id}
            className="cursor-pointer hover:border-foreground transition-colors"
            onClick={() => navigate(`/student/assignments/${id}/lessons/${lesson.id}`)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-base font-normal">
                    {index + 1}.
                  </span>
                  {lesson.title}
                </div>
                {lesson.is_complete && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-600 shrink-0">
                    Done
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {lesson.category} · {lesson.difficulty}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentAssignmentDetail;
