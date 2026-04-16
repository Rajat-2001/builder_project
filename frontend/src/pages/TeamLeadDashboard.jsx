// import { useState, useEffect, useRef } from "react";
// import { useAuth } from "../context/AuthContext";
// import {
//   clockIn, clockOut,
//   getAttendanceStatus,
//   getAttendanceHistory,
//   getAttendanceSummary,
//   getTeamAttendance,
// } from "../api/attendance";

// export default function TeamLeadDashboard() {
//   const { user, logout } = useAuth();
//   const [activeTab, setActiveTab] = useState("my");

//   // My attendance state
//   const [isClockedIn,   setIsClockedIn]   = useState(false);
//   const [clockInTime,   setClockInTime]   = useState(null);
//   const [elapsed,       setElapsed]       = useState("00:00:00");
//   const [history,       setHistory]       = useState([]);
//   const [summary,       setSummary]       = useState(null);
//   const [statusLoading, setStatusLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [msg,           setMsg]           = useState({ text:"", type:"" });

//   // Team state
//   const [teamRecords,   setTeamRecords]   = useState([]);
//   const [teamDate,      setTeamDate]      = useState(new Date().toISOString().split("T")[0]);
//   const [teamLoading,   setTeamLoading]   = useState(false);
//   const [teamCount,     setTeamCount]     = useState(0);

//   const timerRef = useRef(null);

//   useEffect(() => {
//     loadMyData();
//     return () => clearInterval(timerRef.current);
//   }, []);

//   const loadMyData = async () => {
//     setStatusLoading(true);
//     try {
//       const [statusData, historyData, summaryData] = await Promise.all([
//         getAttendanceStatus(),
//         getAttendanceHistory(),
//         getAttendanceSummary(),
//       ]);
//       setHistory(historyData);
//       setSummary(summaryData);
//       if (statusData.is_clocked_in) {
//         setIsClockedIn(true);
//         setClockInTime(new Date(statusData.clock_in));
//         startTimer(new Date(statusData.clock_in));
//       }
//     } catch (err) {
//       setMsg({ text: err.message, type:"error" });
//     } finally {
//       setStatusLoading(false);
//     }
//   };

//   const loadTeam = async (date) => {
//     setTeamLoading(true);
//     try {
//       const data = await getTeamAttendance(date);
//       setTeamRecords(data.records);
//       setTeamCount(data.count);
//     } catch (err) {
//       setMsg({ text: err.message, type:"error" });
//     } finally {
//       setTeamLoading(false);
//     }
//   };

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     if (tab === "team") loadTeam(teamDate);
//   };

//   const handleDateChange = (e) => {
//     setTeamDate(e.target.value);
//     loadTeam(e.target.value);
//   };

//   const startTimer = (from) => {
//     clearInterval(timerRef.current);
//     timerRef.current = setInterval(() => {
//       const diff = Math.floor((Date.now() - from.getTime()) / 1000);
//       const h = String(Math.floor(diff / 3600)).padStart(2, "0");
//       const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
//       const sec = String(diff % 60).padStart(2, "0");
//       setElapsed(`${h}:${m}:${sec}`);
//     }, 1000);
//   };

//   const stopTimer = () => {
//     clearInterval(timerRef.current);
//     setElapsed("00:00:00");
//   };

//   const handleClockIn = async () => {
//     setActionLoading(true);
//     setMsg({ text:"", type:"" });
//     try {
//       const data = await clockIn();
//       const now  = new Date(data.clock_in);
//       setIsClockedIn(true);
//       setClockInTime(now);
//       startTimer(now);
//       setMsg({ text:"✓ Clocked in successfully.", type:"success" });
//       loadMyData();
//     } catch (err) {
//       setMsg({ text: err.message, type:"error" });
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const handleClockOut = async () => {
//     setActionLoading(true);
//     setMsg({ text:"", type:"" });
//     try {
//       const data = await clockOut();
//       setIsClockedIn(false);
//       setClockInTime(null);
//       stopTimer();
//       setMsg({ text:`✓ Clocked out. You worked ${data.total_hours} hours today.`, type:"success" });
//       loadMyData();
//     } catch (err) {
//       setMsg({ text: err.message, type:"error" });
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const formatTime = (iso) => {
//     if (!iso) return "—";
//     return new Date(iso).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
//   };

//   const formatDate = (str) => {
//     if (!str) return "—";
//     return new Date(str).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
//   };

//   return (
//     <div style={s.root}>
//       <style>{css}</style>

//       {/* Navbar */}
//       <div style={s.navbar}>
//         <div style={s.navInner}>
//           <div style={s.navLogo}>
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//               <path d="M3 21V8L12 3L21 8V21" stroke="#0A66C2" strokeWidth="2.5" strokeLinejoin="round"/>
//               <path d="M9 21V14H15V21" stroke="#0A66C2" strokeWidth="2.5" strokeLinejoin="round"/>
//             </svg>
//             <span style={s.navBrand}>Builder</span>
//           </div>
//           <div style={s.navRight}>
//             <span style={s.navName}>{user?.full_name}</span>
//             <span style={s.badge}>Team Leader</span>
//             <button onClick={logout} style={s.logoutBtn} className="logout-hover">Sign out</button>
//           </div>
//         </div>
//       </div>

//       <div style={s.main}>

//         {/* Tabs */}
//         <div style={s.tabs}>
//           {[["my", "⏱ My Attendance"], ["team", "👥 My Team"]].map(([tab, label]) => (
//             <button
//               key={tab}
//               onClick={() => handleTabChange(tab)}
//               style={{...s.tab, ...(activeTab === tab ? s.tabActive : {})}}
//             >
//               {label}
//               {tab === "team" && teamCount > 0 && (
//                 <span style={s.tabCount}>{teamCount} present</span>
//               )}
//             </button>
//           ))}
//         </div>

//         {/* ── MY ATTENDANCE TAB ── */}
//         {activeTab === "my" && (
//           <div style={{display:"flex", flexDirection:"column", gap:"20px"}}>

//             {/* Clock card */}
//             <div style={s.clockCard}>
//               <div style={s.clockLeft}>
//                 <p style={s.clockLabel}>
//                   {statusLoading ? "Loading..." : isClockedIn ? "Currently on shift" : "Not clocked in"}
//                 </p>
//                 <div style={s.timerDisplay}>{isClockedIn ? elapsed : "00:00:00"}</div>
//                 {isClockedIn && clockInTime && (
//                   <p style={s.clockSubtext}>
//                     Clocked in at {formatTime(clockInTime.toISOString())} · {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })}
//                   </p>
//                 )}
//                 {msg.text && (
//                   <div style={{...s.msgBox, ...(msg.type === "success" ? s.msgSuccess : s.msgError)}}>
//                     {msg.text}
//                   </div>
//                 )}
//                 {!statusLoading && (
//                   <button
//                     onClick={isClockedIn ? handleClockOut : handleClockIn}
//                     disabled={actionLoading}
//                     style={{...s.clockBtn, ...(isClockedIn ? s.clockBtnOut : s.clockBtnIn), ...(actionLoading ? {opacity:0.6, cursor:"not-allowed"} : {})}}
//                     className="clock-btn-hover"
//                   >
//                     {actionLoading ? "Please wait..." : isClockedIn ? "⏹ Clock Out" : "▶ Clock In"}
//                   </button>
//                 )}
//               </div>
//               <div style={s.clockRight}>
//                 <div style={{...s.statusCircle, backgroundColor: isClockedIn ? "#F0FAF5" : "#F3F2EF", border:`2px solid ${isClockedIn ? "#057642" : "#C9C5C0"}`}}>
//                   <div style={{...s.statusDot, backgroundColor: isClockedIn ? "#057642" : "#C9C5C0", animation: isClockedIn ? "pulse-dot 2s infinite" : "none"}}/>
//                   <span style={{fontSize:"13px", fontWeight:"600", color: isClockedIn ? "#057642" : "#999", marginTop:"8px"}}>
//                     {isClockedIn ? "ON SITE" : "OFF SITE"}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Stats */}
//             {summary && (
//               <div style={s.statsRow}>
//                 {[
//                   ["⏱", "Hours this week",  `${summary.total_hours_this_week}h`],
//                   ["📅", "Hours this month", `${summary.total_hours_this_month}h`],
//                   ["✅", "Days present",     `${summary.days_present_this_month} days`],
//                 ].map(([icon, label, value]) => (
//                   <div key={label} style={s.statCard}>
//                     <span style={s.statIcon}>{icon}</span>
//                     <div>
//                       <div style={s.statValue}>{value}</div>
//                       <div style={s.statLabel}>{label}</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* My history table */}
//             <div style={s.tableCard}>
//               <h2 style={s.tableTitle}>My Attendance History</h2>
//               {history.length === 0 ? (
//                 <div style={s.emptyState}>No records yet.</div>
//               ) : (
//                 <table style={s.table}>
//                   <thead>
//                     <tr style={s.thead}>
//                       {["Date","Clock In","Clock Out","Hours","Status"].map(h => (
//                         <th key={h} style={s.th}>{h}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {history.map((r, i) => (
//                       <tr key={r.id} style={{...s.tr, ...(i%2===0?{}:s.trAlt)}}>
//                         <td style={{...s.td, fontWeight:"600"}}>{formatDate(r.shift_date)}</td>
//                         <td style={s.td}>{formatTime(r.clock_in)}</td>
//                         <td style={s.td}>{r.clock_out ? formatTime(r.clock_out) : "—"}</td>
//                         <td style={s.td}>{r.total_hours ? <span style={{fontWeight:"600", color:"#0A66C2"}}>{r.total_hours}h</span> : "—"}</td>
//                         <td style={s.td}>
//                           <span style={{fontSize:"12px", fontWeight:"600", padding:"3px 10px", borderRadius:"12px", backgroundColor: r.is_active?"#F0FAF5":"#F3F2EF", border:`1px solid ${r.is_active?"#B8DFC9":"#D0CFC9"}`, color: r.is_active?"#057642":"#666"}}>
//                             {r.is_active ? "Active" : "Completed"}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ── TEAM TAB ── */}
//         {activeTab === "team" && (
//           <div style={{display:"flex", flexDirection:"column", gap:"20px"}}>

//             {/* Date picker */}
//             <div style={s.teamHeader}>
//               <div>
//                 <h2 style={s.sectionTitle}>Team Attendance</h2>
//                 <p style={{fontSize:"13px", color:"#666", marginTop:"2px"}}>
//                   {teamCount} worker{teamCount !== 1 ? "s" : ""} present on selected date
//                 </p>
//               </div>
//               <div style={s.fieldGroup}>
//                 <label style={s.label}>Select date</label>
//                 <input
//                   type="date"
//                   value={teamDate}
//                   onChange={handleDateChange}
//                   style={s.input}
//                 />
//               </div>
//             </div>

//             {teamLoading ? (
//               <div style={s.loading}>Loading team attendance...</div>
//             ) : teamRecords.length === 0 ? (
//               <div style={s.emptyCard}>
//                 <span style={{fontSize:"32px"}}>📋</span>
//                 <p style={{fontSize:"14px", color:"#666", marginTop:"8px"}}>No attendance records for this date.</p>
//               </div>
//             ) : (
//               <div style={s.tableCard}>
//                 <table style={s.table}>
//                   <thead>
//                     <tr style={s.thead}>
//                       {["Worker","Phone","Clock In","Clock Out","Hours","Status"].map(h => (
//                         <th key={h} style={s.th}>{h}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {teamRecords.map((r, i) => (
//                       <tr key={r.record_id} style={{...s.tr, ...(i%2===0?{}:s.trAlt)}}>
//                         <td style={s.td}>
//                           <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
//                             <div style={{width:"32px", height:"32px", borderRadius:"50%", backgroundColor:"#FDF3E7", border:"1px solid #F0C98A", color:"#7A3E00", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:"700", flexShrink:0}}>
//                               {r.full_name.charAt(0).toUpperCase()}
//                             </div>
//                             <span style={{fontWeight:"600", color:"#000000E6"}}>{r.full_name}</span>
//                           </div>
//                         </td>
//                         <td style={s.td}>{r.phone}</td>
//                         <td style={s.td}>{formatTime(r.clock_in)}</td>
//                         <td style={s.td}>{r.clock_out ? formatTime(r.clock_out) : "—"}</td>
//                         <td style={s.td}>
//                           {r.total_hours
//                             ? <span style={{fontWeight:"600", color:"#0A66C2"}}>{r.total_hours}h</span>
//                             : <span style={{color:"#999"}}>In progress</span>}
//                         </td>
//                         <td style={s.td}>
//                           <span style={{fontSize:"12px", fontWeight:"600", padding:"3px 10px", borderRadius:"12px", backgroundColor: r.is_active?"#F0FAF5":"#F3F2EF", border:`1px solid ${r.is_active?"#B8DFC9":"#D0CFC9"}`, color: r.is_active?"#057642":"#666"}}>
//                             {r.is_active ? "On Site" : "Left"}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       <div style={s.footer}>
//         {["About","Help Center","Privacy","Terms","© 2025 Builder"].map(item => (
//           <span key={item} style={s.footerItem}>{item}</span>
//         ))}
//       </div>
//     </div>
//   );
// }

// const css = `
//   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
//   @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.2)} }
//   .logout-hover:hover { background: #F3F2EF !important; color: #CC1016 !important; }
//   .clock-btn-hover:hover:not(:disabled) { opacity: 0.88 !important; transform: translateY(-1px); }
//   * { box-sizing: border-box; }
//   table { border-collapse: collapse; }
// `;

// const s = {
//   root:        { minHeight:"100vh", backgroundColor:"#F3F2EF", fontFamily:"'Inter', sans-serif", display:"flex", flexDirection:"column" },
//   navbar:      { backgroundColor:"#FFFFFF", borderBottom:"1px solid #E0DFDC", position:"sticky", top:0, zIndex:100 },
//   navInner:    { maxWidth:"1100px", margin:"0 auto", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" },
//   navLogo:     { display:"flex", alignItems:"center", gap:"8px" },
//   navBrand:    { fontSize:"20px", fontWeight:"700", color:"#0A66C2", letterSpacing:"-0.3px" },
//   navRight:    { display:"flex", alignItems:"center", gap:"12px" },
//   navName:     { fontSize:"14px", fontWeight:"600", color:"#333" },
//   badge:       { fontSize:"12px", fontWeight:"600", padding:"4px 10px", borderRadius:"12px", backgroundColor:"#F0FAF5", border:"1px solid #B8DFC9", color:"#057642" },
//   logoutBtn:   { padding:"8px 18px", backgroundColor:"transparent", color:"#666", border:"1px solid #C9C5C0", borderRadius:"24px", fontSize:"14px", fontWeight:"600", cursor:"pointer", fontFamily:"'Inter', sans-serif", transition:"all 0.15s" },
//   main:        { flex:1, maxWidth:"1100px", margin:"0 auto", padding:"32px 24px", width:"100%" },
//   tabs:        { display:"flex", gap:"4px", borderBottom:"2px solid #E0DFDC", marginBottom:"24px" },
//   tab:         { padding:"10px 20px", fontSize:"14px", fontWeight:"600", color:"#666", background:"none", border:"none", cursor:"pointer", borderBottom:"2px solid transparent", marginBottom:"-2px", display:"flex", alignItems:"center", gap:"6px", transition:"all 0.15s", fontFamily:"'Inter', sans-serif" },
//   tabActive:   { color:"#0A66C2", borderBottomColor:"#0A66C2" },
//   tabCount:    { fontSize:"11px", backgroundColor:"#F0FAF5", color:"#057642", padding:"1px 6px", borderRadius:"10px", fontWeight:"700", border:"1px solid #B8DFC9" },
//   clockCard:   { backgroundColor:"#FFFFFF", borderRadius:"12px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)", padding:"36px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"32px" },
//   clockLeft:   { flex:1 },
//   clockLabel:  { fontSize:"13px", fontWeight:"600", color:"#666", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"8px" },
//   timerDisplay:{ fontSize:"52px", fontWeight:"700", color:"#000000E6", letterSpacing:"-1px", fontVariantNumeric:"tabular-nums", marginBottom:"8px" },
//   clockSubtext:{ fontSize:"13px", color:"#666", marginBottom:"20px" },
//   msgBox:      { padding:"10px 14px", borderRadius:"6px", fontSize:"13px", marginBottom:"16px" },
//   msgSuccess:  { backgroundColor:"#F0FAF5", border:"1px solid #B8DFC9", color:"#057642" },
//   msgError:    { backgroundColor:"#FFF0F0", border:"1px solid #FFCCCC", color:"#CC1016" },
//   clockBtn:    { padding:"14px 36px", borderRadius:"24px", fontSize:"16px", fontWeight:"700", cursor:"pointer", border:"none", fontFamily:"'Inter', sans-serif", transition:"all 0.15s" },
//   clockBtnIn:  { backgroundColor:"#0A66C2", color:"#FFFFFF" },
//   clockBtnOut: { backgroundColor:"#CC1016", color:"#FFFFFF" },
//   clockRight:  { display:"flex", alignItems:"center", justifyContent:"center" },
//   statusCircle:{ width:"120px", height:"120px", borderRadius:"50%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"4px", transition:"all 0.3s" },
//   statusDot:   { width:"16px", height:"16px", borderRadius:"50%", transition:"all 0.3s" },
//   statsRow:    { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px" },
//   statCard:    { backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)", padding:"20px", display:"flex", alignItems:"center", gap:"16px" },
//   statIcon:    { fontSize:"24px" },
//   statValue:   { fontSize:"22px", fontWeight:"700", color:"#000000E6" },
//   statLabel:   { fontSize:"12px", color:"#666", marginTop:"2px" },
//   tableCard:   { backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)", overflow:"hidden" },
//   tableTitle:  { fontSize:"16px", fontWeight:"700", color:"#000000E6", padding:"20px 20px 16px" },
//   teamHeader:  { display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"16px" },
//   sectionTitle:{ fontSize:"18px", fontWeight:"700", color:"#000000E6" },
//   fieldGroup:  { display:"flex", flexDirection:"column", gap:"6px" },
//   label:       { fontSize:"12px", fontWeight:"600", color:"#333" },
//   input:       { padding:"10px 12px", fontSize:"14px", border:"1.5px solid #C9C5C0", borderRadius:"6px", outline:"none", fontFamily:"'Inter', sans-serif", color:"#000000E6", backgroundColor:"#FFFFFF" },
//   emptyState:  { padding:"40px", textAlign:"center", color:"#999", fontSize:"14px" },
//   emptyCard:   { backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)", padding:"60px", textAlign:"center" },
//   loading:     { padding:"40px", textAlign:"center", color:"#666", fontSize:"14px" },
//   table:       { width:"100%", fontSize:"14px", borderCollapse:"collapse" },
//   thead:       { backgroundColor:"#F8F7F4" },
//   th:          { padding:"10px 16px", textAlign:"left", fontSize:"12px", fontWeight:"600", color:"#666", textTransform:"uppercase", letterSpacing:"0.5px" },
//   tr:          { borderBottom:"1px solid #F3F2EF" },
//   trAlt:       { backgroundColor:"#FAFAF8" },
//   td:          { padding:"12px 16px", color:"#333" },
//   footer:      { borderTop:"1px solid #E0DFDC", backgroundColor:"#FFFFFF", padding:"16px 24px", display:"flex", flexWrap:"wrap", gap:"16px", justifyContent:"center", marginTop:"auto" },
//   footerItem:  { fontSize:"12px", color:"#666", cursor:"pointer" },
// };


import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { getUnits, updateUnitStatus, addUnitTask } from "../api/units";
import { clockIn, clockOut, getSessionStatus, getTeamReports } from "../api/sessions";
import { getMySummary } from "../api/sessions";

const THEME = {
  bg: "#F3F2EF", white: "#FFFFFF", blue: "#0A66C2", blueLight: "#E8F0FE",
  border: "#E0DFDC", text: "#1a1a1a", muted: "#666",
  green: "#057642", greenBg: "#EAF3DE", greenBorder: "#C0DD97",
  amber: "#854F0B", amberBg: "#FFF3E0", amberBorder: "#FAC775",
  red: "#A32D2D", redBg: "#FCEBEB", redBorder: "#F7C1C1",
  grayBg: "#F3F2EF", grayBorder: "#E0DFDC",
};

const STATUS_CONFIG = {
  done:        { label: "Done",        bg: "#EAF3DE", border: "#C0DD97", color: "#057642", dot: "#639922" },
  in_progress: { label: "In progress", bg: "#FFF3E0", border: "#FAC775", color: "#854F0B", dot: "#BA7517" },
  issue:       { label: "Issue",       bg: "#FCEBEB", border: "#F7C1C1", color: "#A32D2D", dot: "#E24B4A" },
  not_started: { label: "Not started", bg: "#F3F2EF", border: "#E0DFDC", color: "#555",    dot: "#B4B2A9" },
};

const ROLE_LABELS = {
  admin: "Administrator", team_lead: "Team Leader", worker: "Worker",
  architect: "Architect", customer: "Customer", supervisor: "Supervisor",
};

export default function TeamLeadDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("units");

  // Session
  const [session, setSession] = useState(null);
  const [timer, setTimer] = useState("00:00:00");
  const timerRef = useRef(null);

  // Projects + units
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [units, setUnits] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Reports
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Summary
  const [summary, setSummary] = useState([]);

  // Custom task form
  const [newTask, setNewTask] = useState("");
  const [newTaskCat, setNewTaskCat] = useState("general");

  // UI
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workedUnitIds, setWorkedUnitIds] = useState([]);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  useEffect(() => {
    fetch("http://localhost:8000/projects/all", {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    }).then(r => r.json()).then(data => {
      const seen = new Set();
      const list = (Array.isArray(data) ? data : []).filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
      setProjects(list);
      if (list.length > 0) setSelectedProject(list[0]);
    }).catch(() => {});

    getSessionStatus().then(s => {
      if (s.clocked_in) { setSession(s); startTimer(new Date(s.clock_in)); }
    }).catch(() => {});

    getMySummary().then(setSummary).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    const pid = selectedProject.id;
    getUnits(pid).then(setUnits).catch(() => {});
    if (activeTab === "reports") loadReports(pid);
  }, [selectedProject]);

  const loadReports = async (pid) => {
    setReportsLoading(true);
    try {
      const data = await getTeamReports(pid || selectedProject?.id);
      setReports(data);
    } catch (e) { showMsg(e.message, "error"); }
    setReportsLoading(false);
  };

  const startTimer = (clockInTime) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const diff = Math.floor((Date.now() - clockInTime.getTime()) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const s = String(diff % 60).padStart(2, "0");
      setTimer(`${h}:${m}:${s}`);
    }, 1000);
  };

  const handleClockIn = async () => {
    if (!selectedProject) return showMsg("Select a project first", "error");
    setLoading(true);
    try {
      const s = await clockIn(selectedProject.id);
      setSession(s);
      startTimer(new Date(s.clock_in));
      showMsg("Clocked in successfully");
    } catch (e) { showMsg(e.message, "error"); }
    setLoading(false);
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      const result = await clockOut(workedUnitIds);
      clearInterval(timerRef.current);
      setSession(null);
      setTimer("00:00:00");
      setWorkedUnitIds([]);
      getMySummary().then(setSummary);
      showMsg(`Clocked out — ${result.total_hours}h logged`);
    } catch (e) { showMsg(e.message, "error"); }
    setLoading(false);
  };

  const handleStatusChange = async (unitId, status) => {
    try {
      await updateUnitStatus(unitId, status);
      setUnits(prev => prev.map(u => u.id === unitId ? { ...u, status } : u));
      if (selectedUnit?.id === unitId) setSelectedUnit(prev => ({ ...prev, status }));
      showMsg("Unit status updated");
    } catch (e) { showMsg(e.message, "error"); }
  };

  const handleAddTask = async () => {
    if (!newTask.trim() || !selectedUnit) return;
    try {
      await addUnitTask(selectedUnit.id, { name: newTask, category: newTaskCat });
      setNewTask("");
      showMsg("Task added");
    } catch (e) { showMsg(e.message, "error"); }
  };

  const filteredUnits = units.filter(u =>
    filter === "all" ||
    (filter === "housing" && u.unit_type === "housing") ||
    (filter === "ancillary" && u.unit_type === "ancillary") ||
    (filter === "carport" && u.unit_type === "carport") ||
    (filter === "technical" && u.unit_type === "technical")
  );

  const grouped = {
    issue:       filteredUnits.filter(u => u.status === "issue"),
    in_progress: filteredUnits.filter(u => u.status === "in_progress"),
    not_started: filteredUnits.filter(u => u.status === "not_started"),
    done:        filteredUnits.filter(u => u.status === "done"),
  };

  const totalHours = summary.reduce((a, b) => a + (b.total_hours || 0), 0);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: THEME.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>

      {/* Topbar */}
      <div style={{ background: THEME.white, borderBottom: `1px solid ${THEME.border}`, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1128, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 21V8L12 3L21 8V21" stroke={THEME.blue} strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M9 21V14H15V21" stroke={THEME.blue} strokeWidth="2.5" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 18, fontWeight: 700, color: THEME.blue }}>Builder</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: THEME.muted }}>{user?.full_name}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 12, background: "#F0FAF5", color: THEME.green, border: `1px solid ${THEME.greenBorder}` }}>
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
            <button onClick={logout} style={{ padding: "6px 14px", border: `1px solid ${THEME.border}`, borderRadius: 20, background: "transparent", color: THEME.muted, fontSize: 12, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Check in bar */}
      <div style={{ background: THEME.white, borderBottom: `1px solid ${THEME.border}` }}>
        <div style={{ maxWidth: 1128, margin: "0 auto", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <select
            value={selectedProject?.id || ""}
            onChange={e => {
              const p = projects.find(p => p.id === e.target.value);
              setSelectedProject(p);
              setSelectedUnit(null);
            }}
            disabled={!!session}
            style={{ fontSize: 13, padding: "6px 10px", borderRadius: 8, border: `1px solid ${THEME.border}`, background: THEME.bg, color: THEME.text, fontFamily: "Inter, sans-serif" }}
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          {!session ? (
            <button onClick={handleClockIn} disabled={loading}
              style={{ padding: "7px 18px", borderRadius: 8, border: "none", background: THEME.blue, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              Check in
            </button>
          ) : (
            <button onClick={handleClockOut} disabled={loading}
              style={{ padding: "7px 18px", borderRadius: 8, border: `1px solid ${THEME.border}`, background: THEME.white, color: THEME.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              Check out
            </button>
          )}

          {session && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: THEME.blue }}>{timer}</span>
              <span style={{ fontSize: 12, color: THEME.muted }}>on {selectedProject?.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {msg && (
        <div style={{ position: "fixed", top: 70, right: 20, zIndex: 999, padding: "10px 18px", borderRadius: 8, background: msg.type === "error" ? THEME.redBg : THEME.greenBg, border: `1px solid ${msg.type === "error" ? THEME.redBorder : THEME.greenBorder}`, color: msg.type === "error" ? THEME.red : THEME.green, fontSize: 13, fontWeight: 500 }}>
          {msg.text}
        </div>
      )}

      <div style={{ maxWidth: 1128, margin: "0 auto", padding: 20 }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Total hours",         value: `${totalHours.toFixed(1)}h` },
            { label: "Units in progress",   value: units.filter(u => u.status === "in_progress").length },
            { label: "Units done",          value: units.filter(u => u.status === "done").length },
            { label: "Issues",              value: units.filter(u => u.status === "issue").length },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 11, color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: THEME.blue }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: `2px solid ${THEME.border}`, marginBottom: 20 }}>
          {[["units", "Site units"], ["reports", "Work reports"]].map(([tab, label]) => (
            <button key={tab} onClick={() => { setActiveTab(tab); if (tab === "reports" && selectedProject) loadReports(selectedProject.id); }}
              style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, color: activeTab === tab ? THEME.blue : THEME.muted, background: "none", border: "none", borderBottom: `2px solid ${activeTab === tab ? THEME.blue : "transparent"}`, marginBottom: -2, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Units tab */}
        {activeTab === "units" && (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {["all", "housing", "ancillary", "carport", "technical"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${filter === f ? THEME.blue : THEME.border}`, background: filter === f ? THEME.blue : THEME.white, color: filter === f ? "#fff" : THEME.muted, fontSize: 12, cursor: "pointer", fontFamily: "Inter, sans-serif", fontWeight: filter === f ? 600 : 400 }}>
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: selectedUnit ? "1fr 360px" : "1fr", gap: 16 }}>
              <div>
                {Object.entries(grouped).map(([status, unitList]) => {
                  if (unitList.length === 0) return null;
                  const cfg = STATUS_CONFIG[status];
                  return (
                    <div key={status} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dot }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: THEME.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>{cfg.label}</span>
                        <span style={{ fontSize: 11, color: THEME.muted }}>{unitList.length} unit{unitList.length !== 1 ? "s" : ""}</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {unitList.map(u => (
                          <button key={u.id} onClick={() => setSelectedUnit(u)}
                            style={{ padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${selectedUnit?.id === u.id ? THEME.blue : cfg.border}`, background: selectedUnit?.id === u.id ? THEME.blueLight : cfg.bg, color: selectedUnit?.id === u.id ? THEME.blue : cfg.color, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                            {u.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Unit detail + controls */}
              {selectedUnit && (
                <div style={{ background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16, alignSelf: "start" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: THEME.text, marginBottom: 14 }}>{selectedUnit.name}</div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 6 }}>Update status</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <button key={key} onClick={() => handleStatusChange(selectedUnit.id, key)}
                          style={{ padding: "4px 12px", borderRadius: 20, border: `1px solid ${selectedUnit.status === key ? cfg.color : cfg.border}`, background: selectedUnit.status === key ? cfg.bg : THEME.white, color: cfg.color, fontSize: 11, fontWeight: selectedUnit.status === key ? 700 : 400, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 8 }}>Add custom task</div>
                    <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Task name..."
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12, fontFamily: "Inter, sans-serif", marginBottom: 6 }} />
                    <select value={newTaskCat} onChange={e => setNewTaskCat(e.target.value)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12, fontFamily: "Inter, sans-serif", marginBottom: 8 }}>
                      {["general", "structural", "utilities", "finishing", "special"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button onClick={handleAddTask}
                      style={{ width: "100%", padding: "7px 0", borderRadius: 8, border: "none", background: THEME.blue, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                      Add task
                    </button>
                  </div>

                  <div style={{ fontSize: 11, color: THEME.muted, textAlign: "center" }}>
                    Click a unit tag to select it, then update its status or add custom tasks.
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Reports tab */}
        {activeTab === "reports" && (
          <div>
            {reportsLoading ? (
              <div style={{ textAlign: "center", padding: 40, color: THEME.muted }}>Loading reports...</div>
            ) : reports.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: THEME.muted, background: THEME.white, borderRadius: 12, border: `1px solid ${THEME.border}` }}>
                No work reports submitted yet for this project.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* {reports.map(r => (
                  <div key={r.session_id} style={{ background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: THEME.text }}>{r.worker}</span>
                        <span style={{ fontSize: 12, color: THEME.muted, marginLeft: 8 }}>{r.session_date}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: THEME.blue }}>{r.total_hours ? `${r.total_hours}h` : "Active"}</span>
                    </div>

                    {r.units_worked?.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: THEME.muted }}>Units: </span>
                        {r.units_worked.map(u => (
                          <span key={u.id} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: THEME.blueLight, color: THEME.blue, marginLeft: 4 }}>{u.name}</span>
                        ))}
                      </div>
                    )}

                    {r.tasks_completed?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 4 }}>Tasks completed:</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {r.tasks_completed.map((t, i) => (
                            <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: THEME.greenBg, color: THEME.green, border: `1px solid ${THEME.greenBorder}` }}>✓ {t.task}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))} */}
                {reports.map(r => (
                  <div key={r.session_id} style={{ background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: THEME.blueLight, color: THEME.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                          {r.worker?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: THEME.text }}>{r.worker}</div>
                          <div style={{ fontSize: 11, color: THEME.muted }}>{r.session_date}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: THEME.blue }}>
                          {r.total_hours ? `${r.total_hours}h logged` : "Currently on site"}
                        </div>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: r.total_hours ? THEME.greenBg : THEME.amberBg, color: r.total_hours ? THEME.green : THEME.amber, border: `1px solid ${r.total_hours ? THEME.greenBorder : THEME.amberBorder}` }}>
                          {r.total_hours ? "Completed" : "Active"}
                        </span>
                      </div>
                    </div>

                    {r.units_worked?.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: THEME.muted }}>Units worked on: </span>
                        {[...new Map(r.units_worked.map(u => [u.id, u])).values()].map(u => (
                          <span key={u.id} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: THEME.blueLight, color: THEME.blue, marginLeft: 4 }}>{u.name}</span>
                        ))}
                      </div>
                    )}

                    {r.tasks_completed?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 4 }}>Tasks completed:</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {r.tasks_completed.map((t, i) => (
                            <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: THEME.greenBg, color: THEME.green, border: `1px solid ${THEME.greenBorder}` }}>✓ {t.task}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {r.tasks_completed?.length === 0 && r.units_worked?.length === 0 && (
                      <div style={{ fontSize: 12, color: THEME.muted, fontStyle: "italic" }}>No tasks submitted yet for this session.</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${THEME.border}`, background: THEME.white, padding: "14px 24px", display: "flex", gap: 16, justifyContent: "center", marginTop: 40 }}>
        {["About", "Help Center", "Privacy", "Terms", "© 2025 Builder"].map(item => (
          <span key={item} style={{ fontSize: 12, color: THEME.muted }}>{item}</span>
        ))}
      </div>
    </div>
  );
}