import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { apiFetch } from "../../../utils/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const ModuleEdit = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ title: "", description: "" });
  const [lessons, setLessons] = useState([]);
  const [selectedLessons, setSelectedLessons] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const [modulRes, lessonsRes] = await Promise.all([
        apiFetch(`/module/${id}`, token),
        apiFetch("/lesson", token),
      ]);

      const modulData = await modulRes.json();
      const lessonsData = await lessonsRes.json();

      if (modulRes.ok) {
        setFormData({
          title: modulData.title,
          description: modulData.description || "",
        });
        setSelectedLessons(modulData.lessons.map((l) => l.id));
      }
      if (lessonsRes.ok) setLessons(lessonsData);
    }
    fetchData();
  }, [id]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function toggleLesson(id) {
    setSelectedLessons((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const response = await apiFetch(`/module/${id}`, token, {
      method: "PATCH",
      body: JSON.stringify({
        ...formData,
        lessons: selectedLessons,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.msg);
      return;
    }

    navigate(`/coach/modules/${id}`);
  }

  const selectClass =
      "border-input bg-background text-foreground flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

    return (
      <div className="py-8 max-w-3xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Edit module</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              id="module-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={selectClass + " py-2 h-auto resize-none"}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Lessons</Label>
                {lessons.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No lessons available.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {lessons.map((lesson) => (
                      <label
                        key={lesson.id}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLessons.includes(lesson.id)}
                          onChange={() => toggleLesson(lesson.id)}
                          className="accent-primary w-4 h-4"
                        />
                        <span className="text-sm">{lesson.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {lesson.category} · {lesson.difficulty}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </form>
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button type="submit" form="module-form" className="w-full">
              Save changes
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate(`/coach/modules/${id}`)}
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  export default ModuleEdit;