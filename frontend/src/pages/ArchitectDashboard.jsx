import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUnits, updateUnitStatus, addUnitTask, updateUnitNotes } from "../api/units";
import { getTeamReports } from "../api/sessions";

const THEME = {
  bg: "#F3F2EF", white: "#FFFFFF", blue: "#0A66C2", blueLight: "#E8F0FE",
  border: "#E0DFDC", text: "#1a1a1a", muted: "#666",
  green: "#057642", greenBg: "#EAF3DE", greenBorder: "#C0DD97",
  amber: "#854F0B", amberBg: "#FFF3E0", amberBorder: "#FAC775",
  red: "#A32D2D", redBg: "#FCEBEB", redBorder: "#F7C1C1",
  purple: "#6B3FA0", purpleBg: "#F5EFFC", purpleBorder: "#D4AFEF",
};

const STATUS_CONFIG = {
  done:        { label: "Done",        bg: "#EAF3DE", border: "#C0DD97", color: "#057642", dot: "#639922" },
  in_progress: { label: "In progress", bg: "#FFF3E0", border: "#FAC775", color: "#854F0B", dot: "#BA7517" },
  issue:       { label: "Issue",       bg: "#FCEBEB", border: "#F7C1C1", color: "#A32D2D", dot: "#E24B4A" },
  not_started: { label: "Not started", bg: "#F3F2EF", border: "#E0DFDC", color: "#555",    dot: "#B4B2A9" },
};

export default function ArchitectDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("units");

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [units, setUnits] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitTasks, setUnitTasks] = useState([]);

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const [newTask, setNewTask] = useState("");
  const [newTaskCat, setNewTaskCat] = useState("general");
  const [editingNotes, setEditingNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const [msg, setMsg] = useState(null);

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
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    getUnits(selectedProject.id).then(setUnits).catch(() => {});
    if (activeTab === "reports") loadReports(selectedProject.id);
  }, [selectedProject]);

  const loadReports = async (pid) => {
    setReportsLoading(true);
    try {
      const data = await getTeamReports(pid || selectedProject?.id);
      setReports(data);
    } catch (e) { showMsg(e.message, "error"); }
    setReportsLoading(false);
  };

  const handleSelectUnit = async (u) => {
    setSelectedUnit(u);
    setEditingNotes(u.notes || "");
    try {
      const res = await fetch(`http://localhost:8000/units/${u.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      const data = await res.json();
      setUnitTasks(data.tasks || []);
    } catch (e) { setUnitTasks([]); }
  };

  const handleStatusChange = async (unitId, status) => {
    try {
      await updateUnitStatus(unitId, status);
      setUnits(prev => prev.map(u => u.id === unitId ? { ...u, status } : u));
      if (selectedUnit?.id === unitId) setSelectedUnit(prev => ({ ...prev, status }));
      showMsg("Status updated");
    } catch (e) { showMsg(e.message, "error"); }
  };

  const handleSaveNotes = async () => {
    if (!selectedUnit) return;
    setSavingNotes(true);
    try {
      await updateUnitNotes(selectedUnit.id, editingNotes);
      setUnits(prev => prev.map(u => u.id === selectedUnit.id ? { ...u, notes: editingNotes } : u));
      setSelectedUnit(prev => ({ ...prev, notes: editingNotes }));
      showMsg("Notes saved — visible to customer");
    } catch (e) { showMsg(e.message, "error"); }
    setSavingNotes(false);
  };

  const handleAddTask = async () => {
    if (!newTask.trim() || !selectedUnit) return;
    try {
      const task = await addUnitTask(selectedUnit.id, { name: newTask, category: newTaskCat });
      setUnitTasks(prev => [...prev, task]);
      setNewTask("");
      showMsg("Task added");
    } catch (e) { showMsg(e.message, "error"); }
  };

  const filteredUnits = units.filter(u =>
    filter === "all" ||
    (filter === "housing"  && u.unit_type === "housing") ||
    (filter === "ancillary" && u.unit_type === "ancillary") ||
    (filter === "carport"  && u.unit_type === "carport") ||
    (filter === "technical" && u.unit_type === "technical")
  );

  const grouped = {
    issue:       filteredUnits.filter(u => u.status === "issue"),
    in_progress: filteredUnits.filter(u => u.status === "in_progress"),
    not_started: filteredUnits.filter(u => u.status === "not_started"),
    done:        filteredUnits.filter(u => u.status === "done"),
  };

  const totalDone = units.filter(u => u.status === "done").length;
  const progress  = units.length > 0 ? Math.round((totalDone / units.length) * 100) : 0;

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
            <select value={selectedProject?.id || ""}
              onChange={e => {
                const p = projects.find(p => p.id === e.target.value);
                setSelectedProject(p);
                setSelectedUnit(null);
                setUnitTasks([]);
              }}
              style={{ fontSize: 13, padding: "5px 10px", borderRadius: 8, border: `1px solid ${THEME.border}`, background: THEME.bg, color: THEME.text, fontFamily: "Inter, sans-serif" }}>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <span style={{ fontSize: 13, color: THEME.muted }}>{user?.full_name}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 12, background: THEME.purpleBg, color: THEME.purple, border: `1px solid ${THEME.purpleBorder}` }}>
              Architect
            </span>
            <button onClick={logout} style={{ padding: "6px 14px", border: `1px solid ${THEME.border}`, borderRadius: 20, background: "transparent", color: THEME.muted, fontSize: 12, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {msg && (
        <div style={{ position: "fixed", top: 70, right: 20, zIndex: 999, padding: "10px 18px", borderRadius: 8, background: msg.type === "error" ? THEME.redBg : THEME.greenBg, border: `1px solid ${msg.type === "error" ? THEME.redBorder : THEME.greenBorder}`, color: msg.type === "error" ? THEME.red : THEME.green, fontSize: 13, fontWeight: 500 }}>
          {msg.text}
        </div>
      )}

      <div style={{ maxWidth: 1128, margin: "0 auto", padding: 20 }}>

        {/* Project stats bar */}
        <div style={{ background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: "14px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[
                { label: "Total units",   value: units.length,                                    color: THEME.text },
                { label: "In progress",   value: units.filter(u => u.status === "in_progress").length, color: THEME.amber },
                { label: "Done",          value: totalDone,                                        color: THEME.green },
                { label: "Issues",        value: units.filter(u => u.status === "issue").length,  color: THEME.red },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: THEME.blue }}>{progress}%</div>
              <div style={{ fontSize: 11, color: THEME.muted }}>complete</div>
              <div style={{ width: 120, height: 5, background: THEME.border, borderRadius: 3, marginTop: 4 }}>
                <div style={{ width: `${progress}%`, height: "100%", background: THEME.blue, borderRadius: 3 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: `2px solid ${THEME.border}`, marginBottom: 20 }}>
          {[["units", "Site units"], ["reports", "Work reports"]].map(([tab, label]) => (
            <button key={tab} onClick={() => {
              setActiveTab(tab);
              if (tab === "reports" && selectedProject) loadReports(selectedProject.id);
            }}
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

            <div style={{ display: "grid", gridTemplateColumns: selectedUnit ? "1fr 380px" : "1fr", gap: 16 }}>
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
                          <button key={u.id} onClick={() => handleSelectUnit(u)}
                            style={{ padding: "5px 14px", borderRadius: 20, border: `1.5px solid ${selectedUnit?.id === u.id ? THEME.blue : cfg.border}`, background: selectedUnit?.id === u.id ? THEME.blueLight : cfg.bg, color: selectedUnit?.id === u.id ? THEME.blue : cfg.color, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                            {u.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Unit detail panel */}
              {selectedUnit && (
                <div style={{ background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16, alignSelf: "start" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: THEME.text }}>{selectedUnit.name}</div>
                    <button onClick={() => { setSelectedUnit(null); setUnitTasks([]); }}
                      style={{ fontSize: 12, color: THEME.muted, background: "none", border: "none", cursor: "pointer" }}>✕</button>
                  </div>

                  {/* Status update */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                        <button key={key} onClick={() => handleStatusChange(selectedUnit.id, key)}
                          style={{ padding: "4px 12px", borderRadius: 20, border: `1px solid ${selectedUnit.status === key ? cfg.color : cfg.border}`, background: selectedUnit.status === key ? cfg.bg : THEME.white, color: cfg.color, fontSize: 11, fontWeight: selectedUnit.status === key ? 700 : 400, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer note */}
                  <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer update note</div>
                    <textarea value={editingNotes} onChange={e => setEditingNotes(e.target.value)}
                      placeholder="e.g. Electrical wiring 50% complete..."
                      rows={2}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12, fontFamily: "Inter, sans-serif", resize: "vertical", marginBottom: 6 }} />
                    <button onClick={handleSaveNotes} disabled={savingNotes}
                      style={{ width: "100%", padding: "7px 0", borderRadius: 8, border: "none", background: THEME.blue, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif", opacity: savingNotes ? 0.6 : 1 }}>
                      {savingNotes ? "Saving..." : "Save note — visible to customer"}
                    </button>
                  </div>

                  {/* Task list */}
                  <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tasks ({unitTasks.length})</div>
                    <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                      {unitTasks.map(task => (
                        <div key={task.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", borderRadius: 6, background: THEME.bg }}>
                          <span style={{ fontSize: 12, color: THEME.text }}>{task.name}</span>
                          <span style={{ fontSize: 10, color: THEME.muted, background: THEME.white, padding: "1px 6px", borderRadius: 6, border: `1px solid ${THEME.border}` }}>{task.category}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add custom task */}
                  <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 14 }}>
                    <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Add custom task</div>
                    <input value={newTask} onChange={e => setNewTask(e.target.value)}
                      placeholder="Task name..."
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12, fontFamily: "Inter, sans-serif", marginBottom: 6 }} />
                    <select value={newTaskCat} onChange={e => setNewTaskCat(e.target.value)}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: `1px solid ${THEME.border}`, fontSize: 12, fontFamily: "Inter, sans-serif", marginBottom: 8 }}>
                      {["general", "structural", "utilities", "finishing", "special"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <button onClick={handleAddTask}
                      style={{ width: "100%", padding: "7px 0", borderRadius: 8, border: `1px solid ${THEME.border}`, background: THEME.white, color: THEME.text, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                      + Add task
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Reports tab */}
        {activeTab === "reports" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reportsLoading ? (
              <div style={{ textAlign: "center", padding: 40, color: THEME.muted }}>Loading reports...</div>
            ) : reports.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: THEME.muted, background: THEME.white, borderRadius: 12, border: `1px solid ${THEME.border}` }}>
                No work reports yet for this project.
              </div>
            ) : (
              reports.map(r => (
                <div key={r.session_id} style={{ background: THEME.white, border: `1px solid ${THEME.border}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: THEME.purpleBg, color: THEME.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
                        {r.worker?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: THEME.text }}>{r.worker}</span>
                          <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 8, background: THEME.blueLight, color: THEME.blue }}>{r.worker_role?.replace("_", " ")}</span>
                        </div>
                        <div style={{ fontSize: 11, color: THEME.muted }}>{r.session_date}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: r.total_hours ? THEME.greenBg : THEME.amberBg, color: r.total_hours ? THEME.green : THEME.amber, border: `1px solid ${r.total_hours ? THEME.greenBorder : THEME.amberBorder}` }}>
                      {r.total_hours ? `${r.total_hours}h` : "Active"}
                    </span>
                  </div>
                  {r.units_worked?.length > 0 && (
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: THEME.muted }}>Units: </span>
                      {[...new Map(r.units_worked.map(u => [u.id, u])).values()].map(u => (
                        <span key={u.id} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: THEME.blueLight, color: THEME.blue, marginLeft: 4 }}>{u.name}</span>
                      ))}
                    </div>
                  )}
                  {r.tasks_completed?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                      {r.tasks_completed.map((t, i) => (
                        <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: THEME.greenBg, color: THEME.green, border: `1px solid ${THEME.greenBorder}` }}>✓ {t.task}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))
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