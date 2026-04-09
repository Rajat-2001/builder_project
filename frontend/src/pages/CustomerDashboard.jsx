import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyProjects } from "../api/attendance";

// ── Pure SVG Pie Chart ──
function PieChart({ percentage, color = "#0A66C2", size = 120 }) {
  const radius     = 45;
  const cx         = size / 2;
  const cy         = size / 2;
  const circumference = 2 * Math.PI * radius;
  const filled     = (percentage / 100) * circumference;
  const empty      = circumference - filled;

  // Convert percentage to arc path
  const angle      = (percentage / 100) * 360;
  const rad        = (angle - 90) * (Math.PI / 180);
  const x          = cx + radius * Math.cos(rad);
  const y          = cy + radius * Math.sin(rad);
  const largeArc   = angle > 180 ? 1 : 0;

  const pathData = percentage >= 100
    ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.001} ${cy - radius} Z`
    : percentage <= 0
    ? ""
    : `M ${cx} ${cy - radius} A ${radius} ${radius} 0 ${largeArc} 1 ${x} ${y} L ${cx} ${cy} Z`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={radius} fill="#F3F2EF" stroke="#E0DFDC" strokeWidth="1"/>
      {/* Filled arc */}
      {percentage > 0 && (
        <path d={pathData} fill={color} opacity="0.9"/>
      )}
      {/* Center white circle — donut effect */}
      <circle cx={cx} cy={cy} r={radius * 0.6} fill="#FFFFFF"/>
      {/* Percentage text */}
      <text
        x={cx} y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="16"
        fontWeight="700"
        fill="#000000E6"
        fontFamily="Inter, sans-serif"
      >
        {Math.round(percentage)}%
      </text>
    </svg>
  );
}

// Status config
const STATUS_CONFIG = {
  planning:    { label:"Planning",    color:"#666",    bg:"#F3F2EF", border:"#D0CFC9" },
  in_progress: { label:"In Progress", color:"#0A66C2", bg:"#EEF3FB", border:"#C0D7F5" },
  on_hold:     { label:"On Hold",     color:"#CC1016", bg:"#FFF0F0", border:"#FFCCCC" },
  completed:   { label:"Completed",   color:"#057642", bg:"#F0FAF5", border:"#B8DFC9" },
};

// Section colors — cycles through these for multiple sections
const SECTION_COLORS = [
  "#0A66C2", "#057642", "#7A3E00", "#6B3FA0",
  "#B24020", "#0F6E56", "#185FA5", "#3B6D11",
];

export default function CustomerDashboard() {
  const { user, logout } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [selected, setSelected] = useState(0); // index of selected project

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getMyProjects();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const project = projects[selected];

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
            <span style={s.badge}>Customer</span>
            <button onClick={logout} style={s.logoutBtn} className="logout-hover">Sign out</button>
          </div>
        </div>
      </div>

      <div style={s.main}>

        {/* Page header */}
        <div style={s.pageHeader}>
          <h1 style={s.pageTitle}>My Projects</h1>
          <p style={s.pageSub}>Track the progress of your construction projects</p>
        </div>

        {loading && (
          <div style={s.loadingCard}>
            <p style={{color:"#666", fontSize:"14px"}}>Loading your projects...</p>
          </div>
        )}

        {error && (
          <div style={s.errorCard}>{error}</div>
        )}

        {!loading && projects.length === 0 && (
          <div style={s.emptyCard}>
            <span style={{fontSize:"48px"}}>🏗️</span>
            <h2 style={{fontSize:"18px", fontWeight:"700", color:"#000000E6", marginTop:"16px", marginBottom:"8px"}}>
              No projects yet
            </h2>
            <p style={{fontSize:"14px", color:"#666"}}>
              Your project manager hasn't assigned any projects to your account yet.
              Please contact them for more information.
            </p>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <>
            {/* Project selector — if multiple projects */}
            {projects.length > 1 && (
              <div style={s.projectTabs}>
                {projects.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(i)}
                    style={{...s.projectTab, ...(selected === i ? s.projectTabActive : {})}}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}

            {project && (
              <div style={{display:"flex", flexDirection:"column", gap:"20px", animation:"fadeIn 0.3s ease"}}>

                {/* Project overview card */}
                <div style={s.overviewCard}>
                  <div style={s.overviewLeft}>
                    <div style={s.overviewTop}>
                      <h2 style={s.projectName}>{project.name}</h2>
                      {project.status && STATUS_CONFIG[project.status] && (
                        <span style={{
                          fontSize:"12px", fontWeight:"600", padding:"4px 12px",
                          borderRadius:"12px",
                          backgroundColor: STATUS_CONFIG[project.status].bg,
                          border: `1px solid ${STATUS_CONFIG[project.status].border}`,
                          color: STATUS_CONFIG[project.status].color,
                        }}>
                          {STATUS_CONFIG[project.status].label}
                        </span>
                      )}
                    </div>

                    {project.description && (
                      <p style={s.projectDesc}>{project.description}</p>
                    )}

                    {/* Timeline */}
                    {(project.start_date || project.end_date) && (
                      <div style={s.timeline}>
                        {project.start_date && (
                          <div style={s.timelineItem}>
                            <span style={s.timelineLabel}>Started</span>
                            <span style={s.timelineValue}>{project.start_date}</span>
                          </div>
                        )}
                        {project.end_date && (
                          <div style={s.timelineItem}>
                            <span style={s.timelineLabel}>Expected completion</span>
                            <span style={s.timelineValue}>{project.end_date}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Overall progress bar */}
                    <div style={s.overallProgress}>
                      <div style={s.progressHeader}>
                        <span style={s.progressLabel}>Overall completion</span>
                        <span style={s.progressValue}>{project.overall_progress}%</span>
                      </div>
                      <div style={s.progressTrack}>
                        <div style={{
                          ...s.progressFill,
                          width: `${project.overall_progress}%`,
                          backgroundColor: project.overall_progress >= 100
                            ? "#057642"
                            : project.overall_progress >= 50
                            ? "#0A66C2"
                            : "#F59E0B",
                        }}/>
                      </div>
                      <div style={s.progressFooter}>
                        <span style={{fontSize:"12px", color:"#666"}}>
                          {project.overall_progress >= 100
                            ? "🎉 Project complete!"
                            : `${100 - project.overall_progress}% remaining`}
                        </span>
                        {project.updated_at && (
                          <span style={{fontSize:"12px", color:"#999"}}>
                            Updated {new Date(project.updated_at).toLocaleDateString("en-IN", {day:"numeric", month:"short"})}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Big donut chart for overall */}
                  <div style={s.overviewRight}>
                    <PieChart
                      percentage={project.overall_progress}
                      color={project.overall_progress >= 100 ? "#057642" : "#0A66C2"}
                      size={160}
                    />
                    <p style={{fontSize:"12px", color:"#666", marginTop:"8px", textAlign:"center"}}>
                      Overall progress
                    </p>
                  </div>
                </div>

                {/* Sections grid */}
                {project.sections && project.sections.length > 0 && (
                  <>
                    <h2 style={s.sectionHeading}>Section Breakdown</h2>
                    <div style={s.sectionsGrid}>
                      {project.sections.map((section, i) => {
                        const color = SECTION_COLORS[i % SECTION_COLORS.length];
                        return (
                          <div key={i} style={s.sectionCard}>
                            <div style={s.sectionCardTop}>
                              <PieChart
                                percentage={section.percentage}
                                color={color}
                                size={100}
                              />
                              <div style={s.sectionInfo}>
                                <h3 style={s.sectionName}>{section.section_name}</h3>
                                <div style={s.sectionStats}>
                                  <div style={s.sectionStat}>
                                    <span style={{...s.sectionStatDot, backgroundColor:color}}/>
                                    <span style={{fontSize:"12px", color:"#333"}}>Done: <strong>{section.percentage}%</strong></span>
                                  </div>
                                  <div style={s.sectionStat}>
                                    <span style={{...s.sectionStatDot, backgroundColor:"#E0DFDC"}}/>
                                    <span style={{fontSize:"12px", color:"#333"}}>Left: <strong>{section.remaining}%</strong></span>
                                  </div>
                                </div>
                                {/* Mini progress bar */}
                                <div style={s.miniTrack}>
                                  <div style={{...s.miniFill, width:`${section.percentage}%`, backgroundColor:color}}/>
                                </div>
                              </div>
                            </div>
                            {section.notes && (
                              <p style={s.sectionNotes}>{section.notes}</p>
                            )}
                            {section.updated_at && (
                              <p style={s.sectionUpdated}>
                                Last updated {new Date(section.updated_at).toLocaleDateString("en-IN", {day:"numeric", month:"short", year:"numeric"})}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {project.sections && project.sections.length === 0 && (
                  <div style={s.noSections}>
                    <p style={{fontSize:"14px", color:"#666"}}>Section details will be added by your project manager soon.</p>
                  </div>
                )}

              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div style={s.footer}>
        {["About","Help Center","Privacy","Terms","© 2025 Builder"].map(item => (
          <span key={item} style={s.footerItem}>{item}</span>
        ))}
      </div>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .logout-hover:hover { background: #F3F2EF !important; color: #CC1016 !important; }
  * { box-sizing: border-box; }
`;

const s = {
  root:         { minHeight:"100vh", backgroundColor:"#F3F2EF", fontFamily:"'Inter', sans-serif", display:"flex", flexDirection:"column" },
  navbar:       { backgroundColor:"#FFFFFF", borderBottom:"1px solid #E0DFDC", position:"sticky", top:0, zIndex:100 },
  navInner:     { maxWidth:"1100px", margin:"0 auto", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  navLogo:      { display:"flex", alignItems:"center", gap:"8px" },
  navBrand:     { fontSize:"20px", fontWeight:"700", color:"#0A66C2", letterSpacing:"-0.3px" },
  navRight:     { display:"flex", alignItems:"center", gap:"12px" },
  navName:      { fontSize:"14px", fontWeight:"600", color:"#333" },
  badge:        { fontSize:"12px", fontWeight:"600", padding:"4px 10px", borderRadius:"12px", backgroundColor:"#FDF0EC", border:"1px solid #F5C2B0", color:"#B24020" },
  logoutBtn:    { padding:"8px 18px", backgroundColor:"transparent", color:"#666", border:"1px solid #C9C5C0", borderRadius:"24px", fontSize:"14px", fontWeight:"600", cursor:"pointer", fontFamily:"'Inter', sans-serif", transition:"all 0.15s" },
  main:         { flex:1, maxWidth:"1100px", margin:"0 auto", padding:"32px 24px", width:"100%" },
  pageHeader:   { marginBottom:"24px" },
  pageTitle:    { fontSize:"26px", fontWeight:"700", color:"#000000E6", marginBottom:"4px" },
  pageSub:      { fontSize:"14px", color:"#666" },
  loadingCard:  { backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)", padding:"60px", textAlign:"center" },
  errorCard:    { backgroundColor:"#FFF0F0", border:"1px solid #FFCCCC", borderRadius:"8px", padding:"16px", color:"#CC1016", fontSize:"14px" },
  emptyCard:    { backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)", padding:"60px", textAlign:"center", maxWidth:"480px", margin:"0 auto" },
  projectTabs:  { display:"flex", gap:"8px", marginBottom:"20px", flexWrap:"wrap" },
  projectTab:   { padding:"8px 18px", borderRadius:"24px", fontSize:"14px", fontWeight:"600", cursor:"pointer", border:"1.5px solid #C9C5C0", backgroundColor:"#FFFFFF", color:"#666", fontFamily:"'Inter', sans-serif", transition:"all 0.15s" },
  projectTabActive: { backgroundColor:"#0A66C2", borderColor:"#0A66C2", color:"#FFFFFF" },
  overviewCard: { backgroundColor:"#FFFFFF", borderRadius:"12px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)", padding:"32px", display:"flex", alignItems:"flex-start", gap:"32px" },
  overviewLeft: { flex:1 },
  overviewTop:  { display:"flex", alignItems:"center", gap:"12px", marginBottom:"8px", flexWrap:"wrap" },
  projectName:  { fontSize:"22px", fontWeight:"700", color:"#000000E6" },
  projectDesc:  { fontSize:"14px", color:"#666", lineHeight:"1.6", marginBottom:"20px" },
  timeline:     { display:"flex", gap:"24px", marginBottom:"20px", flexWrap:"wrap" },
  timelineItem: { display:"flex", flexDirection:"column", gap:"2px" },
  timelineLabel:{ fontSize:"11px", fontWeight:"600", color:"#999", textTransform:"uppercase", letterSpacing:"0.5px" },
  timelineValue:{ fontSize:"14px", fontWeight:"600", color:"#333" },
  overallProgress: { marginTop:"4px" },
  progressHeader:  { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" },
  progressLabel:   { fontSize:"13px", fontWeight:"600", color:"#333" },
  progressValue:   { fontSize:"20px", fontWeight:"700", color:"#0A66C2" },
  progressTrack:   { height:"10px", backgroundColor:"#E0DFDC", borderRadius:"5px", overflow:"hidden" },
  progressFill:    { height:"100%", borderRadius:"5px", transition:"width 0.5s ease" },
  progressFooter:  { display:"flex", justifyContent:"space-between", marginTop:"6px" },
  overviewRight:   { display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 },
  sectionHeading:  { fontSize:"18px", fontWeight:"700", color:"#000000E6" },
  sectionsGrid:    { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:"16px" },
  sectionCard:     { backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)", padding:"20px" },
  sectionCardTop:  { display:"flex", alignItems:"center", gap:"16px" },
  sectionInfo:     { flex:1 },
  sectionName:     { fontSize:"15px", fontWeight:"700", color:"#000000E6", marginBottom:"8px" },
  sectionStats:    { display:"flex", flexDirection:"column", gap:"4px", marginBottom:"10px" },
  sectionStat:     { display:"flex", alignItems:"center", gap:"6px" },
  sectionStatDot:  { width:"8px", height:"8px", borderRadius:"50%", flexShrink:0 },
  miniTrack:       { height:"4px", backgroundColor:"#E0DFDC", borderRadius:"2px", overflow:"hidden" },
  miniFill:        { height:"100%", borderRadius:"2px", transition:"width 0.5s ease" },
  sectionNotes:    { fontSize:"12px", color:"#666", marginTop:"12px", padding:"8px 12px", backgroundColor:"#F8F7F4", borderRadius:"6px", lineHeight:"1.5" },
  sectionUpdated:  { fontSize:"11px", color:"#999", marginTop:"8px" },
  noSections:      { backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)", padding:"32px", textAlign:"center" },
  footer:          { borderTop:"1px solid #E0DFDC", backgroundColor:"#FFFFFF", padding:"16px 24px", display:"flex", flexWrap:"wrap", gap:"16px", justifyContent:"center", marginTop:"auto" },
  footerItem:      { fontSize:"12px", color:"#666", cursor:"pointer" },
};