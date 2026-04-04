import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute — wraps any route that requires authentication.
 *
 * Usage in App.jsx:
 *
 * // Any logged-in user:
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 * </Route>
 *
 * // Admin only:
 * <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
 *   <Route path="/admin" element={<AdminPanel />} />
 * </Route>
 *
 * // Admin or Team Lead:
 * <Route element={<ProtectedRoute allowedRoles={["admin", "team_lead"]} />}>
 *   <Route path="/team" element={<TeamPanel />} />
 * </Route>
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  // ── Still checking localStorage / verifying token ──
  // Show nothing while AuthContext is resolving the session.
  // Without this, there's a flash where the user gets redirected
  // to /login even though they have a valid token — it just
  // hasn't been verified yet.
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <p className="text-slate-400 text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  // ── Not logged in ──
  // Redirect to login page.
  // `replace` means the login page replaces this entry in browser
  // history — pressing back won't bring them to the protected page.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ── Logged in but wrong role ──
  // Only runs if allowedRoles was passed to this component.
  // If user's role isn't in the allowed list → 403-style redirect.
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ── All checks passed ──
  // Render the child route's component.
  // <Outlet /> is React Router's way of rendering nested routes.
  return <Outlet />;
}