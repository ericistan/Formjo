import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Link } from "react-router-dom";
import { apiFetch } from "../../../utils/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const LessonList = () => {
  const { token } = useAuth();
  // useState([]) — start with an empty array so .map() doesn't crash before the fetch returns
  const [lessons, setLessons] = useState([]);

  // useEffect with [] runs once after the component first mounts (like componentDidMount in class components)
  // The async function is defined inside because useEffect callbacks can't be async directly
  useEffect(() => {
    async function fetchLessons() {
      const response = await apiFetch("/lesson", token);
      if (!response.ok) return;
      const data = await response.json();
      // setLessons triggers a re-render — the list appears once data arrives
      setLessons(data);
    }
    fetchLessons();
  }, []); // [] = no dependencies, only run on mount

  return (
    <div className="py-8 max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl">My Lessons</h1>
        {/* Link renders an <a> tag — navigates without a full page reload */}
        <Link to="/coach/lessons/create">
          <Button>Create lesson</Button>
        </Link>
      </div>

      {/* Conditional rendering: show empty state or the list */}
      {lessons.length === 0 ? (
        <p className="text-muted-foreground">
          No lessons yet. Create your first one.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {lessons.map((lesson) => (
            // key prop is required when rendering lists — React uses it to track which items changed
            <Link key={lesson.id} to={`/coach/lessons/${lesson.id}`}>
              <Card className="hover:border-foreground transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle>{lesson.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {lesson.category} · {lesson.difficulty}
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

export default LessonList;
