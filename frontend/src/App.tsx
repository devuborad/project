import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { FacultyRoute } from './components/layout/FacultyRoute';
import { ClubAdminRoute } from './components/layout/ClubAdminRoute';
import { AdminRoute } from './components/layout/AdminRoute';
import { Home } from './pages/Home';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { DashboardOverview } from './pages/dashboard/Overview';
import { FacultyOverview } from './pages/dashboard/FacultyOverview';
import { ClubAdminOverview } from './pages/dashboard/ClubAdminOverview';
import { AdminOverview } from './pages/dashboard/AdminOverview';
import { LearningHub } from './pages/dashboard/LearningHub';
import { OpportunityHub } from './pages/dashboard/OpportunityHub';
import { ResumeStudio } from './pages/dashboard/ResumeStudio';
import { Profile } from './pages/dashboard/Profile';

import { ManageEvents } from './pages/dashboard/ManageEvents';
import { ManageHackathons } from './pages/dashboard/ManageHackathons';
import { ManageMembers } from './pages/dashboard/ManageMembers';
import { ManageAssignments } from './pages/dashboard/ManageAssignments';
import { ManageAttendance } from './pages/dashboard/ManageAttendance';
import { ManageStudents } from './pages/dashboard/ManageStudents';
import { ManageLectures } from './pages/dashboard/ManageLectures';
import { FacultyCalendar } from './pages/dashboard/FacultyCalendar';
import { ManageUsers } from './pages/dashboard/ManageUsers';

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
          <Route path="learning" element={<LearningHub />} />
          <Route path="opportunities" element={<OpportunityHub />} />
          <Route path="resume" element={<ResumeStudio />} />
          <Route path="profile" element={<Profile />} />
          <Route path="calendar" element={<FacultyCalendar />} />
          
          {/* Faculty Routes */}
          <Route element={<FacultyRoute />}>
            <Route path="students" element={<ManageStudents />} />
            <Route path="lectures" element={<ManageLectures />} />
            <Route path="assignments" element={<ManageAssignments />} />
            <Route path="attendance" element={<ManageAttendance />} />
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
    </BrowserRouter>
  );
}

export default App;
