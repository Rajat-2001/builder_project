// import { useState, useEffect, useRef } from "react";
// import { useAuth } from "../context/AuthContext";
// import { getUnits, getUnit } from "../api/units";
// import { clockIn, clockOut, getSessionStatus, submitWorkReport } from "../api/sessions";
// import { getMySummary } from "../api/sessions";
// import { getMyBonus } from "../api/bonus";

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

// const ROLE_LABELS = {
//   admin: "Administrator", team_lead: "Team Leader", worker: "Worker",
//   architect: "Architect", customer: "Customer", supervisor: "Supervisor",
// };

// export default function WorkerDashboard() {
//   const { user, logout } = useAuth();

//   const [session, setSession] = useState(null);
//   const [timer, setTimer] = useState("00:00:00");
//   const timerRef = useRef(null);

//   const [projects, setProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [units, setUnits] = useState([]);
//   const [filter, setFilter] = useState("all");

//   const [selectedUnit, setSelectedUnit] = useState(null);
//   const [unitDetail, setUnitDetail] = useState(null);
//   const [tickedTasks, setTickedTasks] = useState({});

//   const [summary, setSummary] = useState([]);
//   const [bonus, setBonus] = useState(0);

//   const [loading, setLoading] = useState(false);
//   const [msg, setMsg] = useState(null);
//   const [workedUnitIds, setWorkedUnitIds] = useState([]);

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
//     getSessionStatus().then(s => {
//       if (s.clocked_in) { setSession(s); startTimer(new Date(s.clock_in)); }
//     }).catch(() => {});
//     getMySummary().then(setSummary).catch(() => {});
//     getMyBonus().then(b => setBonus(b.total_bonus_hours || 0)).catch(() => {});
//   }, []);

//   useEffect(() => {
//     if (!selectedProject) return;
//     getUnits(selectedProject.id).then(setUnits).catch(() => {});
//   }, [selectedProject]);

//   useEffect(() => {
//     if (!selectedUnit) return;
//     getUnit(selectedUnit.id).then(data => {
//       setUnitDetail(data);
//       setTickedTasks({});
//     }).catch(() => {});
//   }, [selectedUnit]);

//   const startTimer = (clockInTime) => {
//     if (timerRef.current) clearInterval(timerRef.current);
//     timerRef.current = setInterval(() => {
//       const diff = Math.floor((Date.now() - clockInTime.getTime()) / 1000);
//       const h = String(Math.floor(diff / 3600)).padStart(2, "0");
//       const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
//       const s = String(diff % 60).padStart(2, "0");
//       setTimer(`${h}:${m}:${s}`);
//     }, 1000);
//   };

//   const handleClockIn = async () => {
//     if (!selectedProject) return showMsg("Select a project first", "error");
//     setLoading(true);
//     try {
//       const s = await clockIn(selectedProject.id);
//       setSession(s);
//       startTimer(new Date(s.clock_in));
//       showMsg("Clocked in successfully");
//     } catch (e) { showMsg(e.message, "error"); }
//     setLoading(false);
//   };

//   const handleClockOut = async () => {
//     setLoading(true);
//     try {
//       const result = await clockOut(workedUnitIds);
//       clearInterval(timerRef.current);
//       setSession(null);
//       setTimer("00:00:00");
//       setWorkedUnitIds([]);
//       getMySummary().then(setSummary);
//       showMsg(`Clocked out — ${result.total_hours}h logged`);
//     } catch (e) { showMsg(e.message, "error"); }
//     setLoading(false);
//   };

//   const handleSubmitReport = async () => {
//     if (!unitDetail) return;
//     const taskCompletions = Object.entries(tickedTasks)
//       .filter(([, v]) => v)
//       .map(([id]) => ({ unit_task_id: id, note: "" }));
//     if (!workedUnitIds.includes(selectedUnit.id)) {
//       setWorkedUnitIds(prev => [...prev, selectedUnit.id]);
//     }
//     try {
//       await submitWorkReport([selectedUnit.id], taskCompletions);
//       showMsg("Work report submitted to team lead");
//     } catch (e) { showMsg(e.message, "error"); }
//   };

//   const filteredUnits = units.filter(u =>
//     filter === "all" ||
//     (filter === "housing"   && u.unit_type === "housing") ||
//     (filter === "ancillary" && u.unit_type === "ancillary") ||
//     (filter === "carport"   && u.unit_type === "carport") ||
//     (filter === "technical" && u.unit_type === "technical")
//   );

//   const grouped = {
//     issue:       filteredUnits.filter(u => u.status === "issue"),
//     in_progress: filteredUnits.filter(u => u.status === "in_progress"),
//     not_started: filteredUnits.filter(u => u.status === "not_started"),
//     done:        filteredUnits.filter(u => u.status === "done"),
//   };

//   const totalRealHours = summary.reduce((a, b) => a + (b.total_hours || 0), 0);
//   const projectHours = summary.find(s => s.project_id === selectedProject?.id)?.total_hours || 0;

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
//             <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 12, background: THEME.blueLight, color: THEME.blue }}>
//               {ROLE_LABELS[user?.role] || user?.role}
//             </span>
//             <button onClick={logout} style={{ padding: "6px 14px", border: `1px solid ${THEME.border}`, borderRadius: 20, background: "transparent", color: THEME.muted, fontSize: 12, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
//               Sign out
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Check in bar */}
//       <div style={{ background: THEME.white, borderBottom: `1px solid ${THEME.border}` }}>
//         <div style={{ maxWidth: 1128, margin: "0 auto", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
//           <select value={selectedProject?.id || ""}
//             onChange={e => {
//               const p = projects.find(p => p.id === e.target.value);
//               setSelectedProject(p);
//               setSelectedUnit(null);
//               setUnitDetail(null);
//             }}
//             disabled={!!session}
//             style={{ fontSize: 13, padding: "6px 10px", borderRadius: 8, border: `1px solid ${THEME.border}`, background: THEME.bg, color: THEME.text, fontFamily: "Inter, sans-serif" }}>
//             {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
//           </select>

//           {!session ? (
//             <button onClick={handleClockIn} disabled={loading}
//               style={{ padding: "7px 18px", borderRadius: 8, border: "none", background: THEME.blue, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
//               Check in
//             </button>
//           ) : (
//             <button onClick={handleClockOut} disabled={loading}
//               style={{ padding: "7px 18px", borderRadius: 8, border: `1px solid ${THEME.border}`, background: THEME.white, color: THEME.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
//               Check out
//             </button>
//           )}

//           {session && (
//             <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
//               <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
//               <span style={{ fontSize: 14, fontWeight: 700, color: THEME.blue }}>{timer}</span>
//               <span style={{ fontSize: 12, color: THEME.muted }}>on {selectedProject?.name}</span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Toast */}
//       {msg && (
//         <div style={{ position: "fixed", top: 70, right: 20, zIndex: 999, padding: "10px 18px", borderRadius: 8, background: msg.type === "error" ? THEME.redBg : THEME.greenBg, border: `1px solid ${msg.type === "error" ? THEME.redBorder : THEME.greenBorder}`, color: msg.type === "error" ? THEME.red : THEME.green, fontSize: 13, fontWeight: 500 }}>
//           {msg.text}
//         </div>
//       )}

//       {/* Step indicator */}
//       <div style={{ maxWidth: 1128, margin: "0 auto", padding: "16px 20px 0" }}>
//         <div style={{ display: "flex", background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
//           {[
//             { step: 1, label: "Select project", done: !!selectedProject,                                        active: !session && !!selectedProject },
//             { step: 2, label: "Check in",        done: !!session,                                               active: !!selectedProject && !session },
//             { step: 3, label: "Tick tasks",      done: Object.values(tickedTasks).some(Boolean),               active: !!session && !Object.values(tickedTasks).some(Boolean) },
//             { step: 4, label: "Submit report",   done: false,                                                   active: !!session && Object.values(tickedTasks).some(Boolean) },
//           ].map(({ step, label, done, active }, i, arr) => (
//             <div key={step} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 8px", background: done ? THEME.greenBg : active ? THEME.blueLight : THEME.white, borderRight: i < arr.length - 1 ? `1px solid ${THEME.border}` : "none" }}>
//               <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, background: done ? THEME.green : active ? THEME.blue : THEME.border, color: done || active ? "#fff" : THEME.muted }}>
//                 {done ? "✓" : step}
//               </div>
//               <span style={{ fontSize: 12, fontWeight: active || done ? 600 : 400, color: done ? THEME.green : active ? THEME.blue : THEME.muted, whiteSpace: "nowrap" }}>
//                 {label}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div style={{ maxWidth: 1128, margin: "0 auto", padding: "0 20px 20px" }}>

//         {/* Stats */}
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
//           {[
//             { label: "Total hours worked",                                           value: `${totalRealHours.toFixed(1)}h` },
//             { label: `Hours on ${selectedProject?.name || "project"}`,              value: `${projectHours.toFixed(1)}h` },
//             { label: "Bonus hours",                                                  value: `${bonus.toFixed(1)}h` },
//             { label: "Units in progress",                                            value: grouped.in_progress.length },
//           ].map(({ label, value }) => (
//             <div key={label} style={{ background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 10, padding: "12px 16px" }}>
//               <div style={{ fontSize: 11, color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
//               <div style={{ fontSize: 22, fontWeight: 700, color: THEME.blue }}>{value}</div>
//             </div>
//           ))}
//         </div>

//         {/* Filter tabs */}
//         <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
//           {["all", "housing", "ancillary", "carport", "technical"].map(f => (
//             <button key={f} onClick={() => setFilter(f)}
//               style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${filter === f ? THEME.blue : THEME.border}`, background: filter === f ? THEME.blue : THEME.white, color: filter === f ? "#fff" : THEME.muted, fontSize: 12, cursor: "pointer", fontFamily: "Inter, sans-serif", fontWeight: filter === f ? 600 : 400 }}>
//               {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
//             </button>
//           ))}
//         </div>

//         <div style={{ display: "grid", gridTemplateColumns: unitDetail ? "1fr 340px" : "1fr", gap: 16 }}>
//           <div>
//             {/* Issues first */}
//             {grouped.issue.length > 0 && (
//               <div style={{ background: THEME.redBg, border: `1px solid ${THEME.redBorder}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
//                   <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E24B4A" }} />
//                   <span style={{ fontSize: 12, fontWeight: 700, color: THEME.red, textTransform: "uppercase", letterSpacing: "0.05em" }}>Issues — needs attention</span>
//                   <span style={{ fontSize: 11, color: THEME.red }}>{grouped.issue.length} unit{grouped.issue.length !== 1 ? "s" : ""}</span>
//                 </div>
//                 <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
//                   {grouped.issue.map(u => (
//                     <button key={u.id} onClick={() => setSelectedUnit(u)}
//                       style={{ padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${selectedUnit?.id === u.id ? THEME.blue : THEME.redBorder}`, background: selectedUnit?.id === u.id ? THEME.blueLight : THEME.white, color: selectedUnit?.id === u.id ? THEME.blue : THEME.red, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
//                       {u.name}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* In progress */}
//             {grouped.in_progress.length > 0 && (
//               <div style={{ marginBottom: 16 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
//                   <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#BA7517" }} />
//                   <span style={{ fontSize: 12, fontWeight: 600, color: THEME.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>In progress</span>
//                   <span style={{ fontSize: 11, color: THEME.muted }}>{grouped.in_progress.length} units</span>
//                 </div>
//                 <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
//                   {grouped.in_progress.map(u => (
//                     <button key={u.id} onClick={() => setSelectedUnit(u)}
//                       style={{ padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${selectedUnit?.id === u.id ? THEME.blue : STATUS_CONFIG.in_progress.border}`, background: selectedUnit?.id === u.id ? THEME.blueLight : STATUS_CONFIG.in_progress.bg, color: selectedUnit?.id === u.id ? THEME.blue : STATUS_CONFIG.in_progress.color, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
//                       {u.name}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Not started */}
//             {grouped.not_started.length > 0 && (
//               <div style={{ marginBottom: 16 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
//                   <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#B4B2A9" }} />
//                   <span style={{ fontSize: 12, fontWeight: 600, color: THEME.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>Not started</span>
//                   <span style={{ fontSize: 11, color: THEME.muted }}>{grouped.not_started.length} units</span>
//                 </div>
//                 <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
//                   {grouped.not_started.map(u => (
//                     <button key={u.id} onClick={() => setSelectedUnit(u)}
//                       style={{ padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${selectedUnit?.id === u.id ? THEME.blue : STATUS_CONFIG.not_started.border}`, background: selectedUnit?.id === u.id ? THEME.blueLight : STATUS_CONFIG.not_started.bg, color: selectedUnit?.id === u.id ? THEME.blue : STATUS_CONFIG.not_started.color, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
//                       {u.name}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Done */}
//             {grouped.done.length > 0 && (
//               <div style={{ marginBottom: 16 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
//                   <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#639922" }} />
//                   <span style={{ fontSize: 12, fontWeight: 600, color: THEME.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>Done</span>
//                   <span style={{ fontSize: 11, color: THEME.muted }}>{grouped.done.length} units</span>
//                 </div>
//                 <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
//                   {grouped.done.map(u => (
//                     <button key={u.id} onClick={() => setSelectedUnit(u)}
//                       style={{ padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${selectedUnit?.id === u.id ? THEME.blue : STATUS_CONFIG.done.border}`, background: selectedUnit?.id === u.id ? THEME.blueLight : STATUS_CONFIG.done.bg, color: selectedUnit?.id === u.id ? THEME.blue : STATUS_CONFIG.done.color, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
//                       {u.name}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {units.length === 0 && (
//               <div style={{ textAlign: "center", padding: "40px 0", color: THEME.muted, fontSize: 14 }}>
//                 No units found for this project.
//               </div>
//             )}
//           </div>

//           {/* Unit detail panel */}
//           {unitDetail && (
//             <div style={{ background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16, alignSelf: "start" }}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
//                 <div style={{ fontSize: 15, fontWeight: 600, color: THEME.text }}>{selectedUnit?.name}</div>
//                 <button onClick={() => { setSelectedUnit(null); setUnitDetail(null); }}
//                   style={{ fontSize: 12, color: THEME.muted, background: "none", border: "none", cursor: "pointer" }}>✕</button>
//               </div>

//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${THEME.border}` }}>
//                 <span style={{ fontSize: 12, color: THEME.muted }}>Status</span>
//                 <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: STATUS_CONFIG[selectedUnit?.status]?.bg, color: STATUS_CONFIG[selectedUnit?.status]?.color, border: `1px solid ${STATUS_CONFIG[selectedUnit?.status]?.border}` }}>
//                   {STATUS_CONFIG[selectedUnit?.status]?.label}
//                 </span>
//               </div>

//               <div style={{ padding: "10px 0", borderBottom: `1px solid ${THEME.border}` }}>
//                 <div style={{ fontSize: 12, color: THEME.muted, marginBottom: 8 }}>Tasks</div>
//                 <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
//                   {unitDetail.tasks?.map(task => (
//                     <label key={task.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: session ? "pointer" : "default", padding: "4px 0" }}>
//                       <input type="checkbox"
//                         checked={!!tickedTasks[task.id]}
//                         disabled={!session}
//                         onChange={e => setTickedTasks(prev => ({ ...prev, [task.id]: e.target.checked }))}
//                         style={{ width: 14, height: 14, accentColor: THEME.blue }}
//                       />
//                       <span style={{ fontSize: 12, color: THEME.text }}>{task.name}</span>
//                       <span style={{ fontSize: 10, color: THEME.muted, marginLeft: "auto", background: THEME.bg, padding: "1px 6px", borderRadius: 6 }}>{task.category}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {session && (
//                 <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
//                   <button onClick={handleSubmitReport}
//                     style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "none", background: THEME.blue, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
//                     Submit to team lead
//                   </button>
//                   <button onClick={async () => {
//                     try {
//                       await submitWorkReport([selectedUnit.id], []);
//                       showMsg("Problem reported to team lead");
//                     } catch (e) { showMsg(e.message, "error"); }
//                   }}
//                     style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: `1px solid ${THEME.redBorder}`, background: THEME.redBg, color: THEME.red, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
//                     Report a problem on this unit
//                   </button>
//                 </div>
//               )}
//               {!session && (
//                 <p style={{ fontSize: 11, color: THEME.muted, textAlign: "center", marginTop: 10 }}>Clock in to tick tasks and submit reports</p>
//               )}
//             </div>
//           )}
//         </div>
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