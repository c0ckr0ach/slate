import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import AttendancePage from "./pages/AttendancePage";
import AuthPage from "./pages/AuthPage";
import ClassroomDetailPage from "./pages/ClassroomDetailPage";
import ClassroomsPage from "./pages/ClassroomsPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import LiveClassPage from "./pages/LiveClassPage";
import ProfilePage from "./pages/ProfilePage";
import SchedulePage from "./pages/SchedulePage";
import StudentsPage from "./pages/StudentsPage";

export default function App() {
  return <Routes><Route path="/" element={<LandingPage />} /><Route path="/login" element={<AuthPage mode="login" />} /><Route path="/register" element={<AuthPage mode="register" />} /><Route path="/app/live/:id" element={<LiveClassPage />} /><Route path="/app" element={<DashboardLayout />}><Route index element={<DashboardPage />} /><Route path="classrooms" element={<ClassroomsPage />} /><Route path="classrooms/:id" element={<ClassroomDetailPage />} /><Route path="students" element={<StudentsPage />} /><Route path="schedule" element={<SchedulePage />} /><Route path="attendance" element={<AttendancePage />} /><Route path="profile" element={<ProfilePage />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes>;
}
