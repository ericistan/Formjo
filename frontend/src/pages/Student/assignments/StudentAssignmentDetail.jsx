import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

const StudentAssignmentDetail = () => {
  // useParams reads :id from the URL — e.g. /student/assignments/5 → id = "5"
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  // null = still loading; we show a spinner until the fetch completes
  const [assignment, setAssignment] = useState(null);

  // Re-fetch if id changes (e.g. the user navigates between assignments)
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

  // Guard: show loading text until assignment data is available
  if (!assignment)
    return <p className="p-6 text-muted-foreground">Loading assignment...</p>;

  // Derived boolean — every() returns true if ALL lessons pass the test
  // Also guards against empty arrays (0 lessons should not count as "complete")
  const allComplete =
    assignment.lessons.length > 0 &&
    assignment.lessons.every((l) => l.is_complete);

  return (
    <div className="py-8 max-w-3xl mx-auto px-4 flex flex-col gap-6">
      <button
        onClick={() => navigate("/student/assignments")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground self-start"
      >
        <ChevronLeft className="size-4" /> Back to assignments
      </button>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-4xl">{assignment.module_title}</h1>
          {/* Status badge — color changes based on allComplete boolean */}
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
          {/* && short-circuits: due_date is optional, only render if it exists */}
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
          // Clicking a Card navigates to that lesson's detail page
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
                {/* Only show "Done" badge if the coach has marked this lesson complete */}
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
