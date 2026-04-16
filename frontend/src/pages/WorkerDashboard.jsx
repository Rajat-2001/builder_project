// import { useState, useEffect, useRef } from "react";
// import { useAuth } from "../context/AuthContext";
// import {
//   clockIn, clockOut,
//   getAttendanceStatus,
//   getAttendanceHistory,
//   getAttendanceSummary,
// } from "../api/attendance";

// export default function WorkerDashboard() {
//   const { user, logout } = useAuth();

//   const [isClockedIn,  setIsClockedIn]  = useState(false);
//   const [clockInTime,  setClockInTime]  = useState(null);
//   const [elapsed,      setElapsed]      = useState("00:00:00");
//   const [history,      setHistory]      = useState([]);
//   const [summary,      setSummary]      = useState(null);
//   const [statusLoading,setStatusLoading]= useState(true);
//   const [actionLoading,setActionLoading]= useState(false);
//   const [msg,          setMsg]          = useState({ text:"", type:"" });

//   const timerRef = useRef(null);

//   // ── Load status + history + summary on mount ──
//   useEffect(() => {
//     loadAll();
//     return () => clearInterval(timerRef.current);
//   }, []);

//   const loadAll = async () => {
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
//       setMsg({ text: err.message, type: "error" });
//     } finally {
//       setStatusLoading(false);
//     }
//   };

//   // ── Live timer ──
//   const startTimer = (from) => {
//     clearInterval(timerRef.current);
//     timerRef.current = setInterval(() => {
//       const diff = Math.floor((Date.now() - from.getTime()) / 1000);
//       const h    = String(Math.floor(diff / 3600)).padStart(2, "0");
//       const m    = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
//       const s    = String(diff % 60).padStart(2, "0");
//       setElapsed(`${h}:${m}:${s}`);
//     }, 1000);
//   };

//   const stopTimer = () => {
//     clearInterval(timerRef.current);
//     setElapsed("00:00:00");
//   };

//   // ── Clock In ──
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
//       loadAll();
//     } catch (err) {
//       setMsg({ text: err.message, type:"error" });
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // ── Clock Out ──
//   const handleClockOut = async () => {
//     setActionLoading(true);
//     setMsg({ text:"", type:"" });
//     try {
//       const data = await clockOut();
//       setIsClockedIn(false);
//       setClockInTime(null);
//       stopTimer();
//       setMsg({ text: `✓ Clocked out. You worked ${data.total_hours} hours today.`, type:"success" });
//       loadAll();
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

//   const formatDate = (dateStr) => {
//     if (!dateStr) return "—";
//     return new Date(dateStr).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
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
//             <span style={s.workerBadge}>Worker</span>
//             <button onClick={logout} style={s.logoutBtn} className="logout-hover">Sign out</button>
//           </div>
//         </div>
//       </div>

//       <div style={s.main}>

//         {/* Clock in/out card */}
//         <div style={s.clockCard}>
//           <div style={s.clockLeft}>
//             <p style={s.clockLabel}>
//               {statusLoading ? "Loading..." : isClockedIn ? "Currently on shift" : "Not clocked in"}
//             </p>

//             {/* Big timer */}
//             <div style={s.timerDisplay}>{isClockedIn ? elapsed : "00:00:00"}</div>

//             {isClockedIn && clockInTime && (
//               <p style={s.clockSubtext}>
//                 Clocked in at {formatTime(clockInTime.toISOString())} · {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })}
//               </p>
//             )}

//             {/* Message */}
//             {msg.text && (
//               <div style={{...s.msgBox, ...(msg.type === "success" ? s.msgSuccess : s.msgError)}}>
//                 {msg.text}
//               </div>
//             )}

//             {/* Clock in/out button */}
//             {!statusLoading && (
//               <button
//                 onClick={isClockedIn ? handleClockOut : handleClockIn}
//                 disabled={actionLoading}
//                 style={{
//                   ...s.clockBtn,
//                   ...(isClockedIn ? s.clockBtnOut : s.clockBtnIn),
//                   ...(actionLoading ? s.clockBtnDisabled : {}),
//                 }}
//                 className="clock-btn-hover"
//               >
//                 {actionLoading
//                   ? "Please wait..."
//                   : isClockedIn
//                   ? "⏹ Clock Out"
//                   : "▶ Clock In"}
//               </button>
//             )}
//           </div>

//           {/* Status indicator */}
//           <div style={s.clockRight}>
//             <div style={{
//               ...s.statusCircle,
//               backgroundColor: isClockedIn ? "#F0FAF5" : "#F3F2EF",
//               border: `2px solid ${isClockedIn ? "#057642" : "#C9C5C0"}`,
//             }}>
//               <div style={{
//                 ...s.statusDot,
//                 backgroundColor: isClockedIn ? "#057642" : "#C9C5C0",
//                 animation: isClockedIn ? "pulse-dot 2s infinite" : "none",
//               }}/>
//               <span style={{
//                 fontSize:"13px",
//                 fontWeight:"600",
//                 color: isClockedIn ? "#057642" : "#999",
//                 marginTop:"8px",
//               }}>
//                 {isClockedIn ? "ON SITE" : "OFF SITE"}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Stats cards */}
//         {summary && (
//           <div style={s.statsRow}>
//             {[
//               ["⏱", "Hours this week",  `${summary.total_hours_this_week}h`],
//               ["📅", "Hours this month", `${summary.total_hours_this_month}h`],
//               ["✅", "Days present",     `${summary.days_present_this_month} days`],
//             ].map(([icon, label, value]) => (
//               <div key={label} style={s.statCard}>
//                 <span style={s.statIcon}>{icon}</span>
//                 <div>
//                   <div style={s.statValue}>{value}</div>
//                   <div style={s.statLabel}>{label}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Attendance history */}
//         <div style={s.historyCard}>
//           <h2 style={s.historyTitle}>Attendance History</h2>
//           {history.length === 0 ? (
//             <div style={s.emptyState}>No attendance records yet. Clock in to start tracking.</div>
//           ) : (
//             <div style={s.tableWrap}>
//               <table style={s.table}>
//                 <thead>
//                   <tr style={s.thead}>
//                     <th style={s.th}>Date</th>
//                     <th style={s.th}>Clock In</th>
//                     <th style={s.th}>Clock Out</th>
//                     <th style={s.th}>Hours</th>
//                     <th style={s.th}>Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {history.map((r, i) => (
//                     <tr key={r.id} style={{...s.tr, ...(i % 2 === 0 ? {} : s.trAlt)}}>
//                       <td style={{...s.td, fontWeight:"600"}}>{formatDate(r.shift_date)}</td>
//                       <td style={s.td}>{formatTime(r.clock_in)}</td>
//                       <td style={s.td}>{r.clock_out ? formatTime(r.clock_out) : "—"}</td>
//                       <td style={s.td}>
//                         {r.total_hours ? (
//                           <span style={{fontWeight:"600", color:"#0A66C2"}}>{r.total_hours}h</span>
//                         ) : "—"}
//                       </td>
//                       <td style={s.td}>
//                         <span style={{
//                           fontSize:"12px", fontWeight:"600", padding:"3px 10px",
//                           borderRadius:"12px",
//                           backgroundColor: r.is_active ? "#F0FAF5" : "#F3F2EF",
//                           border: `1px solid ${r.is_active ? "#B8DFC9" : "#D0CFC9"}`,
//                           color: r.is_active ? "#057642" : "#666",
//                         }}>
//                           {r.is_active ? "Active" : "Completed"}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//       </div>

//       {/* Footer */}
//       <div style={s.footer}>
//         {["About", "Help Center", "Privacy", "Terms", "© 2025 Builder"].map(item => (
//           <span key={item} style={s.footerItem}>{item}</span>
//         ))}
//       </div>
//     </div>
//   );
// }

// const css = `
//   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
//   @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.2)} }
//   @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
//   .logout-hover:hover { background: #F3F2EF !important; color: #CC1016 !important; }
//   .clock-btn-hover:hover:not(:disabled) { opacity: 0.88 !important; transform: translateY(-1px); }
//   * { box-sizing: border-box; }
//   table { border-collapse: collapse; }
// `;

// const s = {
//   root:       { minHeight:"100vh", backgroundColor:"#F3F2EF", fontFamily:"'Inter', sans-serif", display:"flex", flexDirection:"column" },
//   navbar:     { backgroundColor:"#FFFFFF", borderBottom:"1px solid #E0DFDC", position:"sticky", top:0, zIndex:100 },
//   navInner:   { maxWidth:"1000px", margin:"0 auto", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" },
//   navLogo:    { display:"flex", alignItems:"center", gap:"8px" },
//   navBrand:   { fontSize:"20px", fontWeight:"700", color:"#0A66C2", letterSpacing:"-0.3px" },
//   navRight:   { display:"flex", alignItems:"center", gap:"12px" },
//   navName:    { fontSize:"14px", fontWeight:"600", color:"#333" },
//   workerBadge:{ fontSize:"12px", fontWeight:"600", padding:"4px 10px", borderRadius:"12px", backgroundColor:"#FDF3E7", border:"1px solid #F0C98A", color:"#7A3E00" },
//   logoutBtn:  { padding:"8px 18px", backgroundColor:"transparent", color:"#666", border:"1px solid #C9C5C0", borderRadius:"24px", fontSize:"14px", fontWeight:"600", cursor:"pointer", fontFamily:"'Inter', sans-serif", transition:"all 0.15s" },
//   main:       { flex:1, maxWidth:"1000px", margin:"0 auto", padding:"32px 24px", width:"100%", display:"flex", flexDirection:"column", gap:"20px" },
//   clockCard:  { backgroundColor:"#FFFFFF", borderRadius:"12px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)", padding:"36px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"32px", animation:"fadeIn 0.35s ease forwards" },
//   clockLeft:  { flex:1 },
//   clockLabel: { fontSize:"13px", fontWeight:"600", color:"#666", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"8px" },
//   timerDisplay:{ fontSize:"52px", fontWeight:"700", color:"#000000E6", letterSpacing:"-1px", fontVariantNumeric:"tabular-nums", marginBottom:"8px", fontFamily:"'Inter', monospace" },
//   clockSubtext:{ fontSize:"13px", color:"#666", marginBottom:"20px" },
//   msgBox:     { padding:"10px 14px", borderRadius:"6px", fontSize:"13px", marginBottom:"16px" },
//   msgSuccess: { backgroundColor:"#F0FAF5", border:"1px solid #B8DFC9", color:"#057642" },
//   msgError:   { backgroundColor:"#FFF0F0", border:"1px solid #FFCCCC", color:"#CC1016" },
//   clockBtn:   { padding:"14px 36px", borderRadius:"24px", fontSize:"16px", fontWeight:"700", cursor:"pointer", border:"none", fontFamily:"'Inter', sans-serif", transition:"all 0.15s", letterSpacing:"0.3px" },
//   clockBtnIn: { backgroundColor:"#0A66C2", color:"#FFFFFF" },
//   clockBtnOut:{ backgroundColor:"#CC1016", color:"#FFFFFF" },
//   clockBtnDisabled:{ opacity:0.6, cursor:"not-allowed" },
//   clockRight: { display:"flex", alignItems:"center", justifyContent:"center" },
//   statusCircle:{ width:"120px", height:"120px", borderRadius:"50%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"4px", transition:"all 0.3s" },
//   statusDot:  { width:"16px", height:"16px", borderRadius:"50%", transition:"all 0.3s" },
//   statsRow:   { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px" },
//   statCard:   { backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)", padding:"20px", display:"flex", alignItems:"center", gap:"16px" },
//   statIcon:   { fontSize:"24px" },
//   statValue:  { fontSize:"22px", fontWeight:"700", color:"#000000E6", letterSpacing:"-0.3px" },
//   statLabel:  { fontSize:"12px", color:"#666", marginTop:"2px" },
//   historyCard:{ backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)", overflow:"hidden" },
//   historyTitle:{ fontSize:"16px", fontWeight:"700", color:"#000000E6", padding:"20px 20px 16px" },
//   emptyState: { padding:"40px", textAlign:"center", color:"#999", fontSize:"14px" },
//   tableWrap:  { overflowX:"auto" },
//   table:      { width:"100%", fontSize:"14px" },
//   thead:      { backgroundColor:"#F8F7F4" },
//   th:         { padding:"10px 16px", textAlign:"left", fontSize:"12px", fontWeight:"600", color:"#666", textTransform:"uppercase", letterSpacing:"0.5px" },
//   tr:         { borderBottom:"1px solid #F3F2EF" },
//   trAlt:      { backgroundColor:"#FAFAF8" },
//   td:         { padding:"12px 16px", color:"#333" },
//   footer:     { borderTop:"1px solid #E0DFDC", backgroundColor:"#FFFFFF", padding:"16px 24px", display:"flex", flexWrap:"wrap", gap:"16px", justifyContent:"center", marginTop:"auto" },
//   footerItem: { fontSize:"12px", color:"#666", cursor:"pointer" },
// };


import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { getUnits, getUnit } from "../api/units";
import { clockIn, clockOut, getSessionStatus, submitWorkReport } from "../api/sessions";
import { getMySummary } from "../api/sessions";
import { getMyBonus } from "../api/bonus";

const THEME = {
  bg: "#F3F2EF",
  white: "#FFFFFF",
  blue: "#0A66C2",
  blueLight: "#E8F0FE",
  border: "#E0DFDC",
  text: "#1a1a1a",
  muted: "#666",
  green: "#057642",
  greenBg: "#EAF3DE",
  greenBorder: "#C0DD97",
  amber: "#854F0B",
  amberBg: "#FFF3E0",
  amberBorder: "#FAC775",
  red: "#A32D2D",
  redBg: "#FCEBEB",
  redBorder: "#F7C1C1",
  gray: "#555",
  grayBg: "#F3F2EF",
  grayBorder: "#E0DFDC",
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

export default function WorkerDashboard() {
  const { user, logout } = useAuth();

  // Session state
  const [session, setSession] = useState(null);
  const [timer, setTimer] = useState("00:00:00");
  const timerRef = useRef(null);

  // Project + units
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [units, setUnits] = useState([]);
  const [filter, setFilter] = useState("all");

  // Unit detail
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitDetail, setUnitDetail] = useState(null);
  const [tickedTasks, setTickedTasks] = useState({});

  // Summary
  const [summary, setSummary] = useState([]);
  const [bonus, setBonus] = useState(0);

  // UI
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [workedUnitIds, setWorkedUnitIds] = useState([]);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  // Load projects on mount
  useEffect(() => {
    fetch("http://localhost:8000/projects/all", {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.projects || [];
        setProjects(list);
        if (list.length > 0) setSelectedProject(list[0]);
      })
      .catch(() => {});
  }, []);

  // Load session status
  useEffect(() => {
    getSessionStatus().then(s => {
      if (s.clocked_in) {
        setSession(s);
        startTimer(new Date(s.clock_in));
      }
    }).catch(() => {});
    getMySummary().then(setSummary).catch(() => {});
    getMyBonus().then(b => setBonus(b.total_bonus_hours || 0)).catch(() => {});
  }, []);

  // Load units when project changes
  useEffect(() => {
    if (!selectedProject) return;
    getUnits(selectedProject.id || selectedProject.project_id)
      .then(setUnits)
      .catch(() => {});
  }, [selectedProject]);

  // Load unit detail when unit selected
  useEffect(() => {
    if (!selectedUnit) return;
    getUnit(selectedUnit.id).then(data => {
      setUnitDetail(data);
      setTickedTasks({});
    }).catch(() => {});
  }, [selectedUnit]);

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
      const projId = selectedProject.id || selectedProject.project_id;
      const s = await clockIn(projId);
      setSession(s);
      startTimer(new Date(s.clock_in));
      showMsg("Clocked in successfully");
    } catch (e) {
      showMsg(e.message, "error");
    }
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
    } catch (e) {
      showMsg(e.message, "error");
    }
    setLoading(false);
  };

  const handleSubmitReport = async () => {
    if (!unitDetail) return;
    const taskCompletions = Object.entries(tickedTasks)
      .filter(([, v]) => v)
      .map(([id]) => ({ unit_task_id: id, note: "" }));
    const unitIds = [selectedUnit.id];
    if (!workedUnitIds.includes(selectedUnit.id)) {
      setWorkedUnitIds(prev => [...prev, selectedUnit.id]);
    }
    try {
      await submitWorkReport(unitIds, taskCompletions);
      showMsg("Work report submitted to team lead");
    } catch (e) {
      showMsg(e.message, "error");
    }
  };

  // Group units by status
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

  const totalRealHours = summary.reduce((a, b) => a + (b.total_hours || 0), 0);
  const projectHours = summary.find(s =>
    s.project_id === (selectedProject?.id || selectedProject?.project_id)
  )?.total_hours || 0;

  const initials = user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: THEME.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

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
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 12, background: THEME.blueLight, color: THEME.blue }}>
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
            value={selectedProject?.id || selectedProject?.project_id || ""}
            onChange={e => {
              const p = projects.find(p => (p.id || p.project_id) === e.target.value);
              setSelectedProject(p);
              setSelectedUnit(null);
              setUnitDetail(null);
            }}
            disabled={!!session}
            style={{ fontSize: 13, padding: "6px 10px", borderRadius: 8, border: `1px solid ${THEME.border}`, background: THEME.bg, color: THEME.text, fontFamily: "Inter, sans-serif" }}
          >
            {projects.map(p => (
              <option key={p.id || p.project_id} value={p.id || p.project_id}>{p.name}</option>
            ))}
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

      {/* Message toast */}
      {msg && (
        <div style={{ position: "fixed", top: 70, right: 20, zIndex: 999, padding: "10px 18px", borderRadius: 8, background: msg.type === "error" ? THEME.redBg : THEME.greenBg, border: `1px solid ${msg.type === "error" ? THEME.redBorder : THEME.greenBorder}`, color: msg.type === "error" ? THEME.red : THEME.green, fontSize: 13, fontWeight: 500 }}>
          {msg.text}
        </div>
      )}

            {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 20, background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 10, overflow: "hidden" }}>
        {[
          { step: 1, label: "Select project", done: !!selectedProject, active: !session && !!selectedProject },
          { step: 2, label: "Check in",       done: !!session,          active: !!selectedProject && !session },
          { step: 3, label: "Tick tasks",     done: Object.values(tickedTasks).some(Boolean), active: !!session && !Object.values(tickedTasks).some(Boolean) },
          { step: 4, label: "Submit report",  done: false,              active: !!session && Object.values(tickedTasks).some(Boolean) },
        ].map(({ step, label, done, active }, i, arr) => (
          <div key={step} style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 8px",
            background: done ? THEME.greenBg : active ? THEME.blueLight : THEME.white,
            borderRight: i < arr.length - 1 ? `1px solid ${THEME.border}` : "none",
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, flexShrink: 0,
              background: done ? THEME.green : active ? THEME.blue : THEME.border,
              color: done || active ? "#fff" : THEME.muted,
            }}>
              {done ? "✓" : step}
            </div>
            <span style={{
              fontSize: 12, fontWeight: active || done ? 600 : 400,
              color: done ? THEME.green : active ? THEME.blue : THEME.muted,
              whiteSpace: "nowrap",
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 1128, margin: "0 auto", padding: "20px" }}>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Total hours worked", value: `${totalRealHours.toFixed(1)}h` },
            { label: `Hours on ${selectedProject?.name || "project"}`, value: `${projectHours.toFixed(1)}h` },
            { label: "Bonus hours", value: `${bonus.toFixed(1)}h` },
            { label: "Units in progress", value: grouped.in_progress.length },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 11, color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: THEME.blue }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {["all", "housing", "ancillary", "carport", "technical"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${filter === f ? THEME.blue : THEME.border}`, background: filter === f ? THEME.blue : THEME.white, color: filter === f ? "#fff" : THEME.muted, fontSize: 12, cursor: "pointer", fontFamily: "Inter, sans-serif", fontWeight: filter === f ? 600 : 400 }}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Unit groups */}
        <div style={{ display: "grid", gridTemplateColumns: unitDetail ? "1fr 340px" : "1fr", gap: 16 }}>
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
                        style={{ padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${selectedUnit?.id === u.id ? THEME.blue : cfg.border}`, background: selectedUnit?.id === u.id ? THEME.blueLight : cfg.bg, color: selectedUnit?.id === u.id ? THEME.blue : cfg.color, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif", outline: selectedUnit?.id === u.id ? `2px solid ${THEME.blue}` : "none", outlineOffset: 1 }}>
                        {u.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {units.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: THEME.muted, fontSize: 14 }}>
                No units found for this project.
              </div>
            )}
          </div>

          {/* Unit detail panel */}
          {unitDetail && (
            <div style={{ background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16, alignSelf: "start" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: THEME.text, marginBottom: 14 }}>
                {selectedUnit?.name}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${THEME.border}` }}>
                <span style={{ fontSize: 12, color: THEME.muted }}>Status</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: STATUS_CONFIG[selectedUnit?.status]?.bg, color: STATUS_CONFIG[selectedUnit?.status]?.color, border: `1px solid ${STATUS_CONFIG[selectedUnit?.status]?.border}` }}>
                  {STATUS_CONFIG[selectedUnit?.status]?.label}
                </span>
              </div>

              <div style={{ padding: "10px 0", borderBottom: `1px solid ${THEME.border}` }}>
                <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 8 }}>Tasks</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
                  {unitDetail.tasks?.map(task => (
                    <label key={task.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: session ? "pointer" : "default", padding: "4px 0" }}>
                      <input type="checkbox"
                        checked={!!tickedTasks[task.id]}
                        disabled={!session}
                        onChange={e => setTickedTasks(prev => ({ ...prev, [task.id]: e.target.checked }))}
                        style={{ width: 14, height: 14, accentColor: THEME.blue }}
                      />
                      <span style={{ fontSize: 12, color: THEME.text }}>{task.name}</span>
                      <span style={{ fontSize: 10, color: THEME.muted, marginLeft: "auto", background: THEME.bg, padding: "1px 6px", borderRadius: 6 }}>{task.category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {session && (
                <button onClick={handleSubmitReport}
                  style={{ width: "100%", marginTop: 12, padding: "8px 0", borderRadius: 8, border: "none", background: THEME.blue, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                  Submit to team lead
                </button>
              )}

              {!session && (
                <p style={{ fontSize: 11, color: THEME.muted, textAlign: "center", marginTop: 10 }}>Clock in to tick tasks and submit reports</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${THEME.border}`, background: THEME.white, padding: "14px 24px", display: "flex", gap: 16, justifyContent: "center", marginTop: 40 }}>
        {["About", "Help Center", "Privacy", "Terms", "© 2025 Builder"].map(item => (
          <span key={item} style={{ fontSize: 12, color: THEME.muted }}>{item}</span>
        ))}
      </div>
    </div>
  );
}