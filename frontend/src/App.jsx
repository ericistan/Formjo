import { Routes, Route } from "react-router-dom";
import SignupPage from "./pages/SignupPage.jsx";
import SigninPage from "./pages/SigninPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CoachDashboard from "./pages/Coach/CoachDashboard.jsx";
import StudentDashboard from "./pages/Student/StudentDashboard.jsx";
import LessonList from "./pages/Coach/LessonList.jsx";
import LessonCreate from "./pages/Coach/LessonCreate.jsx";
import LessonDetail from "./pages/Coach/LessonDetail.jsx";
import LessonEdit from "./pages/Coach/LessonEdit.jsx";
import ModuleList from "./pages/Coach/ModuleList.jsx";
import ModuleCreate from "./pages/Coach/ModuleCreate.jsx";
import ModuleDetail from "./pages/Coach/ModuleDetail.jsx";
import ModuleEdit from "./pages/Coach/ModuleEdit.jsx";
import AssignmentList from "./pages/Coach/AssignmentList.jsx";
import AssignmentCreate from "./pages/Coach/AssignmentCreate.jsx";
import AssignmentDetail from "./pages/Coach/AssignmentDetail.jsx";
import CoachAssignmentLesson from "./pages/Coach/CoachAssignmentLesson.jsx";
import StudentAssignmentList from "./pages/Student/StudentAssignmentList.jsx";
import StudentAssignmentDetail from "./pages/Student/StudentAssignmentDetail.jsx";
import StudentLessonDetail from "./pages/Student/StudentLessonDetail.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route
          path="/coach/dashboard"
          element={
            <ProtectedRoute>
              <CoachDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coach/lessons"
          element={
            <ProtectedRoute>
              <LessonList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/lessons/create"
          element={
            <ProtectedRoute>
              <LessonCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/lessons/:id"
          element={
            <ProtectedRoute>
              <LessonDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/lessons/:id/edit"
          element={
            <ProtectedRoute>
              <LessonEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/modules"
          element={
            <ProtectedRoute>
              <ModuleList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/modules/create"
          element={
            <ProtectedRoute>
              <ModuleCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/modules/:id"
          element={
            <ProtectedRoute>
              <ModuleDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/modules/:id/edit"
          element={
            <ProtectedRoute>
              <ModuleEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/assignments"
          element={
            <ProtectedRoute>
              <AssignmentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/assignments/create"
          element={
            <ProtectedRoute>
              <AssignmentCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/assignments/:id"
          element={
            <ProtectedRoute>
              <AssignmentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/assignments/:id/lessons/:lessonId"
          element={
            <ProtectedRoute>
              <CoachAssignmentLesson />
            </ProtectedRoute>
          }
        />
        <Route path="/student/assignments" element={<ProtectedRoute><StudentAssignmentList /></ProtectedRoute>} />
        <Route path="/student/assignments/:id" element={<ProtectedRoute><StudentAssignmentDetail /></ProtectedRoute>} />
        <Route path="/student/assignments/:id/lessons/:lessonId" element={<ProtectedRoute><StudentLessonDetail /></ProtectedRoute>} />

        <Route path="/" element={<LandingPage />} />
      </Routes>
    </>
  );
}

export default App;
