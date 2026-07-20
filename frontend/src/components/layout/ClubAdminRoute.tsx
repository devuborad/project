import { Navigate, Outlet } from 'react-router-dom';

export function ClubAdminRoute() {
  const userStr = localStorage.getItem('campus_user');
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {}
  }

  if (!user || user.role !== 'club_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
