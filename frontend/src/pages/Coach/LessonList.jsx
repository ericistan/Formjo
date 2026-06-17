import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const LessonList = () => {
  const { token } = useAuth();
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    async function fetchLessons() {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/lesson`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      setLessons(data);
    }
    fetchLessons();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl">My Lessons</h1>
        <Link to="/coach/lessons/create">
          <Button>Create lesson</Button>
        </Link>
      </div>

      {lessons.length === 0 ? (
        <p className="text-muted-foreground">
          No lessons yet. Create your first one.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {lessons.map((lesson) => (
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
