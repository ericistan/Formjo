import { Routes, Route } from "react-router-dom";
import SignupPage from "./pages/SignupPage.jsx";
import SigninPage from "./pages/SigninPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CoachDashboard from "./pages/Coach/CoachDashboard.jsx";
import StudentDashboard from "./pages/Student/StudentDashboard.jsx";
import LessonList from "./pages/Coach/lessons/LessonList.jsx";
import LessonCreate from "./pages/Coach/lessons/LessonCreate.jsx";
import LessonDetail from "./pages/Coach/lessons/LessonDetail.jsx";
import LessonEdit from "./pages/Coach/lessons/LessonEdit.jsx";
import ModuleList from "./pages/Coach/modules/ModuleList.jsx";
import ModuleCreate from "./pages/Coach/modules/ModuleCreate.jsx";
import ModuleDetail from "./pages/Coach/modules/ModuleDetail.jsx";
import ModuleEdit from "./pages/Coach/modules/ModuleEdit.jsx";
import AssignmentList from "./pages/Coach/assignments/AssignmentList.jsx";
import AssignmentCreate from "./pages/Coach/assignments/AssignmentCreate.jsx";
import AssignmentDetail from "./pages/Coach/assignments/AssignmentDetail.jsx";
import CoachAssignmentLesson from "./pages/Coach/assignments/CoachAssignmentLesson.jsx";
import StudentAssignmentList from "./pages/Student/assignments/StudentAssignmentList.jsx";
import StudentAssignmentDetail from "./pages/Student/assignments/StudentAssignmentDetail.jsx";
import StudentLessonDetail from "./pages/Student/assignments/StudentLessonDetail.jsx";

function App() {
  return (
    <>
      {/* Routes is a container — React Router looks through its children and renders
          the first <Route> whose path matches the current URL */}
      <Routes>

        {/* Public routes — accessible without being signed in */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/" element={<LandingPage />} />

        {/* Protected routes — ProtectedRoute redirects to /signin if no token exists */}

        {/* Coach routes */}
        <Route path="/coach/dashboard" element={<ProtectedRoute><CoachDashboard /></ProtectedRoute>} />

        {/* Lessons — full CRUD: list, create, read (detail), update (edit) */}
        <Route path="/coach/lessons" element={<ProtectedRoute><LessonList /></ProtectedRoute>} />
        <Route path="/coach/lessons/create" element={<ProtectedRoute><LessonCreate /></ProtectedRoute>} />
        <Route path="/coach/lessons/:id" element={<ProtectedRoute><LessonDetail /></ProtectedRoute>} />
        {/* :id is a dynamic segment — the actual lesson ID comes from the URL (e.g. /coach/lessons/3) */}
        <Route path="/coach/lessons/:id/edit" element={<ProtectedRoute><LessonEdit /></ProtectedRoute>} />

        {/* Modules — full CRUD */}
        <Route path="/coach/modules" element={<ProtectedRoute><ModuleList /></ProtectedRoute>} />
        <Route path="/coach/modules/create" element={<ProtectedRoute><ModuleCreate /></ProtectedRoute>} />
        <Route path="/coach/modules/:id" element={<ProtectedRoute><ModuleDetail /></ProtectedRoute>} />
        <Route path="/coach/modules/:id/edit" element={<ProtectedRoute><ModuleEdit /></ProtectedRoute>} />

        {/* Assignments — coach assigns modules to students and tracks their progress */}
        <Route path="/coach/assignments" element={<ProtectedRoute><AssignmentList /></ProtectedRoute>} />
        <Route path="/coach/assignments/create" element={<ProtectedRoute><AssignmentCreate /></ProtectedRoute>} />
        <Route path="/coach/assignments/:id" element={<ProtectedRoute><AssignmentDetail /></ProtectedRoute>} />
        {/* Nested route — :id is the assignment, :lessonId is a specific lesson within it */}
        <Route path="/coach/assignments/:id/lessons/:lessonId" element={<ProtectedRoute><CoachAssignmentLesson /></ProtectedRoute>} />

        {/* Student routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/assignments" element={<ProtectedRoute><StudentAssignmentList /></ProtectedRoute>} />
        <Route path="/student/assignments/:id" element={<ProtectedRoute><StudentAssignmentDetail /></ProtectedRoute>} />
        {/* Students view a lesson within an assignment and submit their video here */}
        <Route path="/student/assignments/:id/lessons/:lessonId" element={<ProtectedRoute><StudentLessonDetail /></ProtectedRoute>} />

      </Routes>
    </>
  );
}

export default App;
