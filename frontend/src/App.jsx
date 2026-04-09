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


// import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
// import { useAuth } from "./context/AuthContext";
// import Login from "./pages/Login";
// import Join  from "./pages/Join";
// import ProtectedRoute from "./components/ProtectedRoute";

// const ROLE_CONFIG = {
//   admin:     { label:"Administrator", color:"#0A66C2", bg:"#EEF3FB", border:"#C0D7F5" },
//   team_lead: { label:"Team Leader",   color:"#057642", bg:"#F0FAF5", border:"#B8DFC9" },
//   worker:    { label:"Worker",        color:"#7A3E00", bg:"#FDF3E7", border:"#F0C98A" },
//   architect: { label:"Architect",     color:"#6B3FA0", bg:"#F5EFFC", border:"#D4AFEF" },
//   customer:  { label:"Customer",      color:"#B24020", bg:"#FDF0EC", border:"#F5C2B0" },
// };

// function Dashboard() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const roleConf = ROLE_CONFIG[user?.role] || ROLE_CONFIG.worker;

//   return (
//     <div style={ds.root}>
//       <style>{css}</style>

//       {/* Navbar */}
//       <div style={ds.navbar}>
//         <div style={ds.navInner}>
//           <div style={ds.navLogo}>
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//               <path d="M3 21V8L12 3L21 8V21" stroke="#0A66C2" strokeWidth="2.5" strokeLinejoin="round"/>
//               <path d="M9 21V14H15V21" stroke="#0A66C2" strokeWidth="2.5" strokeLinejoin="round"/>
//             </svg>
//             <span style={ds.navBrand}>Builder</span>
//           </div>
//           <div style={ds.navRight}>
//             <span style={ds.navName}>{user?.full_name}</span>
//             <button onClick={logout} style={ds.logoutBtn} className="logout-hover">Sign out</button>
//           </div>
//         </div>
//       </div>

//       {/* Main */}
//       <div style={ds.main}>
//         <div style={ds.content}>

//           {/* Profile card */}
//           <div style={ds.profileCard}>
//             {/* Cover */}
//             <div style={ds.cover} />
//             {/* Avatar */}
//             <div style={ds.avatarWrap}>
//               <div style={ds.avatar}>
//                 {user?.full_name?.charAt(0).toUpperCase()}
//               </div>
//             </div>
//             <div style={ds.profileInfo}>
//               <div style={ds.profileTop}>
//                 <div>
//                   <h1 style={ds.profileName}>{user?.full_name}</h1>
//                   <span style={{fontSize:"12px", fontWeight:"600", padding:"4px 10px", borderRadius:"12px", backgroundColor:roleConf.bg, border:`1px solid ${roleConf.border}`, color:roleConf.color}}>
//                     {roleConf.label}
//                   </span>
//                 </div>
//               </div>
//               <div style={ds.profileDetails}>
//                 <div style={ds.detailRow}>
//                   <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6.6 10.8C7.8 13.2 9.8 15.2 12.2 16.4L14 14.6C14.2 14.4 14.6 14.4 14.8 14.5C15.8 14.9 16.9 15.1 18 15.1C18.6 15.1 19 15.5 19 16.1V19C19 19.6 18.6 20 18 20C9.2 20 2 12.8 2 4C2 3.4 2.4 3 3 3H6C6.6 3 7 3.4 7 4C7 5.1 7.2 6.2 7.6 7.2C7.7 7.5 7.6 7.8 7.4 8L5.6 9.8C6 10.2 6.3 10.5 6.6 10.8Z" fill="#666"/></svg>
//                   <span style={ds.detailText}>{user?.phone}</span>
//                 </div>
//                 {user?.email && (
//                   <div style={ds.detailRow}>
//                     <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" stroke="#666" strokeWidth="2"/><path d="M22 6L12 13L2 6" stroke="#666" strokeWidth="2"/></svg>
//                     <span style={ds.detailText}>{user?.email}</span>
//                   </div>
//                 )}
//                 <div style={ds.detailRow}>
//                   <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#666" strokeWidth="2"/><path d="M16 2V6M8 2V6M3 10H21" stroke="#666" strokeWidth="2" strokeLinecap="round"/></svg>
//                   <span style={ds.detailText}>Member since {new Date(user?.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Phase 2 coming soon cards */}
//           <div style={ds.sectionTitle}>What's coming in Phase 2</div>
//           <div style={ds.cardsGrid}>
//             {[
//               { icon:"⏱️", title:"Clock In / Out", desc:"Track your daily attendance with one tap.", roles:["worker","team_lead"] },
//               { icon:"📊", title:"Attendance History", desc:"View your full shift history and hours.", roles:["worker","team_lead"] },
//               { icon:"👥", title:"Team Management", desc:"See your team's attendance and performance.", roles:["team_lead","admin"] },
//               { icon:"🔗", title:"Invite Generator", desc:"Generate invite links for new members.", roles:["admin"] },
//             ].map(({ icon, title, desc, roles }) => (
//               <div key={title} style={ds.featureCard}>
//                 <div style={ds.featureCardIcon}>{icon}</div>
//                 <div>
//                   <div style={ds.featureCardTitle}>{title}</div>
//                   <div style={ds.featureCardDesc}>{desc}</div>
//                   <div style={{display:"flex", gap:"6px", marginTop:"10px", flexWrap:"wrap"}}>
//                     {roles.map(r => {
//                       const rc = ROLE_CONFIG[r];
//                       return rc ? (
//                         <span key={r} style={{fontSize:"11px", padding:"2px 8px", borderRadius:"10px", backgroundColor:rc.bg, border:`1px solid ${rc.border}`, color:rc.color, fontWeight:"600"}}>
//                           {rc.label}
//                         </span>
//                       ) : null;
//                     })}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//         </div>
//       </div>

//       {/* Footer */}
//       <div style={ds.footer}>
//         {["About", "Help Center", "Privacy", "Terms", "© 2025 Builder"].map(item => (
//           <span key={item} style={ds.footerItem}>{item}</span>
//         ))}
//       </div>
//     </div>
//   );
// }

// function Unauthorized() {
//   const navigate = useNavigate();
//   return (
//     <div style={{minHeight:"100vh", backgroundColor:"#F3F2EF", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter', sans-serif"}}>
//       <div style={{backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)", padding:"40px", textAlign:"center", maxWidth:"380px"}}>
//         <h1 style={{fontSize:"22px", fontWeight:"700", color:"#000000E6", marginBottom:"8px"}}>Access Denied</h1>
//         <p style={{fontSize:"14px", color:"#666", marginBottom:"24px"}}>You don't have permission to view this page.</p>
//         <button onClick={() => navigate("/dashboard")} style={{padding:"10px 24px", backgroundColor:"#0A66C2", color:"#FFFFFF", border:"none", borderRadius:"24px", fontSize:"14px", fontWeight:"600", cursor:"pointer", fontFamily:"'Inter', sans-serif"}}>Go to dashboard</button>
//       </div>
//     </div>
//   );
// }

// const css = `
//   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
//   @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
//   .logout-hover:hover { background: #F3F2EF !important; color: #CC1016 !important; }
//   * { box-sizing: border-box; }
// `;

// const ds = {
//   root: { minHeight:"100vh", backgroundColor:"#F3F2EF", fontFamily:"'Inter', sans-serif", display:"flex", flexDirection:"column" },
//   navbar: { backgroundColor:"#FFFFFF", borderBottom:"1px solid #E0DFDC", position:"sticky", top:0, zIndex:100 },
//   navInner: { maxWidth:"1128px", margin:"0 auto", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" },
//   navLogo: { display:"flex", alignItems:"center", gap:"8px" },
//   navBrand: { fontSize:"20px", fontWeight:"700", color:"#0A66C2", letterSpacing:"-0.3px" },
//   navRight: { display:"flex", alignItems:"center", gap:"16px" },
//   navName: { fontSize:"14px", fontWeight:"600", color:"#333" },
//   logoutBtn: { padding:"8px 18px", backgroundColor:"transparent", color:"#666", border:"1px solid #C9C5C0", borderRadius:"24px", fontSize:"14px", fontWeight:"600", cursor:"pointer", fontFamily:"'Inter', sans-serif", transition:"all 0.15s" },
//   main: { flex:1, maxWidth:"1128px", margin:"0 auto", padding:"24px 24px", width:"100%" },
//   content: { maxWidth:"720px" },
//   profileCard: { backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)", marginBottom:"16px", overflow:"hidden", animation:"fadeUp 0.35s ease forwards" },
//   cover: { height:"120px", background:"linear-gradient(135deg, #0A66C2 0%, #004182 100%)" },
//   avatarWrap: { padding:"0 24px" },
//   avatar: { width:"80px", height:"80px", borderRadius:"50%", backgroundColor:"#0A66C2", border:"4px solid #FFFFFF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", fontWeight:"700", color:"#FFFFFF", marginTop:"-40px" },
//   profileInfo: { padding:"12px 24px 24px" },
//   profileTop: { display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"16px" },
//   profileName: { fontSize:"22px", fontWeight:"700", color:"#000000E6", marginBottom:"8px" },
//   profileDetails: { display:"flex", flexDirection:"column", gap:"8px" },
//   detailRow: { display:"flex", alignItems:"center", gap:"8px" },
//   detailText: { fontSize:"14px", color:"#555" },
//   sectionTitle: { fontSize:"16px", fontWeight:"700", color:"#000000E6", marginBottom:"12px", marginTop:"8px" },
//   cardsGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" },
//   featureCard: { backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)", padding:"20px", display:"flex", gap:"14px", alignItems:"flex-start" },
//   featureCardIcon: { fontSize:"24px", flexShrink:0 },
//   featureCardTitle: { fontSize:"15px", fontWeight:"600", color:"#000000E6", marginBottom:"4px" },
//   featureCardDesc: { fontSize:"13px", color:"#666", lineHeight:"1.5" },
//   footer: { borderTop:"1px solid #E0DFDC", backgroundColor:"#FFFFFF", padding:"16px 24px", display:"flex", flexWrap:"wrap", gap:"16px", justifyContent:"center", marginTop:"auto" },
//   footerItem: { fontSize:"12px", color:"#666", cursor:"pointer" },
// };

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login"        element={<Login />} />
//         <Route path="/join"         element={<Join />} />
//         <Route element={<ProtectedRoute />}>
//           <Route path="/dashboard"  element={<Dashboard />} />
//         </Route>
//         <Route path="/unauthorized" element={<Unauthorized />} />
//         <Route path="/"             element={<Navigate to="/dashboard" replace />} />
//         <Route path="*"             element={<Navigate to="/dashboard" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Pages
import Login             from "./pages/Login";
import Join              from "./pages/Join";
import AdminDashboard    from "./pages/AdminDashboard";
import WorkerDashboard   from "./pages/WorkerDashboard";
import TeamLeadDashboard from "./pages/TeamLeadDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

// Guards
import ProtectedRoute from "./components/ProtectedRoute";


// ── Smart redirect based on role ──
// Called when user hits "/" or "/dashboard"
// Sends each role to their own page
function RoleRedirect() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight:"100vh", backgroundColor:"#F3F2EF", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter', sans-serif" }}>
      <p style={{ color:"#666", fontSize:"14px" }}>Loading...</p>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "admin":     return <Navigate to="/admin"    replace />;
    case "team_lead": return <Navigate to="/team"     replace />;
    case "worker":    return <Navigate to="/worker"   replace />;
    case "customer":  return <Navigate to="/customer" replace />;
    case "architect": return <Navigate to="/team"     replace />; // architect → team lead view for now
    default:          return <Navigate to="/login"    replace />;
  }
}


// ── Unauthorized page ──
function Unauthorized() {
  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#F3F2EF", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter', sans-serif" }}>
      <div style={{ backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)", padding:"40px", textAlign:"center", maxWidth:"380px" }}>
        <div style={{ fontSize:"48px", marginBottom:"16px" }}>🚫</div>
        <h1 style={{ fontSize:"22px", fontWeight:"700", color:"#000000E6", marginBottom:"8px", fontFamily:"'Inter', sans-serif" }}>
          Access Denied
        </h1>
        <p style={{ fontSize:"14px", color:"#666", marginBottom:"24px", lineHeight:"1.6" }}>
          You don't have permission to view this page.
        </p>
        <a href="/dashboard" style={{ padding:"10px 24px", backgroundColor:"#0A66C2", color:"#FFFFFF", border:"none", borderRadius:"24px", fontSize:"14px", fontWeight:"600", cursor:"pointer", fontFamily:"'Inter', sans-serif", textDecoration:"none" }}>
          Go to my dashboard
        </a>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>
    </div>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public routes ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/join"  element={<Join />} />

        {/* ── Smart role redirect ── */}
        <Route path="/"          element={<RoleRedirect />} />
        <Route path="/dashboard" element={<RoleRedirect />} />

        {/* ── Admin only ── */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* ── Worker only ── */}
        <Route element={<ProtectedRoute allowedRoles={["worker"]} />}>
          <Route path="/worker" element={<WorkerDashboard />} />
        </Route>

        {/* ── Team Lead + Architect ── */}
        <Route element={<ProtectedRoute allowedRoles={["team_lead", "architect"]} />}>
          <Route path="/team" element={<TeamLeadDashboard />} />
        </Route>

        {/* ── Customer only ── */}
        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
          <Route path="/customer" element={<CustomerDashboard />} />
        </Route>

        {/* ── Utility routes ── */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ── 404 fallback ── */}
        <Route path="*" element={<RoleRedirect />} />

      </Routes>
    </BrowserRouter>
  );
}