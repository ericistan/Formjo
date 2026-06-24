import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AssignmentCreate = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    student_id: "",
    module_id: "",
    due_date: "",
  });
  const [students, setStudents] = useState([]);
  const [modules, setModules] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // this does two parallel fetches — students and modules — and waits for both to complete before continuing because the form needs both sets of data at the same time
      //promise.all is used to run both fetches in parallel, which is more efficient than running them sequentially
      const [studentsRes, modulesRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/students`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_URL}/module`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (modulesRes.ok) setModules(await modulesRes.json());
    }
    fetchData();
  }, []);

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/assignment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        student_id: Number(formData.student_id),
        module_id: Number(formData.module_id),
        due_date: formData.due_date || null,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.msg);
      return;
    }
    navigate("/coach/assignments");
  }

  const selectClass =
    "border-input bg-background text-foreground flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="py-8 max-w-3xl mx-auto px-4">
      <Card>
        <CardHeader>
          <CardTitle>Create assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            id="assignment-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="student_id">Student</Label>
              <select
                id="student_id"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                className={selectClass}
                required
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="module_id">Module</Label>
              <select
                id="module_id"
                name="module_id"
                value={formData.module_id}
                onChange={handleChange}
                className={selectClass}
                required
              >
                <option value="">Select a module</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="due_date">
                Due date{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleChange}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button type="submit" form="assignment-form" className="w-full">
            Create assignment
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate("/coach/assignments")}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AssignmentCreate;
