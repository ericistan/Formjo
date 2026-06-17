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

        <Route path="/" element={<LandingPage />} />
      </Routes>
    </>
  );
}

export default App;
