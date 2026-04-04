// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { useAuth } from "./context/AuthContext";
// import Login from "./pages/Login";
// import Join  from "./pages/Join";
// import ProtectedRoute from "./components/ProtectedRoute";

// function Dashboard() {
//   const { user, logout } = useAuth();
//   return (
//     <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
//       <div className="bg-[#1E293B] rounded-2xl p-8 text-center">
//         <h1 className="text-white text-2xl font-bold mb-2">Welcome, {user?.full_name}</h1>
//         <p className="text-slate-400 text-sm mb-1">Role: <span className="text-amber-400 font-medium">{user?.role}</span></p>
//         <p className="text-slate-400 text-sm mb-6">Phone: {user?.phone}</p>
//         <button onClick={logout} className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-sm font-semibold transition">Sign out</button>
//       </div>
//     </div>
//   );
// }

// function Unauthorized() {
//   return (
//     <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
//       <div className="bg-[#1E293B] rounded-2xl p-8 text-center">
//         <h1 className="text-white text-2xl font-bold mb-2">Access Denied</h1>
//         <p className="text-slate-400 text-sm">You don't have permission to view this page.</p>
//       </div>
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/join"  element={<Join />} />
//         <Route element={<ProtectedRoute />}>
//           <Route path="/dashboard" element={<Dashboard />} />
//         </Route>
//         <Route path="/unauthorized" element={<Unauthorized />} />
//         <Route path="/" element={<Navigate to="/dashboard" replace />} />
//         <Route path="*" element={<Navigate to="/dashboard" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }


import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Join  from "./pages/Join";
import ProtectedRoute from "./components/ProtectedRoute";

const ROLE_CONFIG = {
  admin:     { label:"Admin",     color:"#F59E0B", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.2)" },
  team_lead: { label:"Team Lead", color:"#60A5FA", bg:"rgba(96,165,250,0.1)",  border:"rgba(96,165,250,0.2)" },
  worker:    { label:"Worker",    color:"#34D399", bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.2)" },
};

function Dashboard() {
  const { user, logout } = useAuth();
  const roleConf = ROLE_CONFIG[user?.role] || ROLE_CONFIG.worker;

  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#080E1A", fontFamily:"'Barlow', sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 20px", position:"relative" }}>
      {/* Grid bg */}
      <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)`, backgroundSize:"40px 40px", pointerEvents:"none" }} />

      <div style={{ width:"100%", maxWidth:"480px", position:"relative" }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:"10px", justifyContent:"center", marginBottom:"40px" }}>
          <div style={{ width:"36px", height:"36px", borderRadius:"8px", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 21L3 8L12 3L21 8V21" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round"/><path d="M9 21V14H15V21" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:"18px", fontWeight:"700", letterSpacing:"4px", color:"#F59E0B" }}>BUILDER</span>
        </div>

        {/* Card */}
        <div style={{ background:"rgba(15,23,42,0.8)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"36px" }}>
          {/* Role badge + name */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"28px" }}>
            <div>
              <p style={{ fontSize:"12px", color:"#475569", marginBottom:"6px", textTransform:"uppercase", letterSpacing:"1px" }}>Welcome back</p>
              <h1 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:"28px", fontWeight:"700", color:"#F1F5F9", letterSpacing:"0.3px" }}>{user?.full_name}</h1>
            </div>
            <span style={{ fontSize:"11px", fontWeight:"600", padding:"5px 12px", borderRadius:"20px", background:roleConf.bg, border:`1px solid ${roleConf.border}`, color:roleConf.color, letterSpacing:"0.5px", textTransform:"uppercase", marginTop:"4px" }}>
              {roleConf.label}
            </span>
          </div>

          {/* Info rows */}
          <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom:"32px" }}>
            {[["Phone", user?.phone], ["Email", user?.email || "—"], ["Member since", new Date(user?.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })]].map(([label, val]) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:"8px" }}>
                <span style={{ fontSize:"12px", color:"#475569", textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</span>
                <span style={{ fontSize:"14px", color:"#94A3B8", fontWeight:"500" }}>{val}</span>
              </div>
            ))}
          </div>

          {/* Phase 2 coming soon */}
          <div style={{ padding:"16px", background:"rgba(245,158,11,0.04)", border:"1px dashed rgba(245,158,11,0.15)", borderRadius:"10px", marginBottom:"24px", textAlign:"center" }}>
            <p style={{ fontSize:"12px", color:"#64748B" }}>
              📋 <span style={{ color:"#F59E0B" }}>Phase 2 coming soon</span> — Clock in/out, attendance, team management
            </p>
          </div>

          <button onClick={logout} style={{ width:"100%", padding:"13px", background:"transparent", color:"#F87171", border:"1px solid rgba(248,113,113,0.2)", borderRadius:"10px", fontSize:"14px", fontWeight:"600", fontFamily:"'Barlow', sans-serif", cursor:"pointer", transition:"all 0.2s", letterSpacing:"0.3px" }}>
            Sign out
          </button>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700&display=swap');`}</style>
    </div>
  );
}

function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#080E1A", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Barlow', sans-serif" }}>
      <div style={{ background:"rgba(15,23,42,0.8)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"40px", textAlign:"center", maxWidth:"380px" }}>
        <h1 style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:"26px", fontWeight:"700", color:"#F1F5F9", marginBottom:"8px" }}>Access Denied</h1>
        <p style={{ fontSize:"14px", color:"#475569", marginBottom:"24px" }}>You don't have permission to view this page.</p>
        <button onClick={() => window.history.back()} style={{ padding:"10px 24px", background:"#F59E0B", color:"#0F172A", border:"none", borderRadius:"8px", fontSize:"14px", fontWeight:"600", cursor:"pointer", fontFamily:"'Barlow', sans-serif" }}>Go back</button>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700&display=swap');`}</style>
    </div>
  );
}

// Need useNavigate inside BrowserRouter so define here
function useNavigate() {
  return (path) => window.location.href = path;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"        element={<Login />} />
        <Route path="/join"         element={<Join />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard"  element={<Dashboard />} />
        </Route>
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/"             element={<Navigate to="/dashboard" replace />} />
        <Route path="*"             element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}