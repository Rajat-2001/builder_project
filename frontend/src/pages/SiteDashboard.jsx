import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUnits, getUnit, updateUnitStatus } from "../api/units";
import { clockIn, clockOut, getSessionStatus, getMySummary } from "../api/sessions";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const BASE = "http://localhost:8000";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

const C = {
  blue: "#0A66C2", blueDk: "#004182", blueLt: "#EAF0F9",
  white: "#FFFFFF", bg: "#F3F2EF", border: "#E0DFDC", text: "#313335",
};

// Solid fills for unit blocks
const UC = { done:"#057642", in_progress:"#0A66C2", issue:"#C8191C", not_started:"#8A8986" };

// Soft tints for badges
const SBG = { done:"#F0FAF5", in_progress:"#EAF0F9", issue:"#FDF0F0", not_started:"#F3F2EF" };
const SBD = { done:"#B8DFC9", in_progress:"#B3D0F0", issue:"#F5C6C6", not_started:"#D1CFCB" };
const STC = { done:"#057642", in_progress:"#0A66C2", issue:"#B91C1C", not_started:"#5F5E5A" };
const SL  = { done:"Done", in_progress:"In progress", issue:"Issue", not_started:"Not started" };

const CLOCK_ROLES = ["worker", "team_lead", "supervisor"];

const GEWERK_LIST = [
  "Betonarbeiten","Maurerarbeiten","Gerüstbau","Hausanschlussarbeiten",
  "Heizung","Sanitär","Elektro","Solar","Lüftung","Putzarbeiten",
  "Estricharbeiten","Fliesenarbeiten","Zimmererarbeiten","Fensterbau",
  "Tischlerarbeiten","Trockenbau","Malerarbeiten","Smart Home / KNX",
  "Außenanlagen","Blitzschutz","Zaunbau","Bauendreinigung","Abnahme-/Dokumentation",
];

// ─── UNIT HELPERS ─────────────────────────────────────────────────────────────

// Map unit_type from DB → display category
// DB values confirmed: "housing", "ancillary", "carport", "technical"
function getUnitCategory(unit) {
  const t = (unit.unit_type || "").toLowerCase();
  if (t === "housing")   return "we";       // Wohneinheiten
  if (t === "ancillary") return "hz";       // Heizzentrale
  if (t === "carport")   return "carport";  // Carports
  if (t === "technical") return "technical";
  // Fallback: parse name
  const name = (unit.name || "").toUpperCase();
  if (name.startsWith("WE")) return "we";
  if (name.startsWith("HZ")) return "hz";
  if (name.startsWith("C"))  return "carport";
  return "other";
}

// Extract wing from unit name number (1-7 = Wing 1, 8-14 = Wing 2)
function getUnitWing(unit) {
  const name = (unit.name || "").trim();
  const match = name.match(/(\d+)/);
  const num = match ? parseInt(match[1]) : 0;
  // CE1 → Wing 1, CE2 → Wing 2
  if (name.toUpperCase().startsWith("CE")) return num <= 1 ? 1 : 2;
  return num <= 7 ? 1 : 2;
}

function sortByName(arr) {
  return [...arr].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true })
  );
}

function pctComplete(units) {
  if (!units.length) return 0;
  return Math.round(units.filter(u => u.status === "done").length / units.length * 100);
}

function fmtTime(d) {
  if (!d) return "--:--";
  return new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  return (
    <span style={{ borderRadius:12, fontSize:12, fontWeight:600, padding:"3px 10px", background:SBG[status], border:`1px solid ${SBD[status]}`, color:STC[status] }}>
      {SL[status]}
    </span>
  );
}

function StatusDot({ status, size=9 }) {
  return <span style={{ display:"inline-block", width:size, height:size, borderRadius:"50%", background:UC[status], flexShrink:0 }} />;
}

function Navbar({ center, right }) {
  return (
    <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", padding:"11px 20px", gap:10, position:"sticky", top:0, zIndex:60 }}>
      <div style={{ flex:1 }}>
        <span style={{ fontSize:20, fontWeight:800, color:C.blue, letterSpacing:-.5 }}>BORG-1</span>
      </div>
      <div style={{ flex:2, display:"flex", justifyContent:"center" }}>{center}</div>
      <div style={{ flex:1, display:"flex", justifyContent:"flex-end", gap:8 }}>{right}</div>
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} style={{ background:"transparent", color:C.text, border:`1px solid ${C.border}`, borderRadius:20, fontWeight:500, fontSize:13, cursor:"pointer", padding:"8px 18px", fontFamily:"inherit" }}>
      ← Back
    </button>
  );
}

function UnitBlock({ unit, height, fontSize, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseOver={() => setHov(true)}
      onMouseOut={() => setHov(false)}
      style={{
        flex:1, height, background:UC[unit.status], borderRadius:8,
        display:"flex", alignItems:"center", justifyContent:"center",
        position:"relative", cursor:"pointer",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? "0 8px 22px rgba(0,0,0,.26)" : "none",
        transition:"transform .13s, box-shadow .13s",
      }}
    >
      <span style={{ fontSize, fontWeight:700, color:"#fff", textAlign:"center", padding:"0 2px" }}>{unit.name}</span>
      <div style={{ position:"absolute", top:4, right:4, width:7, height:7, borderRadius:"50%", background:"rgba(255,255,255,.4)" }} />
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SiteDashboard() {
  const { user } = useAuth();
  const role = user?.role || "worker";
  const canClock = CLOCK_ROLES.includes(role);

  // View routing
  const [view, setView]             = useState("dash"); // "dash" | "unit" | "table"
  const [tableFrom, setTableFrom]   = useState("dash"); // where Back goes from table

  const [selectedUnit, setSelectedUnit]   = useState(null);
  const [unitDetail, setUnitDetail]       = useState(null);
  const [selectedGewerk, setSelectedGewerk] = useState(null);

  // Projects
  const [projects, setProjects]             = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Units
  const [units, setUnits]           = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Summary (hours per project for profile card)
  const [summary, setSummary]       = useState([]);

  // UI toggles
  const [wing, setWing]   = useState(1);
  const [z1Open, setZ1]   = useState(false);
  const [z2Open, setZ2]   = useState(false);
  const [gOpen, setGOpen] = useState(false);
  const [pOpen, setPOpen] = useState(false);

  // Session / clock in
  const [checkedIn, setCheckedIn]       = useState(false);
  const [checkInTime, setCheckInTime]   = useState(null);
  const [sessionLoading, setSessLoad]   = useState(false);
  const [sessionError, setSessErr]      = useState("");

  // ── Fetch projects (works for ALL roles via /projects/all)
  useEffect(() => {
    fetch(`${BASE}/projects/all`, { headers: authHeaders() })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => {
        console.log("Projects raw:", data);
        const seen = new Set();
        const list = (Array.isArray(data) ? data : []).filter(p => {
          if (seen.has(p.id)) return false;
          seen.add(p.id); return true;
        });
        const sorted = [...list].sort((a, b) => a.name.localeCompare(b.name));
        setProjects(sorted);
        if (sorted.length > 0) setSelectedProject(sorted[0]);
      })
      .catch(e => console.error("Projects:", e))
      .finally(() => setLoadingProjects(false));
  }, []);

  // ── Restore session state on refresh
  // NOTE: old WorkerDashboard uses data.clocked_in (not data.is_active)
  useEffect(() => {
    if (!canClock) return;
    getSessionStatus()
      .then(data => {
        if (data?.clocked_in) {
          setCheckedIn(true);
          setCheckInTime(data.clock_in);
        }
      })
      .catch(() => {});
  }, []);

  // ── Fetch hours summary for profile card
  useEffect(() => {
    getMySummary()
      .then(data => setSummary(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // ── Fetch units when project changes
  useEffect(() => {
    if (!selectedProject) return;
    setLoadingUnits(true);
    getUnits(selectedProject.id)
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        console.log(`Units loaded: ${list.length}`, list.map(u => `${u.name}(${u.unit_type})`));
        setUnits(list);
      })
      .catch(e => console.error("Units:", e))
      .finally(() => setLoadingUnits(false));
  }, [selectedProject]);

  // ── Derived unit lists for current wing
  const wingUnits = units.filter(u => getUnitWing(u) === wing);
  const weUnits   = sortByName(wingUnits.filter(u => getUnitCategory(u) === "we"));
  const hzUnits   = sortByName(wingUnits.filter(u => getUnitCategory(u) === "hz"));
  const cpUnits   = sortByName(wingUnits.filter(u => getUnitCategory(u) === "carport"));
  const techUnits = sortByName(wingUnits.filter(u => getUnitCategory(u) === "technical"));
  const completion = pctComplete(wingUnits);

  // ── Hours summary helpers
  const totalHours = summary.reduce((a, r) => a + (r.total_hours || 0), 0);

  // ── Clock in/out handlers
  async function handleClockIn() {
    if (!selectedProject) return;
    setSessLoad(true); setSessErr("");
    try {
      const s = await clockIn(selectedProject.id);
      setCheckedIn(true);
      setCheckInTime(s.clock_in || new Date().toISOString());
    } catch (e) { setSessErr(e.message); }
    finally { setSessLoad(false); }
  }

  async function handleClockOut() {
    setSessLoad(true); setSessErr("");
    try {
      await clockOut([]);
      setCheckedIn(false);
      setCheckInTime(null);
      getMySummary().then(d => setSummary(Array.isArray(d) ? d : [])).catch(() => {});
    } catch (e) { setSessErr(e.message); }
    finally { setSessLoad(false); }
  }

  // ── Unit click → fetch full detail → unit view
 async function handleUnitClick(unit) {
  setSelectedUnit(unit);
  setUnitDetail(null);
  setView("unit");
  try {
    const res = await getUnit(unit.id);
    // API returns { unit: {...}, tasks: [...] }
    const detail = res.unit ? { ...res.unit, tasks: res.tasks } : res;
    setUnitDetail(detail);
  }
  catch { setUnitDetail(unit); }
}

  // ── Gewerk from toolbar → table, back goes to dash
  function openGewerkFromDash(g) {
    setSelectedGewerk(g); setGOpen(false);
    setTableFrom("dash"); setView("table");
  }

  // ── Gewerk from unit detail → table, back goes to unit
  function openGewerkFromUnit(g) {
    setSelectedGewerk(g);
    setTableFrom("unit"); setView("table");
  }

  function switchWing(w) { setWing(w); setZ1(false); setZ2(false); }

  // ── VIEW ROUTING ─────────────────────────────────────────────────────────────
  if (view === "table") {
    return (
      <WorkTableView
        gewerk={selectedGewerk}
        unit={selectedUnit}
        onBack={() => setView(tableFrom)}
      />
    );
  }

  if (view === "unit") {
    return (
      <UnitDetailView
        unit={unitDetail || selectedUnit}
        role={role}
        projectName={selectedProject?.name}
        onBack={() => { setView("dash"); setUnitDetail(null); }}
        onGewerkClick={openGewerkFromUnit}
        onStatusChange={async (unitId, newStatus) => {
            try {
            await updateUnitStatus(unitId, newStatus);
            setUnits(prev => prev.map(u => u.id === unitId ? {...u, status: newStatus} : u));
            setUnitDetail(prev => prev ? {...prev, status: newStatus} : prev);
            setSelectedUnit(prev => prev ? {...prev, status: newStatus} : prev);
            } catch (err) {
            console.error("Status update failed:", err);
            }
        }}
        />
    );
  }

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Source Sans 3', system-ui, sans-serif" }}>

      {/* ── NAVBAR */}
      <Navbar
        center={
          <div style={{ position:"relative", display:"inline-block" }}>
            <select
              value={selectedProject?.id || ""}
              onChange={e => {
                const p = projects.find(p => p.id === e.target.value);
                setSelectedProject(p || null);
              }}
              style={{ appearance:"none", border:`2px solid ${C.blue}`, borderRadius:22, padding:"7px 38px 7px 20px", fontSize:14, fontWeight:700, color:C.blue, background:C.white, cursor:"pointer", fontFamily:"inherit", outline:"none" }}
            >
              {loadingProjects
                ? <option>Loading...</option>
                : projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
              }
            </select>
            <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", color:C.blue, pointerEvents:"none", fontSize:12, fontWeight:700 }}>▾</span>
          </div>
        }
        right={
          <div style={{ position:"relative" }}>
            <button
              onClick={() => { setPOpen(o => !o); setGOpen(false); }}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 13px", background:pOpen?C.blueLt:C.white, border:`1px solid ${C.border}`, borderRadius:22, cursor:"pointer", fontFamily:"inherit" }}
            >
              <div style={{ width:30, height:30, borderRadius:"50%", background:C.blue, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700 }}>
                {user?.name ? user.name.slice(0,2).toUpperCase() : "👤"}
              </div>
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:13, fontWeight:600, color:C.text, lineHeight:1.2 }}>{user?.name || `+${user?.phone}` || "User"}</div>
                <div style={{ fontSize:10, color:"#888", lineHeight:1.2, textTransform:"capitalize" }}>{role?.replace("_"," ")}</div>
              </div>
              <span style={{ fontSize:11, color:"#bbb" }}>{pOpen?"▲":"▼"}</span>
            </button>

            {/* Profile card */}
            {pOpen && (
              <div style={{ position:"absolute", top:54, right:0, width:290, background:C.white, border:`1px solid ${C.border}`, borderRadius:12, boxShadow:"0 8px 28px rgba(0,0,0,.14)", zIndex:100, overflow:"hidden" }}>
                <div style={{ height:52, background:C.blue }} />
                <div style={{ padding:"0 18px 20px" }}>
                  <div style={{ width:56, height:56, borderRadius:"50%", background:C.blueLt, border:`3px solid ${C.white}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:C.blue, marginTop:-28, marginBottom:10 }}>
                    {user?.name ? user.name.slice(0,2).toUpperCase() : "👤"}
                  </div>
                  <div style={{ fontWeight:700, fontSize:16, color:C.text, marginBottom:2 }}>{user?.name || user?.phone || "—"}</div>
                  <div style={{ fontSize:12, color:"#666", marginBottom:2, textTransform:"capitalize" }}>{role?.replace("_"," ")}</div>
                  {user?.email && <div style={{ fontSize:12, color:C.blue, marginBottom:2 }}>{user.email}</div>}
                  {user?.phone && <div style={{ fontSize:12, color:"#666", marginBottom:14 }}>{user.phone}</div>}

                  {/* Hours per project */}
                  <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:13 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:.5, marginBottom:9 }}>HOURS WORKED</div>
                    {summary.length === 0 ? (
                      <div style={{ fontSize:13, color:"#aaa", fontStyle:"italic" }}>No hours logged yet.</div>
                    ) : (
                      summary.map(r => (
                        <div key={r.project_id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:`1px solid #F5F5F3` }}>
                          <span style={{ fontSize:13, color:"#555" }}>{r.project_name || projects.find(p=>p.id===r.project_id)?.name || "Project"}</span>
                          <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{(r.total_hours||0).toFixed(1)}h</span>
                        </div>
                      ))
                    )}
                    <div style={{ display:"flex", justifyContent:"space-between", padding:"11px 0 3px", fontWeight:800, fontSize:14 }}>
                      <span>Total</span>
                      <span style={{ color:C.blue }}>{totalHours.toFixed(1)}h</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
      />

      {/* ── TOOLBAR */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", padding:"9px 20px", gap:10 }}>

        {/* Clock in/out — hidden for admin + architect */}
        <div style={{ flex:1 }}>
          {canClock && (
            <>
              {sessionError && <div style={{ fontSize:12, color:"#B91C1C", marginBottom:4 }}>{sessionError}</div>}
              {!checkedIn ? (
                <button
                  onClick={handleClockIn}
                  disabled={sessionLoading || !selectedProject}
                  style={{ background:sessionLoading||!selectedProject?"#aaa":C.blue, color:"#fff", border:"none", borderRadius:20, fontWeight:600, fontSize:13, cursor:sessionLoading||!selectedProject?"not-allowed":"pointer", padding:"9px 20px", fontFamily:"inherit", display:"flex", alignItems:"center", gap:7 }}
                >
                  <span style={{ width:8, height:8, borderRadius:"50%", background:"#22C55E", display:"inline-block" }} />
                  {sessionLoading ? "Checking in..." : "Check In"}
                </button>
              ) : (
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ background:"#F0FAF5", border:"1px solid #B8DFC9", borderRadius:22, padding:"7px 16px", display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ width:9, height:9, borderRadius:"50%", background:"#22C55E", display:"inline-block" }} />
                    <span style={{ fontSize:13, fontWeight:600, color:"#057642" }}>Checked in</span>
                    <span style={{ fontSize:12, color:"#5F5E5A" }}>since {fmtTime(checkInTime)}</span>
                  </div>
                  <button
                    onClick={handleClockOut}
                    disabled={sessionLoading}
                    style={{ background:sessionLoading?"#aaa":"#C8191C", color:"#fff", border:"none", borderRadius:20, fontWeight:600, fontSize:13, cursor:sessionLoading?"not-allowed":"pointer", padding:"9px 18px", fontFamily:"inherit" }}
                  >
                    {sessionLoading ? "..." : "Check Out"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Wing toggle */}
        <div style={{ flex:2, display:"flex", justifyContent:"center" }}>
          <div style={{ display:"flex", border:`2px solid ${C.blue}`, borderRadius:22, overflow:"hidden" }}>
            {[1,2].map(w => (
              <button key={w} onClick={() => switchWing(w)} style={{ padding:"6px 26px", border:"none", background:wing===w?C.blue:C.white, color:wing===w?"#fff":"#888", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }}>
                Wing {w}
              </button>
            ))}
          </div>
        </div>

        {/* Gewerk */}
        <div style={{ flex:1, display:"flex", justifyContent:"flex-end", position:"relative" }}>
          <button
            onClick={() => { setGOpen(o=>!o); setPOpen(false); }}
            style={{ background:gOpen?C.blueLt:C.white, color:C.blue, border:`2px solid ${C.blue}`, borderRadius:20, fontWeight:600, fontSize:13, cursor:"pointer", padding:"8px 18px", fontFamily:"inherit" }}
          >
            Gewerk ▾
          </button>
          {gOpen && (
            <div style={{ position:"absolute", top:42, right:0, width:272, maxHeight:340, overflowY:"auto", background:C.white, border:`1px solid ${C.border}`, borderRadius:10, boxShadow:"0 8px 28px rgba(0,0,0,.14)", zIndex:100 }}>
              <div style={{ padding:"10px 14px", borderBottom:`1px solid ${C.border}`, fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:.5, position:"sticky", top:0, background:C.white }}>
                GEWERK ({GEWERK_LIST.length})
              </div>
              {GEWERK_LIST.map((g,i) => (
                <div
                  key={g}
                  onClick={() => openGewerkFromDash(g)}
                  style={{ padding:"10px 14px", fontSize:13, borderBottom:"1px solid #F5F5F3", color:C.text, display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }}
                  onMouseOver={e => e.currentTarget.style.background=C.blueLt}
                  onMouseOut={e => e.currentTarget.style.background="transparent"}
                >
                  <span>{g}</span>
                  <span style={{ fontSize:11, color:"#ccc" }}>{i+1}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── PROGRESS BAR */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"9px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
          <span style={{ fontSize:12, fontWeight:600, color:"#666" }}>
            Wing {wing} · {selectedProject?.name || "—"} · Completion
          </span>
          <span style={{ fontSize:13, fontWeight:800, color:C.blue }}>
            {loadingUnits ? "—" : `${completion}%`}
          </span>
        </div>
        <div style={{ height:6, background:C.border, borderRadius:4, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${completion}%`, background:`linear-gradient(90deg,${C.blue},#2196F3)`, borderRadius:4, transition:"width .4s" }} />
        </div>
      </div>

      {/* ── SITE MAP */}
      <div style={{ display:"flex", padding:14, gap:12, background:C.bg, minHeight:360 }}>

        {/* Left panel — Wing 1 only */}
        {wing === 1 ? (
          <div style={{ width:136, display:"flex", flexDirection:"column", gap:7 }}>
            <button onClick={() => setZ1(o=>!o)} style={{ width:"100%", borderRadius:8, padding:"9px 12px", fontSize:12, fontWeight:600, cursor:"pointer", textAlign:"left", fontFamily:"inherit", background:z1Open?C.blue:C.white, color:z1Open?"#fff":C.blue, border:`2px solid ${C.blue}`, transition:"all .15s" }}>
              {z1Open?"▲":"▼"} Zisterne 1
            </button>
            {z1Open && ["Garten -1","Technik -1","Garten -2","Technik -2"].map(x=>(
              <button key={x} style={{ width:"100%", borderRadius:8, padding:"9px 12px 9px 18px", fontSize:12, fontWeight:500, cursor:"pointer", textAlign:"left", fontFamily:"inherit", background:C.blueLt, color:C.blue, border:`1px solid ${C.border}` }}>↳ {x}</button>
            ))}
            <button
                onClick={() => {
                    const u = units.find(u => u.name === "LPG");
                    if (u) handleUnitClick(u);
                }}
                style={{ width:"100%", borderRadius:8, padding:"9px 12px", fontSize:12, fontWeight:700, cursor:"pointer", textAlign:"left", fontFamily:"inherit", background:"#FFF7ED", color:"#C2410C", border:"2px solid #FDBA74" }}>⚡ LPG</button>
            <button
                onClick={() => {
                    const u = units.find(u => u.name === "Rainwater");
                    if (u) handleUnitClick(u);
                }}
                style={{ width:"100%", borderRadius:8, padding:"9px 12px", fontSize:12, fontWeight:700, cursor:"pointer", textAlign:"left", fontFamily:"inherit", background:C.blueLt, color:C.blue, border:`2px solid ${C.blue}` }}>Rainwater</button>
          </div>
        ) : <div style={{ width:136 }} />}

        {/* Centre — unit grid */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10, justifyContent:"center" }}>
          {loadingUnits ? (
            <div style={{ textAlign:"center", color:"#aaa", fontSize:13, padding:40 }}>Loading units...</div>
          ) : (
            <>
              {/* Wohneinheiten (housing) */}
              {weUnits.length > 0 && (
                <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:10 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"#bbb", letterSpacing:.5, marginBottom:7 }}>WOHNEINHEITEN</div>
                  <div style={{ display:"flex", gap:5 }}>
                    {weUnits.map(u => <UnitBlock key={u.id} unit={u} height={66} fontSize={11} onClick={()=>handleUnitClick(u)} />)}
                  </div>
                </div>
              )}

              {/* Heizzentrale (ancillary) */}
              {hzUnits.length > 0 && (
                <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:10, margin:"0 6%" }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"#bbb", letterSpacing:.5, marginBottom:7 }}>HEIZZENTRALE</div>
                  <div style={{ display:"flex", gap:5 }}>
                    {hzUnits.map(u => <UnitBlock key={u.id} unit={u} height={50} fontSize={10} onClick={()=>handleUnitClick(u)} />)}
                  </div>
                </div>
              )}

              {/* Carports */}
              {cpUnits.length > 0 && (
                <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, padding:10, margin:"0 14%" }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"#bbb", letterSpacing:.5, marginBottom:7 }}>CARPORTS</div>
                  <div style={{ display:"flex", gap:4 }}>
                    {cpUnits.map(u => <UnitBlock key={u.id} unit={u} height={36} fontSize={10} onClick={()=>handleUnitClick(u)} />)}
                  </div>
                </div>
              )}

              {/* Technical units (LPG, Zisterne etc.) are shown in side panels — not in the grid */}

              {/* No units found */}
              {weUnits.length === 0 && hzUnits.length === 0 && cpUnits.length === 0 && !loadingUnits && (
                <div style={{ textAlign:"center", color:"#aaa", fontSize:13, padding:40 }}>
                  {units.length === 0 ? "No units found for this project." : `No units assigned to Wing ${wing}.`}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right panel — Wing 2 only */}
        {wing === 2 ? (
          <div style={{ width:136, display:"flex", flexDirection:"column", gap:7 }}>
            <button onClick={() => setZ2(o=>!o)} style={{ width:"100%", borderRadius:8, padding:"9px 12px", fontSize:12, fontWeight:600, cursor:"pointer", textAlign:"left", fontFamily:"inherit", background:z2Open?C.blue:C.white, color:z2Open?"#fff":C.blue, border:`2px solid ${C.blue}`, transition:"all .15s" }}>
              {z2Open?"▲":"▼"} Zisterne 2
            </button>
            {z2Open && ["Garten -3","Technik -3","Garten -4","Technik -4"].map(x=>(
              <button key={x} style={{ width:"100%", borderRadius:8, padding:"9px 12px 9px 18px", fontSize:12, fontWeight:500, cursor:"pointer", textAlign:"left", fontFamily:"inherit", background:C.blueLt, color:C.blue, border:`1px solid ${C.border}` }}>↳ {x}</button>
            ))}
            <button
                onClick={() => {
                    const u = units.find(u => u.name === "LPG");
                    if (u) handleUnitClick(u);
                }}
                style={{ width:"100%", borderRadius:8, padding:"9px 12px", fontSize:12, fontWeight:700, cursor:"pointer", textAlign:"left", fontFamily:"inherit", background:"#FFF7ED", color:"#C2410C", border:"2px solid #FDBA74" }}>⚡ LPG</button>
            <button
                onClick={() => {
                    const u = units.find(u => u.name === "Rainwater");
                    if (u) handleUnitClick(u);
                }}
                style={{ width:"100%", borderRadius:8, padding:"9px 12px", fontSize:12, fontWeight:700, cursor:"pointer", textAlign:"left", fontFamily:"inherit", background:C.blueLt, color:C.blue, border:`2px solid ${C.blue}` }}>Rainwater</button>
          </div>
        ) : <div style={{ width:136 }} />}

      </div>

      {/* ── LEGEND */}
      <div style={{ display:"flex", gap:20, padding:"11px 20px", borderTop:`1px solid ${C.border}`, background:C.white, justifyContent:"center" }}>
        {Object.entries(SL).map(([k,v]) => (
          <div key={k} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:500, color:"#555" }}>
            <span style={{ display:"inline-block", width:12, height:12, borderRadius:3, background:UC[k] }} />
            <span>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── UNIT DETAIL VIEW ─────────────────────────────────────────────────────────
function UnitDetailView({ unit, role, projectName, onBack, onGewerkClick, onStatusChange }) {
    console.log("Unit detail:", unit);
  if (!unit) return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <Navbar center={<span style={{ fontSize:14, fontWeight:600, color:"#666" }}>{projectName}</span>} right={<BackButton onClick={onBack} />} />
      <div style={{ padding:40, textAlign:"center", color:"#aaa" }}>Loading unit details...</div>
    </div>
  );
  // Simplified view for technical units (LPG, Rainwater, Zisterne)
if (unit.unit_type === "technical") {
  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <Navbar
        center={<span style={{ fontSize:14, fontWeight:600, color:"#666" }}>{projectName}</span>}
        right={<BackButton onClick={onBack} />}
      />
      <div style={{ padding:14, display:"flex", flexDirection:"column", gap:12 }}>
        <div style={{ display:"flex", gap:12 }}>
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, borderTop:`4px solid ${C.blue}`, padding:"18px 22px", minWidth:138, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:.5, marginBottom:6 }}>EINHEIT</div>
            <div style={{ fontSize:26, fontWeight:800, color:C.blue, lineHeight:1, textAlign:"center" }}>{unit.name}</div>
            <div style={{ marginTop:10 }}><StatusBadge status={unit.status} /></div>
          </div>
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, flex:1, padding:20, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:32, marginBottom:10 }}>🔧</div>
              <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:6 }}>Work table coming soon</div>
              <div style={{ fontSize:13, color:"#aaa" }}>Builder will provide task details for this unit.</div>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, flex:1, padding:18 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:14 }}>Notes</div>
            <div style={{ padding:"12px 14px", background:C.bg, borderRadius:8, borderLeft:`3px solid ${C.blue}` }}>
              <div style={{ fontSize:13, color:"#aaa", fontStyle:"italic" }}>{unit.notes || "No notes for this unit."}</div>
            </div>
          </div>
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, width:200, padding:18 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:.5, marginBottom:12 }}>CURRENT STATUS</div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18, padding:"10px 12px", background:SBG[unit.status], borderRadius:8, border:`1px solid ${SBD[unit.status]}` }}>
              <StatusDot status={unit.status} />
              <span style={{ fontWeight:700, color:STC[unit.status], fontSize:13 }}>{SL[unit.status]}</span>
            </div>
            {["admin","architect","team_lead"].includes(role) && (
              <>
                <div style={{ fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:.5, marginBottom:9 }}>CHANGE STATUS</div>
                {Object.entries(SL).map(([k,v]) => (
                  <div key={k}
                    onClick={() => {
                      const uid = unit?.id;
                      if (uid) onStatusChange && onStatusChange(uid, k);
                    }}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:8, cursor:"pointer", marginBottom:3, background:k===unit.status?SBG[k]:"transparent", border:`1px solid ${k===unit.status?SBD[k]:"transparent"}` }}
                    onMouseOver={e=>e.currentTarget.style.background=C.bg}
                    onMouseOut={e=>e.currentTarget.style.background=k===unit.status?SBG[k]:"transparent"}
                  >
                    <StatusDot status={k} />
                    <span style={{ fontSize:13, color:C.text }}>{v}</span>
                    {k===unit.status && <span style={{ marginLeft:"auto", fontSize:12, fontWeight:700, color:STC[k] }}>✓</span>}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <Navbar
        center={<span style={{ fontSize:14, fontWeight:600, color:"#666" }}>{projectName}</span>}
        right={<BackButton onClick={onBack} />}
      />
      <div style={{ padding:14, display:"flex", flexDirection:"column", gap:12 }}>
        <div style={{ display:"flex", gap:12 }}>

          {/* Einheit */}
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, borderTop:`4px solid ${C.blue}`, padding:"18px 22px", minWidth:138, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:.5, marginBottom:6 }}>EINHEIT</div>
            <div style={{ fontSize:30, fontWeight:800, color:C.blue, lineHeight:1 }}>{unit.name}</div>
            <div style={{ marginTop:10 }}><StatusBadge status={unit.status} /></div>
          </div>

          {/* Gewerk list */}
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, flex:2, padding:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:.5, marginBottom:10 }}>GEWERK — click to open work table</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {GEWERK_LIST.map(g => (
                <button
                  key={g} onClick={() => onGewerkClick(g)}
                  style={{ border:`1px solid ${C.border}`, borderRadius:20, padding:"4px 11px", fontSize:12, cursor:"pointer", fontWeight:500, color:C.text, background:C.white, fontFamily:"inherit", transition:"all .15s" }}
                  onMouseOver={e => { e.currentTarget.style.background=C.blueLt; e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.color=C.blue; }}
                  onMouseOut={e => { e.currentTarget.style.background=C.white; e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.text; }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Arbeitsschritt */}
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, borderTop:`4px solid ${C.border}`, minWidth:158, padding:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:.5, marginBottom:10 }}>ARBEITSSCHRITT</div>
            <div style={{ fontSize:12, color:"#ccc", lineHeight:1.9 }}>Select a Gewerk<br />to view steps</div>
          </div>
        </div>

        <div style={{ display:"flex", gap:12 }}>

          {/* Info / Docs */}
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, flex:1, padding:18 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:14 }}>Information / Dokumente · Fotos</div>
            <div
              style={{ border:`2px dashed ${C.border}`, borderRadius:8, padding:20, textAlign:"center", background:C.bg, cursor:"pointer" }}
              onMouseOver={e=>e.currentTarget.style.borderColor=C.blue}
              onMouseOut={e=>e.currentTarget.style.borderColor=C.border}
            >
              <div style={{ fontSize:26, color:"#ccc", marginBottom:5 }}>+</div>
              <div style={{ fontSize:13, color:"#aaa" }}>Upload Document or Photo</div>
            </div>
            <div style={{ marginTop:12, padding:"12px 14px", background:C.bg, borderRadius:8, borderLeft:`3px solid ${C.blue}` }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#888", letterSpacing:.5, marginBottom:5 }}>NOTES</div>
              <div style={{ fontSize:13, color:"#aaa", fontStyle:"italic" }}>{unit.notes || "No notes for this unit."}</div>
            </div>
          </div>

          {/* Status panel */}
          <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, width:200, padding:18 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:.5, marginBottom:12 }}>CURRENT STATUS</div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18, padding:"10px 12px", background:SBG[unit.status], borderRadius:8, border:`1px solid ${SBD[unit.status]}` }}>
              <StatusDot status={unit.status} />
              <span style={{ fontWeight:700, color:STC[unit.status], fontSize:13 }}>{SL[unit.status]}</span>
            </div>
            {["admin","architect","team_lead"].includes(role) && (
              <>
                <div style={{ fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:.5, marginBottom:9 }}>CHANGE STATUS</div>
                {Object.entries(SL).map(([k,v]) => (
                  <div key={k}
                    onClick={() => {
                    const uid = unit?.id || unit?.unit_id;
                    console.log("uid is:", uid, "full unit:", JSON.stringify(unit));
                    if (uid) onStatusChange && onStatusChange(uid, k);
                    }}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:8, cursor:"pointer", marginBottom:3, background:k===unit.status?SBG[k]:"transparent", border:`1px solid ${k===unit.status?SBD[k]:"transparent"}` }}
                    onMouseOver={e=>e.currentTarget.style.background=C.bg}
                    onMouseOut={e=>e.currentTarget.style.background=k===unit.status?SBG[k]:"transparent"}
                  >
                    <StatusDot status={k} />
                    <span style={{ fontSize:13, color:C.text }}>{v}</span>
                    {k===unit.status && <span style={{ marginLeft:"auto", fontSize:12, fontWeight:700, color:STC[k] }}>✓</span>}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── WORK TABLE VIEW ──────────────────────────────────────────────────────────
function WorkTableView({ gewerk, unit, onBack }) {
  const cols = [1,2,3,4,5,6];
  const tasks = [
    { n:`${gewerk} – Rohbau`,    s:"done",        h:4, d:[5,3,0,0,0,0] },
    { n:`${gewerk} – Zuleitung`, s:"in_progress", h:6, d:[7,4,0,0,0,0] },
    { n:`${gewerk} – Montage`,   s:"done",        h:3, d:[7,7,0,0,0,0] },
    { n:`${gewerk} – Prüfung`,   s:"not_started", h:2, d:[0,0,0,0,0,0] },
    { n:`${gewerk} – Abnahme`,   s:"not_started", h:4, d:[0,0,0,0,0,0] },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <Navbar
        center={
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <span style={{ background:C.blue, color:"#fff", borderRadius:7, padding:"5px 14px", fontSize:13, fontWeight:700 }}>{gewerk}</span>
            {unit && <><span style={{ color:"#ccc" }}>·</span><span style={{ fontSize:13, fontWeight:700, color:"#666" }}>{unit.name}</span></>}
          </div>
        }
        right={<BackButton onClick={onBack} />}
      />
      <div style={{ padding:14 }}>
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ borderCollapse:"collapse", fontSize:13, minWidth:820, width:"100%" }}>
              <thead>
                <tr style={{ background:C.blue }}>
                  <th style={{ padding:"13px 16px", textAlign:"left", color:"#fff", fontWeight:700, minWidth:220 }}>{gewerk?.toUpperCase()}</th>
                  <th style={{ padding:"13px 10px", color:"#fff", fontWeight:600 }}>Stunden</th>
                  <th style={{ padding:"13px 10px", color:"#fff", fontWeight:600 }}>Status</th>
                  {cols.map(d => (
                    <th key={d} style={{ padding:"13px 6px", color:"rgba(255,255,255,.8)", fontWeight:500, fontStyle:"italic", minWidth:76 }}>Tag {d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((t, i) => {
                  const bg  = i%2===0 ? C.white : "#FAFAFA";
                  const mbg = i%2===0 ? "#F7F7F5" : "#F2F1EE";
                  return [
                    <tr key={`row-${i}`} style={{ borderBottom:`1px solid ${C.border}` }}>
                      <td style={{ padding:"11px 14px", fontWeight:500, color:C.text, background:bg }}>{t.n}</td>
                      <td style={{ padding:"11px 10px", textAlign:"center", fontWeight:700, color:"#555", background:bg }}>{t.h}h</td>
                      <td style={{ padding:"11px 10px", textAlign:"center", background:bg }}><StatusBadge status={t.s} /></td>
                      {cols.map(d => {
                        const f = t.d[d-1]||0;
                        return (
                          <td key={d} style={{ padding:"6px 4px", background:bg }}>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:2, justifyContent:"center", width:64 }}>
                              {Array.from({length:7},(_,w)=>(
                                <div key={w} style={{ width:9, height:9, borderRadius:2, background:w<f?UC[t.s]:C.border }} />
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>,
                    <tr key={`monteur-${i}`}>
                      <td colSpan={3} style={{ padding:"5px 14px 7px 28px", fontStyle:"italic", color:"#bbb", fontSize:12, background:mbg }}>Monteur / Gewerk</td>
                      {cols.map(d => (
                        <td key={d} style={{ padding:4, textAlign:"center", fontSize:11, color:"#ccc", fontStyle:"italic", background:mbg }}>Tag {d}</td>
                      ))}
                    </tr>
                  ];
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div style={{ marginTop:12, display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
          {Object.entries(SL).map(([k,v]) => (
            <div key={k} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:500, color:"#555", background:C.white, border:`1px solid ${C.border}`, borderRadius:20, padding:"5px 13px" }}>
              <StatusDot status={k} /><span>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}