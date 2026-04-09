import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  clockIn, clockOut,
  getAttendanceStatus,
  getAttendanceHistory,
  getAttendanceSummary,
} from "../api/attendance";

export default function WorkerDashboard() {
  const { user, logout } = useAuth();

  const [isClockedIn,  setIsClockedIn]  = useState(false);
  const [clockInTime,  setClockInTime]  = useState(null);
  const [elapsed,      setElapsed]      = useState("00:00:00");
  const [history,      setHistory]      = useState([]);
  const [summary,      setSummary]      = useState(null);
  const [statusLoading,setStatusLoading]= useState(true);
  const [actionLoading,setActionLoading]= useState(false);
  const [msg,          setMsg]          = useState({ text:"", type:"" });

  const timerRef = useRef(null);

  // ── Load status + history + summary on mount ──
  useEffect(() => {
    loadAll();
    return () => clearInterval(timerRef.current);
  }, []);

  const loadAll = async () => {
    setStatusLoading(true);
    try {
      const [statusData, historyData, summaryData] = await Promise.all([
        getAttendanceStatus(),
        getAttendanceHistory(),
        getAttendanceSummary(),
      ]);

      setHistory(historyData);
      setSummary(summaryData);

      if (statusData.is_clocked_in) {
        setIsClockedIn(true);
        setClockInTime(new Date(statusData.clock_in));
        startTimer(new Date(statusData.clock_in));
      }
    } catch (err) {
      setMsg({ text: err.message, type: "error" });
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Live timer ──
  const startTimer = (from) => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const diff = Math.floor((Date.now() - from.getTime()) / 1000);
      const h    = String(Math.floor(diff / 3600)).padStart(2, "0");
      const m    = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const s    = String(diff % 60).padStart(2, "0");
      setElapsed(`${h}:${m}:${s}`);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    setElapsed("00:00:00");
  };

  // ── Clock In ──
  const handleClockIn = async () => {
    setActionLoading(true);
    setMsg({ text:"", type:"" });
    try {
      const data = await clockIn();
      const now  = new Date(data.clock_in);
      setIsClockedIn(true);
      setClockInTime(now);
      startTimer(now);
      setMsg({ text:"✓ Clocked in successfully.", type:"success" });
      loadAll();
    } catch (err) {
      setMsg({ text: err.message, type:"error" });
    } finally {
      setActionLoading(false);
    }
  };

  // ── Clock Out ──
  const handleClockOut = async () => {
    setActionLoading(true);
    setMsg({ text:"", type:"" });
    try {
      const data = await clockOut();
      setIsClockedIn(false);
      setClockInTime(null);
      stopTimer();
      setMsg({ text: `✓ Clocked out. You worked ${data.total_hours} hours today.`, type:"success" });
      loadAll();
    } catch (err) {
      setMsg({ text: err.message, type:"error" });
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
  };

  return (
    <div style={s.root}>
      <style>{css}</style>

      {/* Navbar */}
      <div style={s.navbar}>
        <div style={s.navInner}>
          <div style={s.navLogo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 21V8L12 3L21 8V21" stroke="#0A66C2" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M9 21V14H15V21" stroke="#0A66C2" strokeWidth="2.5" strokeLinejoin="round"/>
            </svg>
            <span style={s.navBrand}>Builder</span>
          </div>
          <div style={s.navRight}>
            <span style={s.navName}>{user?.full_name}</span>
            <span style={s.workerBadge}>Worker</span>
            <button onClick={logout} style={s.logoutBtn} className="logout-hover">Sign out</button>
          </div>
        </div>
      </div>

      <div style={s.main}>

        {/* Clock in/out card */}
        <div style={s.clockCard}>
          <div style={s.clockLeft}>
            <p style={s.clockLabel}>
              {statusLoading ? "Loading..." : isClockedIn ? "Currently on shift" : "Not clocked in"}
            </p>

            {/* Big timer */}
            <div style={s.timerDisplay}>{isClockedIn ? elapsed : "00:00:00"}</div>

            {isClockedIn && clockInTime && (
              <p style={s.clockSubtext}>
                Clocked in at {formatTime(clockInTime.toISOString())} · {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })}
              </p>
            )}

            {/* Message */}
            {msg.text && (
              <div style={{...s.msgBox, ...(msg.type === "success" ? s.msgSuccess : s.msgError)}}>
                {msg.text}
              </div>
            )}

            {/* Clock in/out button */}
            {!statusLoading && (
              <button
                onClick={isClockedIn ? handleClockOut : handleClockIn}
                disabled={actionLoading}
                style={{
                  ...s.clockBtn,
                  ...(isClockedIn ? s.clockBtnOut : s.clockBtnIn),
                  ...(actionLoading ? s.clockBtnDisabled : {}),
                }}
                className="clock-btn-hover"
              >
                {actionLoading
                  ? "Please wait..."
                  : isClockedIn
                  ? "⏹ Clock Out"
                  : "▶ Clock In"}
              </button>
            )}
          </div>

          {/* Status indicator */}
          <div style={s.clockRight}>
            <div style={{
              ...s.statusCircle,
              backgroundColor: isClockedIn ? "#F0FAF5" : "#F3F2EF",
              border: `2px solid ${isClockedIn ? "#057642" : "#C9C5C0"}`,
            }}>
              <div style={{
                ...s.statusDot,
                backgroundColor: isClockedIn ? "#057642" : "#C9C5C0",
                animation: isClockedIn ? "pulse-dot 2s infinite" : "none",
              }}/>
              <span style={{
                fontSize:"13px",
                fontWeight:"600",
                color: isClockedIn ? "#057642" : "#999",
                marginTop:"8px",
              }}>
                {isClockedIn ? "ON SITE" : "OFF SITE"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        {summary && (
          <div style={s.statsRow}>
            {[
              ["⏱", "Hours this week",  `${summary.total_hours_this_week}h`],
              ["📅", "Hours this month", `${summary.total_hours_this_month}h`],
              ["✅", "Days present",     `${summary.days_present_this_month} days`],
            ].map(([icon, label, value]) => (
              <div key={label} style={s.statCard}>
                <span style={s.statIcon}>{icon}</span>
                <div>
                  <div style={s.statValue}>{value}</div>
                  <div style={s.statLabel}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Attendance history */}
        <div style={s.historyCard}>
          <h2 style={s.historyTitle}>Attendance History</h2>
          {history.length === 0 ? (
            <div style={s.emptyState}>No attendance records yet. Clock in to start tracking.</div>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>Date</th>
                    <th style={s.th}>Clock In</th>
                    <th style={s.th}>Clock Out</th>
                    <th style={s.th}>Hours</th>
                    <th style={s.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((r, i) => (
                    <tr key={r.id} style={{...s.tr, ...(i % 2 === 0 ? {} : s.trAlt)}}>
                      <td style={{...s.td, fontWeight:"600"}}>{formatDate(r.shift_date)}</td>
                      <td style={s.td}>{formatTime(r.clock_in)}</td>
                      <td style={s.td}>{r.clock_out ? formatTime(r.clock_out) : "—"}</td>
                      <td style={s.td}>
                        {r.total_hours ? (
                          <span style={{fontWeight:"600", color:"#0A66C2"}}>{r.total_hours}h</span>
                        ) : "—"}
                      </td>
                      <td style={s.td}>
                        <span style={{
                          fontSize:"12px", fontWeight:"600", padding:"3px 10px",
                          borderRadius:"12px",
                          backgroundColor: r.is_active ? "#F0FAF5" : "#F3F2EF",
                          border: `1px solid ${r.is_active ? "#B8DFC9" : "#D0CFC9"}`,
                          color: r.is_active ? "#057642" : "#666",
                        }}>
                          {r.is_active ? "Active" : "Completed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <div style={s.footer}>
        {["About", "Help Center", "Privacy", "Terms", "© 2025 Builder"].map(item => (
          <span key={item} style={s.footerItem}>{item}</span>
        ))}
      </div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.2)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .logout-hover:hover { background: #F3F2EF !important; color: #CC1016 !important; }
  .clock-btn-hover:hover:not(:disabled) { opacity: 0.88 !important; transform: translateY(-1px); }
  * { box-sizing: border-box; }
  table { border-collapse: collapse; }
`;

const s = {
  root:       { minHeight:"100vh", backgroundColor:"#F3F2EF", fontFamily:"'Inter', sans-serif", display:"flex", flexDirection:"column" },
  navbar:     { backgroundColor:"#FFFFFF", borderBottom:"1px solid #E0DFDC", position:"sticky", top:0, zIndex:100 },
  navInner:   { maxWidth:"1000px", margin:"0 auto", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  navLogo:    { display:"flex", alignItems:"center", gap:"8px" },
  navBrand:   { fontSize:"20px", fontWeight:"700", color:"#0A66C2", letterSpacing:"-0.3px" },
  navRight:   { display:"flex", alignItems:"center", gap:"12px" },
  navName:    { fontSize:"14px", fontWeight:"600", color:"#333" },
  workerBadge:{ fontSize:"12px", fontWeight:"600", padding:"4px 10px", borderRadius:"12px", backgroundColor:"#FDF3E7", border:"1px solid #F0C98A", color:"#7A3E00" },
  logoutBtn:  { padding:"8px 18px", backgroundColor:"transparent", color:"#666", border:"1px solid #C9C5C0", borderRadius:"24px", fontSize:"14px", fontWeight:"600", cursor:"pointer", fontFamily:"'Inter', sans-serif", transition:"all 0.15s" },
  main:       { flex:1, maxWidth:"1000px", margin:"0 auto", padding:"32px 24px", width:"100%", display:"flex", flexDirection:"column", gap:"20px" },
  clockCard:  { backgroundColor:"#FFFFFF", borderRadius:"12px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)", padding:"36px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"32px", animation:"fadeIn 0.35s ease forwards" },
  clockLeft:  { flex:1 },
  clockLabel: { fontSize:"13px", fontWeight:"600", color:"#666", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"8px" },
  timerDisplay:{ fontSize:"52px", fontWeight:"700", color:"#000000E6", letterSpacing:"-1px", fontVariantNumeric:"tabular-nums", marginBottom:"8px", fontFamily:"'Inter', monospace" },
  clockSubtext:{ fontSize:"13px", color:"#666", marginBottom:"20px" },
  msgBox:     { padding:"10px 14px", borderRadius:"6px", fontSize:"13px", marginBottom:"16px" },
  msgSuccess: { backgroundColor:"#F0FAF5", border:"1px solid #B8DFC9", color:"#057642" },
  msgError:   { backgroundColor:"#FFF0F0", border:"1px solid #FFCCCC", color:"#CC1016" },
  clockBtn:   { padding:"14px 36px", borderRadius:"24px", fontSize:"16px", fontWeight:"700", cursor:"pointer", border:"none", fontFamily:"'Inter', sans-serif", transition:"all 0.15s", letterSpacing:"0.3px" },
  clockBtnIn: { backgroundColor:"#0A66C2", color:"#FFFFFF" },
  clockBtnOut:{ backgroundColor:"#CC1016", color:"#FFFFFF" },
  clockBtnDisabled:{ opacity:0.6, cursor:"not-allowed" },
  clockRight: { display:"flex", alignItems:"center", justifyContent:"center" },
  statusCircle:{ width:"120px", height:"120px", borderRadius:"50%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"4px", transition:"all 0.3s" },
  statusDot:  { width:"16px", height:"16px", borderRadius:"50%", transition:"all 0.3s" },
  statsRow:   { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px" },
  statCard:   { backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)", padding:"20px", display:"flex", alignItems:"center", gap:"16px" },
  statIcon:   { fontSize:"24px" },
  statValue:  { fontSize:"22px", fontWeight:"700", color:"#000000E6", letterSpacing:"-0.3px" },
  statLabel:  { fontSize:"12px", color:"#666", marginTop:"2px" },
  historyCard:{ backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)", overflow:"hidden" },
  historyTitle:{ fontSize:"16px", fontWeight:"700", color:"#000000E6", padding:"20px 20px 16px" },
  emptyState: { padding:"40px", textAlign:"center", color:"#999", fontSize:"14px" },
  tableWrap:  { overflowX:"auto" },
  table:      { width:"100%", fontSize:"14px" },
  thead:      { backgroundColor:"#F8F7F4" },
  th:         { padding:"10px 16px", textAlign:"left", fontSize:"12px", fontWeight:"600", color:"#666", textTransform:"uppercase", letterSpacing:"0.5px" },
  tr:         { borderBottom:"1px solid #F3F2EF" },
  trAlt:      { backgroundColor:"#FAFAF8" },
  td:         { padding:"12px 16px", color:"#333" },
  footer:     { borderTop:"1px solid #E0DFDC", backgroundColor:"#FFFFFF", padding:"16px 24px", display:"flex", flexWrap:"wrap", gap:"16px", justifyContent:"center", marginTop:"auto" },
  footerItem: { fontSize:"12px", color:"#666", cursor:"pointer" },
};