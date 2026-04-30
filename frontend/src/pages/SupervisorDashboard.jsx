// import { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import { getUnits, updateUnitStatus } from "../api/units";
// import { getTeamReports } from "../api/sessions";

// const THEME = {
//   bg: "#F3F2EF", white: "#FFFFFF", blue: "#0A66C2", blueLight: "#E8F0FE",
//   border: "#E0DFDC", text: "#1a1a1a", muted: "#666",
//   green: "#057642", greenBg: "#EAF3DE", greenBorder: "#C0DD97",
//   amber: "#854F0B", amberBg: "#FFF3E0", amberBorder: "#FAC775",
//   red: "#A32D2D", redBg: "#FCEBEB", redBorder: "#F7C1C1",
// };

// const STATUS_CONFIG = {
//   done:        { label: "Done",        bg: "#EAF3DE", border: "#C0DD97", color: "#057642", dot: "#639922" },
//   in_progress: { label: "In progress", bg: "#FFF3E0", border: "#FAC775", color: "#854F0B", dot: "#BA7517" },
//   issue:       { label: "Issue",       bg: "#FCEBEB", border: "#F7C1C1", color: "#A32D2D", dot: "#E24B4A" },
//   not_started: { label: "Not started", bg: "#F3F2EF", border: "#E0DFDC", color: "#555",    dot: "#B4B2A9" },
// };

// export default function SupervisorDashboard() {
//   const { user, logout } = useAuth();
//   const [activeTab, setActiveTab] = useState("overview");
//   const [projects, setProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [units, setUnits] = useState([]);
//   const [reports, setReports] = useState([]);
//   const [reportsLoading, setReportsLoading] = useState(false);
//   const [msg, setMsg] = useState(null);

//   const showMsg = (text, type = "success") => {
//     setMsg({ text, type });
//     setTimeout(() => setMsg(null), 3000);
//   };

//   useEffect(() => {
//     fetch("http://localhost:8000/projects/all", {
//       headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
//     }).then(r => r.json()).then(data => {
//       const seen = new Set();
//       const list = (Array.isArray(data) ? data : []).filter(p => {
//         if (seen.has(p.id)) return false;
//         seen.add(p.id);
//         return true;
//       });
//       setProjects(list);
//       if (list.length > 0) setSelectedProject(list[0]);
//     }).catch(() => {});
//   }, []);

//   useEffect(() => {
//     if (!selectedProject) return;
//     getUnits(selectedProject.id).then(setUnits).catch(() => {});
//     loadReports(selectedProject.id);
//   }, [selectedProject]);

//   const loadReports = async (pid) => {
//     setReportsLoading(true);
//     try {
//       const data = await getTeamReports(pid);
//       setReports(data);
//     } catch (e) { showMsg(e.message, "error"); }
//     setReportsLoading(false);
//   };

//   const handleFlagIssue = async (unitId) => {
//     try {
//       await updateUnitStatus(unitId, "issue");
//       setUnits(prev => prev.map(u => u.id === unitId ? { ...u, status: "issue" } : u));
//       showMsg("Unit flagged as issue");
//     } catch (e) { showMsg(e.message, "error"); }
//   };

//   // Workers currently active
// const today = new Date().toISOString().split("T")[0];
// const activeWorkers = reports.filter(r => !r.total_hours && r.session_date === today);
// const completedToday = reports.filter(r => r.total_hours && r.session_date === today);

//   const grouped = {
//     issue:       units.filter(u => u.status === "issue"),
//     in_progress: units.filter(u => u.status === "in_progress"),
//     not_started: units.filter(u => u.status === "not_started"),
//     done:        units.filter(u => u.status === "done"),
//   };

//   return (
//     <div style={{ minHeight: "100vh", backgroundColor: THEME.bg, fontFamily: "'Inter', sans-serif" }}>
//       <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0;}`}</style>

//       {/* Topbar */}
//       <div style={{ background: THEME.white, borderBottom: `1px solid ${THEME.border}`, position: "sticky", top: 0, zIndex: 100 }}>
//         <div style={{ maxWidth: 1128, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//               <path d="M3 21V8L12 3L21 8V21" stroke={THEME.blue} strokeWidth="2.5" strokeLinejoin="round"/>
//               <path d="M9 21V14H15V21" stroke={THEME.blue} strokeWidth="2.5" strokeLinejoin="round"/>
//             </svg>
//             <span style={{ fontSize: 18, fontWeight: 700, color: THEME.blue }}>Builder</span>
//           </div>
//           <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//             <span style={{ fontSize: 13, color: THEME.muted }}>{user?.full_name}</span>
//             <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 12, background: THEME.blueLight, color: THEME.blue, border: `1px solid #B5D4F4` }}>
//               Supervisor
//             </span>
//             <button onClick={logout} style={{ padding: "6px 14px", border: `1px solid ${THEME.border}`, borderRadius: 20, background: "transparent", color: THEME.muted, fontSize: 12, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
//               Sign out
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Toast */}
//       {msg && (
//         <div style={{ position: "fixed", top: 70, right: 20, zIndex: 999, padding: "10px 18px", borderRadius: 8, background: msg.type === "error" ? THEME.redBg : THEME.greenBg, border: `1px solid ${msg.type === "error" ? THEME.redBorder : THEME.greenBorder}`, color: msg.type === "error" ? THEME.red : THEME.green, fontSize: 13, fontWeight: 500 }}>
//           {msg.text}
//         </div>
//       )}

//       <div style={{ maxWidth: 1128, margin: "0 auto", padding: 20 }}>

//         {/* Project selector */}
//         <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
//           <select value={selectedProject?.id || ""}
//             onChange={e => {
//               const p = projects.find(p => p.id === e.target.value);
//               setSelectedProject(p);
//             }}
//             style={{ fontSize: 13, padding: "7px 12px", borderRadius: 8, border: `1px solid ${THEME.border}`, background: THEME.white, color: THEME.text, fontFamily: "Inter, sans-serif" }}>
//             {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
//           </select>
//           <span style={{ fontSize: 13, color: THEME.muted }}>Supervisor view</span>
//         </div>

//         {/* Stats */}
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 20 }}>
//           {[
//             { label: "On site now",     value: activeWorkers.length,                          color: "#22c55e" },
//             { label: "Completed today", value: completedToday.length,                         color: THEME.blue },
//             { label: "Units in progress", value: grouped.in_progress.length,                  color: THEME.amber },
//             { label: "Issues flagged",  value: grouped.issue.length,                          color: THEME.red },
//             { label: "Units done",      value: grouped.done.length,                           color: THEME.green },
//           ].map(({ label, value, color }) => (
//             <div key={label} style={{ background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: "12px 16px" }}>
//               <div style={{ fontSize: 11, color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
//               <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
//             </div>
//           ))}
//         </div>

//         {/* Tabs */}
//         <div style={{ display: "flex", gap: 4, borderBottom: `2px solid ${THEME.border}`, marginBottom: 20 }}>
//           {[["overview", "Site overview"], ["workers", "Workers on site"], ["reports", "Work reports"]].map(([tab, label]) => (
//             <button key={tab} onClick={() => setActiveTab(tab)}
//               style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, color: activeTab === tab ? THEME.blue : THEME.muted, background: "none", border: "none", borderBottom: `2px solid ${activeTab === tab ? THEME.blue : "transparent"}`, marginBottom: -2, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
//               {label}
//             </button>
//           ))}
//         </div>

//         {/* Overview tab — unit grid with flag button */}
//         {activeTab === "overview" && (
//   <div>
//     {/* Quick summary bar */}
//     <div style={{ background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
//       <span style={{ fontSize: 13, fontWeight: 600, color: THEME.text }}>Project snapshot</span>
//       {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
//         const count = units.filter(u => u.status === key).length;
//         return (
//           <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
//             <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dot }} />
//             <span style={{ fontSize: 12, color: THEME.muted }}>{cfg.label}:</span>
//             <span style={{ fontSize: 12, fontWeight: 700, color: THEME.text }}>{count}</span>
//           </div>
//         );
//       })}
//       <div style={{ marginLeft: "auto", fontSize: 12, color: THEME.muted }}>
//         {units.length} total units
//       </div>
//     </div>

//     {/* Issues first — most important */}
//     {grouped.issue.length > 0 && (
//       <div style={{ background: THEME.redBg, border: `1px solid ${THEME.redBorder}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
//           <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E24B4A" }} />
//           <span style={{ fontSize: 12, fontWeight: 700, color: THEME.red, textTransform: "uppercase", letterSpacing: "0.05em" }}>Issues — needs attention</span>
//           <span style={{ fontSize: 11, color: THEME.red }}>{grouped.issue.length} unit{grouped.issue.length !== 1 ? "s" : ""}</span>
//         </div>
//         <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
//           {grouped.issue.map(u => (
//             <div key={u.id} style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${THEME.redBorder}`, background: THEME.white, color: THEME.red, fontSize: 12, fontWeight: 600 }}>
//               {u.name} {u.notes && <span style={{ fontWeight: 400, color: THEME.muted }}>— {u.notes}</span>}
//             </div>
//           ))}
//         </div>
//       </div>
//     )}

//     {/* In progress */}
//     {grouped.in_progress.length > 0 && (
//       <div style={{ marginBottom: 16 }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
//           <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#BA7517" }} />
//           <span style={{ fontSize: 12, fontWeight: 600, color: THEME.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>In progress</span>
//           <span style={{ fontSize: 11, color: THEME.muted }}>{grouped.in_progress.length} units</span>
//         </div>
//         <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
//           {grouped.in_progress.map(u => (
//             <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px 5px 14px", borderRadius: 20, border: `1px solid ${STATUS_CONFIG.in_progress.border}`, background: STATUS_CONFIG.in_progress.bg }}>
//               <span style={{ fontSize: 12, fontWeight: 500, color: STATUS_CONFIG.in_progress.color }}>{u.name}</span>
//               <button onClick={() => handleFlagIssue(u.id)}
//                 style={{ padding: "1px 6px", borderRadius: 6, border: `1px solid ${THEME.redBorder}`, background: THEME.white, color: THEME.red, fontSize: 10, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
//                 Flag issue
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     )}

//     {/* Not started */}
//     {grouped.not_started.length > 0 && (
//       <div style={{ marginBottom: 16 }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
//           <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#B4B2A9" }} />
//           <span style={{ fontSize: 12, fontWeight: 600, color: THEME.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>Not started</span>
//           <span style={{ fontSize: 11, color: THEME.muted }}>{grouped.not_started.length} units</span>
//         </div>
//         <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
//           {grouped.not_started.map(u => (
//             <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px 5px 14px", borderRadius: 20, border: `1px solid ${STATUS_CONFIG.not_started.border}`, background: STATUS_CONFIG.not_started.bg }}>
//               <span style={{ fontSize: 12, fontWeight: 500, color: STATUS_CONFIG.not_started.color }}>{u.name}</span>
//               <button onClick={() => handleFlagIssue(u.id)}
//                 style={{ padding: "1px 6px", borderRadius: 6, border: `1px solid ${THEME.redBorder}`, background: THEME.white, color: THEME.red, fontSize: 10, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
//                 Flag issue
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     )}

//     {/* Done */}
//     {grouped.done.length > 0 && (
//       <div style={{ marginBottom: 16 }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
//           <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#639922" }} />
//           <span style={{ fontSize: 12, fontWeight: 600, color: THEME.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>Done</span>
//           <span style={{ fontSize: 11, color: THEME.muted }}>{grouped.done.length} units</span>
//         </div>
//         <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
//           {grouped.done.map(u => (
//             <div key={u.id} style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${STATUS_CONFIG.done.border}`, background: STATUS_CONFIG.done.bg, color: STATUS_CONFIG.done.color, fontSize: 12, fontWeight: 500 }}>
//               {u.name}
//             </div>
//           ))}
//         </div>
//       </div>
//     )}
//   </div>
// )}

//         {/* Workers tab */}
//         {activeTab === "workers" && (
//   <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//     {activeWorkers.filter(r => r.worker_role === "worker" || r.worker_role === "team_lead").length === 0 && (
//       <div style={{ textAlign: "center", padding: 40, color: THEME.muted, background: THEME.white, borderRadius: 12, border: `1px solid ${THEME.border}` }}>
//         No workers currently on site.
//       </div>
//     )}
//     {activeWorkers.filter(r => r.worker_role === "worker" || r.worker_role === "team_lead").map(r => (
//       <div key={r.session_id} style={{ background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//           <div style={{ width: 36, height: 36, borderRadius: "50%", background: THEME.blueLight, color: THEME.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
//             {r.worker?.charAt(0).toUpperCase()}
//           </div>
//           <div>
//             <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//               <span style={{ fontSize: 14, fontWeight: 600, color: THEME.text }}>{r.worker}</span>
//               <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 8, background: THEME.blueLight, color: THEME.blue }}>{r.worker_role?.replace("_", " ")}</span>
//             </div>
//             <div style={{ fontSize: 12, color: THEME.muted, marginTop: 2 }}>
//               {r.units_worked?.length > 0
//                 ? `Working on: ${[...new Set(r.units_worked.map(u => u.name))].join(", ")}`
//                 : "No units assigned yet"}
//             </div>
//           </div>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//           <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
//           <span style={{ fontSize: 12, fontWeight: 600, color: THEME.green }}>On site</span>
//         </div>
//       </div>
//     ))}

//     {completedToday.length > 0 && (
//       <>
//         <div style={{ fontSize: 12, fontWeight: 600, color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 8, marginBottom: 4 }}>Completed today</div>
//         {completedToday.map(r => (
//           <div key={r.session_id} style={{ background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//               <div style={{ width: 36, height: 36, borderRadius: "50%", background: THEME.greenBg, color: THEME.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
//                 {r.worker?.charAt(0).toUpperCase()}
//               </div>
//               <div>
//                 <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//                   <span style={{ fontSize: 14, fontWeight: 600, color: THEME.text }}>{r.worker}</span>
//                   <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 8, background: THEME.greenBg, color: THEME.green }}>{r.worker_role?.replace("_", " ")}</span>
//                 </div>
//                 <div style={{ fontSize: 12, color: THEME.muted, marginTop: 2 }}>
//                   {[...new Set((r.units_worked || []).map(u => u.name))].join(", ") || "No units"}
//                 </div>
//               </div>
//             </div>
//             <span style={{ fontSize: 13, fontWeight: 700, color: THEME.blue }}>{r.total_hours}h</span>
//           </div>
//         ))}
//       </>
//     )}
//   </div>
// )}

//         {/* Reports tab */}
//         {activeTab === "reports" && (
//           <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//             {reportsLoading ? (
//               <div style={{ textAlign: "center", padding: 40, color: THEME.muted }}>Loading reports...</div>
//             ) : reports.length === 0 ? (
//               <div style={{ textAlign: "center", padding: 40, color: THEME.muted, background: THEME.white, borderRadius: 12, border: `1px solid ${THEME.border}` }}>
//                 No reports yet.
//               </div>
//             ) : (
//               reports.map(r => (
//                 <div key={r.session_id} style={{ background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                       <div style={{ width: 32, height: 32, borderRadius: "50%", background: THEME.blueLight, color: THEME.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
//                         {r.worker?.charAt(0).toUpperCase()}
//                       </div>
//                       <div>
//                         <div style={{ fontSize: 14, fontWeight: 600, color: THEME.text }}>{r.worker}</div>
//                           <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
//                             <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 8, background: THEME.blueLight, color: THEME.blue }}>{r.worker_role?.replace("_", " ")}</span>
//                             <span style={{ fontSize: 11, color: THEME.muted }}>{r.session_date}</span>
//                           </div>
//                       </div>
//                     </div>
//                     <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: r.total_hours ? THEME.greenBg : THEME.amberBg, color: r.total_hours ? THEME.green : THEME.amber, border: `1px solid ${r.total_hours ? THEME.greenBorder : THEME.amberBorder}` }}>
//                       {r.total_hours ? `${r.total_hours}h` : "Active"}
//                     </span>
//                   </div>
//                   {r.units_worked?.length > 0 && (
//                     <div style={{ marginBottom: 6 }}>
//                       <span style={{ fontSize: 11, color: THEME.muted }}>Units: </span>
//                       {[...new Map(r.units_worked.map(u => [u.id, u])).values()].map(u => (
//                         <span key={u.id} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: THEME.blueLight, color: THEME.blue, marginLeft: 4 }}>{u.name}</span>
//                       ))}
//                     </div>
//                   )}
//                   {r.tasks_completed?.length > 0 && (
//                     <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
//                       {[...new Map(r.tasks_completed.map(t => [t.task, t])).values()].map((t, i) => (
//                         <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: THEME.greenBg, color: THEME.green, border: `1px solid ${THEME.greenBorder}` }}>✓ {t.task}</span>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         )}
//       </div>

//       <div style={{ borderTop: `1px solid ${THEME.border}`, background: THEME.white, padding: "14px 24px", display: "flex", gap: 16, justifyContent: "center", marginTop: 40 }}>
//         {["About", "Help Center", "Privacy", "Terms", "© 2025 Builder"].map(item => (
//           <span key={item} style={{ fontSize: 12, color: THEME.muted }}>{item}</span>
//         ))}
//       </div>
//     </div>
//   );
// }



import SiteDashboard from "./SiteDashboard";
export default function WorkerDashboard() { return <SiteDashboard />; }