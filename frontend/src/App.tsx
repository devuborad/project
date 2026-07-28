import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { FacultyRoute } from './components/layout/FacultyRoute';
import { ClubAdminRoute } from './components/layout/ClubAdminRoute';
import { AdminRoute } from './components/layout/AdminRoute';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/auth/Signup').then(m => ({ default: m.Signup })));
const DashboardOverview = lazy(() => import('./pages/dashboard/Overview').then(m => ({ default: m.DashboardOverview })));
const FacultyOverview = lazy(() => import('./pages/dashboard/FacultyOverview').then(m => ({ default: m.FacultyOverview })));
const ClubAdminOverview = lazy(() => import('./pages/dashboard/ClubAdminOverview').then(m => ({ default: m.ClubAdminOverview })));
const AdminOverview = lazy(() => import('./pages/dashboard/AdminOverview').then(m => ({ default: m.AdminOverview })));
const LearningHub = lazy(() => import('./pages/dashboard/LearningHub').then(m => ({ default: m.LearningHub })));
const OpportunityHub = lazy(() => import('./pages/dashboard/OpportunityHub').then(m => ({ default: m.OpportunityHub })));
const ResumeAnalyzer = lazy(() => import('./pages/dashboard/ResumeAnalyzer').then(m => ({ default: m.ResumeAnalyzer })));
const RoadmapGenerator = lazy(() => import('./pages/dashboard/RoadmapGenerator').then(m => ({ default: m.RoadmapGenerator })));
const NotesSummarizer = lazy(() => import('./pages/dashboard/NotesSummarizer').then(m => ({ default: m.NotesSummarizer })));
const CareerCoach = lazy(() => import('./pages/dashboard/CareerCoach').then(m => ({ default: m.CareerCoach })));
const AIAnalytics = lazy(() => import('./pages/dashboard/AIAnalytics').then(m => ({ default: m.AIAnalytics })));
const Profile = lazy(() => import('./pages/dashboard/Profile').then(m => ({ default: m.Profile })));
const StudyAgent = lazy(() => import('./pages/dashboard/StudyAgent').then(m => ({ default: m.StudyAgent })));

const ManageEvents = lazy(() => import('./pages/dashboard/ManageEvents').then(m => ({ default: m.ManageEvents })));
const ManageHackathons = lazy(() => import('./pages/dashboard/ManageHackathons').then(m => ({ default: m.ManageHackathons })));
const ManageMembers = lazy(() => import('./pages/dashboard/ManageMembers').then(m => ({ default: m.ManageMembers })));
const ManageAssignments = lazy(() => import('./pages/dashboard/ManageAssignments').then(m => ({ default: m.ManageAssignments })));
const ManageAttendance = lazy(() => import('./pages/dashboard/ManageAttendance').then(m => ({ default: m.ManageAttendance })));
const ManageStudents = lazy(() => import('./pages/dashboard/ManageStudents').then(m => ({ default: m.ManageStudents })));
const ManageLectures = lazy(() => import('./pages/dashboard/ManageLectures').then(m => ({ default: m.ManageLectures })));
const FacultyCalendar = lazy(() => import('./pages/dashboard/FacultyCalendar').then(m => ({ default: m.FacultyCalendar })));
const ManageUsers = lazy(() => import('./pages/dashboard/ManageUsers').then(m => ({ default: m.ManageUsers })));
const ManageNotes = lazy(() => import('./pages/dashboard/ManageNotes').then(m => ({ default: m.ManageNotes })));
const StudentAssignments = lazy(() => import('./pages/dashboard/StudentAssignments').then(m => ({ default: m.StudentAssignments })));

const PageLoader = () => (
  <div className="min-h-[75vh] w-full flex flex-col items-center justify-center p-6 animate-pulse">
    <div className="w-full max-w-4xl space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 dark:bg-white/10 rounded-xl" />
          <div className="h-4 w-64 bg-gray-100 dark:bg-white/5 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-white/10 rounded-2xl" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-2xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200/50 dark:border-white/5 p-6 flex flex-col justify-between">
            <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded" />
            <div className="h-8 w-16 bg-gray-200 dark:bg-white/10 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Main Table Skeleton */}
      <div className="h-64 w-full rounded-2xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200/50 dark:border-white/5 p-6 space-y-4">
        <div className="h-5 w-36 bg-gray-200 dark:bg-white/10 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-full bg-gray-200/60 dark:bg-white/[0.06] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const RoleBasedDashboard = () => {
  const userStr = localStorage.getItem('campus_user');
  if (!userStr) return <Navigate to="/login" replace />;
  try {
    const user = JSON.parse(userStr);
    if (user.role === 'faculty') return <FacultyOverview />;
    if (user.role === 'club_admin') return <ClubAdminOverview />;
    if (user.role === 'admin') return <AdminOverview />;
    return <DashboardOverview />;
  } catch (e) {
    return <DashboardOverview />;
  }
};

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Home />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<RoleBasedDashboard />} />
            <Route path="study-agent" element={<StudyAgent />} />
            <Route path="learning" element={<LearningHub />} />
            <Route path="opportunities" element={<OpportunityHub />} />
            <Route path="resume" element={<ResumeAnalyzer />} />
            <Route path="roadmap" element={<RoadmapGenerator />} />
            <Route path="notes-summarizer" element={<NotesSummarizer />} />
            <Route path="career-coach" element={<CareerCoach />} />
            <Route path="ai-analytics" element={<AIAnalytics />} />
            <Route path="profile" element={<Profile />} />
            <Route path="calendar" element={<FacultyCalendar />} />
            <Route path="student-assignments" element={<StudentAssignments />} />
            
            {/* Faculty Routes */}
            <Route element={<FacultyRoute />}>
              <Route path="students" element={<ManageStudents />} />
              <Route path="lectures" element={<ManageLectures />} />
              <Route path="assignments" element={<ManageAssignments />} />
              <Route path="attendance" element={<ManageAttendance />} />
              <Route path="notes" element={<ManageNotes />} />
            </Route>

            {/* Club Admin Routes */}
            <Route element={<ClubAdminRoute />}>
              <Route path="events" element={<ManageEvents />} />
              <Route path="hackathons" element={<ManageHackathons />} />
              <Route path="members" element={<ManageMembers />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="users" element={<ManageUsers />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
