import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getAllUsers, createUser, toggleUserActive, deleteUser,
  createInvite, getAllInvites,
  getAllProjects, createProject,
} from "../api/admin";

const ROLE_CONFIG = {
  admin:     { label:"Administrator", color:"#0A66C2", bg:"#EEF3FB", border:"#C0D7F5" },
  team_lead: { label:"Team Leader",   color:"#057642", bg:"#F0FAF5", border:"#B8DFC9" },
  worker:    { label:"Worker",        color:"#7A3E00", bg:"#FDF3E7", border:"#F0C98A" },
  architect: { label:"Architect",     color:"#6B3FA0", bg:"#F5EFFC", border:"#D4AFEF" },
  customer:  { label:"Customer",      color:"#B24020", bg:"#FDF0EC", border:"#F5C2B0" },
};

// Roles admin creates directly — customers use invite link
const DIRECT_ROLES = ["team_lead", "worker", "architect"];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("users");

  // Users state
  const [users,        setUsers]        = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [roleFilter,   setRoleFilter]   = useState("all");
  const [showAddUser,  setShowAddUser]  = useState(false);
  const [newUser,      setNewUser]      = useState({ full_name:"", phone:"", password:"", role:"worker", email:"" });
  const [userMsg,      setUserMsg]      = useState("");
  const [credentials,  setCredentials]  = useState(null);
  const [credCopied,   setCredCopied]   = useState(false);

  // Invites state
  const [invites,        setInvites]        = useState([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [customerName,   setCustomerName]   = useState("");
  const [inviteForName,  setInviteForName]  = useState("");
  const [generatedLink,  setGeneratedLink]  = useState("");
  const [inviteMsg,      setInviteMsg]      = useState("");
  const [copied,         setCopied]         = useState(false);

  // Projects state
  const [projects,        setProjects]        = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [showAddProject,  setShowAddProject]  = useState(false);
  const [newProject,      setNewProject]      = useState({ name:"", description:"", start_date:"", end_date:"" });
  const [projectMsg,      setProjectMsg]      = useState("");

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setUserMsg(err.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadInvites = async () => {
    setInvitesLoading(true);
    try {
      const data = await getAllInvites();
      setInvites(data);
    } finally {
      setInvitesLoading(false);
    }
  };

  const loadProjects = async () => {
    setProjectsLoading(true);
    try {
      const data = await getAllProjects();
      setProjects(data);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "invites"  && invites.length  === 0) loadInvites();
    if (tab === "projects" && projects.length === 0) loadProjects();
  };

  // ── Create user ──
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserMsg("");
    setCredentials(null);
    try {
      await createUser({ ...newUser, email: newUser.email || undefined });
      setCredentials({
        full_name: newUser.full_name,
        phone:     newUser.phone,
        password:  newUser.password,
        role:      newUser.role,
      });
      setNewUser({ full_name:"", phone:"", password:"", role:"worker", email:"" });
      setShowAddUser(false);
      loadUsers();
    } catch (err) {
      setUserMsg(err.message);
    }
  };

  const handleCopyCredentials = () => {
    if (!credentials) return;
    const text = `Builder App Credentials\n\nName: ${credentials.full_name}\nRole: ${ROLE_CONFIG[credentials.role]?.label}\nPhone: ${credentials.phone}\nPassword: ${credentials.password}\n\nLogin at: http://localhost:5173/login`;
    navigator.clipboard.writeText(text);
    setCredCopied(true);
    setTimeout(() => setCredCopied(false), 2000);
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await toggleUserActive(userId, !currentStatus);
      loadUsers();
    } catch (err) {
      setUserMsg(err.message);
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await deleteUser(userId);
      loadUsers();
    } catch (err) {
      setUserMsg(err.message);
    }
  };

  // ── Generate customer invite ──
  const handleGenerateInvite = async () => {
    if (!customerName.trim()) {
      setInviteMsg("Please enter the customer's name first.");
      return;
    }
    setInviteMsg("");
    setGeneratedLink("");
    try {
      const data = await createInvite("customer");
      const link = `http://localhost:5173/join?token=${data.token}`;
      setGeneratedLink(link);
      setInviteForName(customerName.trim());
      setCustomerName("");
      loadInvites();
    } catch (err) {
      setInviteMsg(err.message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Create project ──
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setProjectMsg("");
    try {
      await createProject({
        ...newProject,
        start_date: newProject.start_date || undefined,
        end_date:   newProject.end_date   || undefined,
      });
      setProjectMsg("✓ Project created successfully.");
      setNewProject({ name:"", description:"", start_date:"", end_date:"" });
      setShowAddProject(false);
      loadProjects();
    } catch (err) {
      setProjectMsg(err.message);
    }
  };

  // ── Filtered users ──
  const filteredUsers = roleFilter === "all"
    ? users
    : users.filter(u => u.role === roleFilter);

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
            <span style={{...s.roleBadge, backgroundColor:ROLE_CONFIG.admin.bg, border:`1px solid ${ROLE_CONFIG.admin.border}`, color:ROLE_CONFIG.admin.color}}>Administrator</span>
            <button onClick={logout} style={s.logoutBtn} className="logout-hover">Sign out</button>
          </div>
        </div>
      </div>

      <div style={s.main}>
        <div style={s.pageHeader}>
          <h1 style={s.pageTitle}>Admin Dashboard</h1>
          <p style={s.pageSub}>Manage users, invites, and projects</p>
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          {[["users","👥 Users"], ["invites","🔗 Customer Invites"], ["projects","📋 Projects"]].map(([tab, label]) => (
            <button key={tab} onClick={() => handleTabChange(tab)} style={{...s.tab, ...(activeTab===tab?s.tabActive:{})}}>
              {label}
              {tab==="users" && <span style={s.tabCount}>{users.length}</span>}
            </button>
          ))}
        </div>

        {/* ── USERS TAB ── */}
        {activeTab === "users" && (
          <div>
            <div style={s.sectionHeader}>
              <div>
                <h2 style={s.sectionTitle}>Team Members</h2>
                <p style={{fontSize:"13px", color:"#666", marginTop:"2px"}}>Add workers, team leads, and architects directly. Customers join via invite link.</p>
              </div>
              <button onClick={() => { setShowAddUser(!showAddUser); setCredentials(null); setUserMsg(""); }} style={s.primaryBtn}>
                {showAddUser ? "Cancel" : "+ Add User"}
              </button>
            </div>

            {/* Add user form */}
            {showAddUser && (
              <div style={s.formCard}>
                <h3 style={s.formCardTitle}>Create New User</h3>
                <p style={{fontSize:"13px", color:"#666", marginBottom:"16px"}}>
                  Set credentials below. After creation a credentials card appears — copy and share with the user.
                </p>
                <form onSubmit={handleCreateUser} style={s.formGrid}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Full name</label>
                    <input style={s.input} value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name:e.target.value})} placeholder="John Smith" required/>
                  </div>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Phone number</label>
                    <input style={s.input} value={newUser.phone} onChange={e => setNewUser({...newUser, phone:e.target.value})} placeholder="9999999999" required/>
                  </div>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Email <span style={{color:"#999", fontWeight:"400"}}>(optional)</span></label>
                    <input style={s.input} type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email:e.target.value})} placeholder="john@example.com"/>
                  </div>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Password</label>
                    <input style={s.input} type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password:e.target.value})} placeholder="Set a password" required/>
                  </div>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Role</label>
                    <select style={s.input} value={newUser.role} onChange={e => setNewUser({...newUser, role:e.target.value})}>
                      {DIRECT_ROLES.map(r => (
                        <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{display:"flex", alignItems:"flex-end"}}>
                    <button type="submit" style={{...s.primaryBtn, width:"100%", padding:"12px"}}>Create User</button>
                  </div>
                </form>
                {userMsg && !userMsg.startsWith("✓") && (
                  <div style={{...s.msgBox, ...s.msgError, marginTop:"12px"}}>{userMsg}</div>
                )}
              </div>
            )}

            {/* Credentials card */}
            {credentials && (
              <div style={s.credCard}>
                <div style={s.credHeader}>
                  <div style={s.credSuccess}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#057642"/>
                      <path d="M7 12L10 15L17 8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{fontSize:"14px", fontWeight:"700", color:"#057642"}}>{credentials.full_name} has been added!</span>
                  </div>
                  <button onClick={() => setCredentials(null)} style={s.credClose}>✕</button>
                </div>
                <p style={{fontSize:"13px", color:"#666", marginBottom:"16px"}}>
                  Share these credentials with <strong>{credentials.full_name}</strong>. Password won't be visible again after closing this.
                </p>
                <div style={s.credGrid}>
                  <div style={s.credItem}>
                    <span style={s.credLabel}>Name</span>
                    <span style={s.credValue}>{credentials.full_name}</span>
                  </div>
                  <div style={s.credItem}>
                    <span style={s.credLabel}>Role</span>
                    <span style={{fontSize:"12px", fontWeight:"600", padding:"3px 10px", borderRadius:"12px", backgroundColor:ROLE_CONFIG[credentials.role]?.bg, border:`1px solid ${ROLE_CONFIG[credentials.role]?.border}`, color:ROLE_CONFIG[credentials.role]?.color}}>
                      {ROLE_CONFIG[credentials.role]?.label}
                    </span>
                  </div>
                  <div style={s.credItem}>
                    <span style={s.credLabel}>Phone (login ID)</span>
                    <span style={{...s.credValue, fontFamily:"monospace", fontSize:"16px", letterSpacing:"1px"}}>{credentials.phone}</span>
                  </div>
                  <div style={s.credItem}>
                    <span style={s.credLabel}>Password</span>
                    <span style={{...s.credValue, fontFamily:"monospace", fontSize:"16px", letterSpacing:"1px", color:"#0A66C2"}}>{credentials.password}</span>
                  </div>
                </div>
                <div style={{display:"flex", gap:"12px", marginTop:"16px", alignItems:"center"}}>
                  <button onClick={handleCopyCredentials} style={{...s.primaryBtn, display:"flex", alignItems:"center", gap:"6px"}}>
                    {credCopied ? "✓ Copied!" : "📋 Copy credentials"}
                  </button>
                  <p style={{fontSize:"12px", color:"#999"}}>Paste into WhatsApp, SMS, or email to share</p>
                </div>
              </div>
            )}

            {/* Role filter pills */}
            <div style={s.filterRow}>
              {[["all","All"], ["admin","Admin"], ["team_lead","Team Leaders"], ["worker","Workers"], ["architect","Architects"], ["customer","Customers"]].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setRoleFilter(val)}
                  style={{...s.filterPill, ...(roleFilter===val ? s.filterPillActive : {})}}
                >
                  {label}
                  <span style={{fontSize:"11px", marginLeft:"4px", opacity:0.7}}>
                    {val === "all" ? users.length : users.filter(u => u.role === val).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Users table */}
            {usersLoading ? (
              <div style={s.loading}>Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div style={s.emptyState}>No {roleFilter === "all" ? "" : ROLE_CONFIG[roleFilter]?.label + " "}users found.</div>
            ) : (
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr style={s.thead}>
                      <th style={s.th}>Name</th>
                      <th style={s.th}>Phone</th>
                      <th style={s.th}>Email</th>
                      <th style={s.th}>Role</th>
                      <th style={s.th}>Status</th>
                      <th style={s.th}>Joined</th>
                      <th style={s.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, i) => {
                      const rc = ROLE_CONFIG[u.role] || ROLE_CONFIG.worker;
                      return (
                        <tr key={u.id} style={{...s.tr, ...(i%2===0?{}:s.trAlt)}}>
                          <td style={s.td}>
                            <div style={s.userCell}>
                              <div style={{...s.userAvatar, backgroundColor:rc.bg, color:rc.color, border:`1px solid ${rc.border}`}}>
                                {u.full_name.charAt(0).toUpperCase()}
                              </div>
                              <span style={s.userName}>{u.full_name}</span>
                            </div>
                          </td>
                          <td style={s.td}>{u.phone}</td>
                          <td style={s.td}>{u.email || "—"}</td>
                          <td style={s.td}>
                            <span style={{fontSize:"12px", fontWeight:"600", padding:"3px 10px", borderRadius:"12px", backgroundColor:rc.bg, border:`1px solid ${rc.border}`, color:rc.color}}>
                              {rc.label}
                            </span>
                          </td>
                          <td style={s.td}>
                            <span style={{fontSize:"12px", fontWeight:"600", padding:"3px 10px", borderRadius:"12px", backgroundColor:u.is_active?"#F0FAF5":"#FFF0F0", border:`1px solid ${u.is_active?"#B8DFC9":"#FFCCCC"}`, color:u.is_active?"#057642":"#CC1016"}}>
                              {u.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td style={s.td}>{new Date(u.created_at).toLocaleDateString("en-IN", {day:"numeric", month:"short", year:"numeric"})}</td>
                          <td style={s.td}>
                            <div style={{display:"flex", gap:"8px"}}>
                              {u.role !== "admin" && (
                                <button onClick={() => handleToggleActive(u.id, u.is_active)} style={{...s.actionBtn, ...(u.is_active?s.actionBtnWarn:s.actionBtnSuccess)}}>
                                  {u.is_active ? "Deactivate" : "Activate"}
                                </button>
                              )}
                              {u.role !== "admin" && (
                                <button onClick={() => handleDeleteUser(u.id, u.full_name)} style={{...s.actionBtn, ...s.actionBtnDanger}}>
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── INVITES TAB ── */}
        {activeTab === "invites" && (
          <div>
            <div style={s.sectionHeader}>
              <div>
                <h2 style={s.sectionTitle}>Customer Invites</h2>
                <p style={{fontSize:"13px", color:"#666", marginTop:"2px"}}>
                  Generate a signup link for a customer. Once they sign up, their info appears in the Users tab under Customers.
                </p>
              </div>
            </div>

            <div style={s.formCard}>
              <h3 style={s.formCardTitle}>Generate Customer Invite Link</h3>
              <p style={{fontSize:"13px", color:"#666", marginBottom:"20px"}}>
                Enter the customer's name for your reference, then generate a link.
                The link expires in <strong>48 hours</strong> and is <strong>single-use</strong>.
                Once the customer signs up, their full details will appear in the <strong>Users → Customers</strong> filter.
              </p>

              <div style={{display:"flex", gap:"12px", alignItems:"flex-end", flexWrap:"wrap"}}>
                <div style={{...s.fieldGroup, flex:1, minWidth:"200px"}}>
                  <label style={s.label}>Customer name <span style={{color:"#CC1016"}}>*</span></label>
                  <input
                    style={s.input}
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Smith Family"
                  />
                </div>
                <div style={{...s.fieldGroup, flex:"none"}}>
                  <label style={s.label}>Role</label>
                  <div style={{...s.input, backgroundColor:"#F8F7F4", color:"#666", cursor:"default", display:"flex", alignItems:"center", width:"140px"}}>
                    <span style={{fontSize:"12px", fontWeight:"600", padding:"3px 10px", borderRadius:"12px", backgroundColor:ROLE_CONFIG.customer.bg, border:`1px solid ${ROLE_CONFIG.customer.border}`, color:ROLE_CONFIG.customer.color}}>
                      Customer
                    </span>
                  </div>
                </div>
                <button onClick={handleGenerateInvite} style={{...s.primaryBtn, padding:"12px 28px"}}>
                  Generate Link
                </button>
              </div>

              {generatedLink && (
                <div style={{marginTop:"20px"}}>
                  <label style={s.label}>
                    Invite link for <span style={{color:"#0A66C2", fontWeight:"700"}}>{inviteForName}</span>
                  </label>
                  <div style={{display:"flex", gap:"8px", marginTop:"6px"}}>
                    <input readOnly value={generatedLink} style={{...s.input, flex:1, color:"#0A66C2", backgroundColor:"#EEF3FB", cursor:"text"}}/>
                    <button onClick={handleCopy} style={{...s.primaryBtn, padding:"12px 20px", minWidth:"90px"}}>
                      {copied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                  <div style={{...s.msgBox, ...s.msgSuccess, marginTop:"10px"}}>
                    📧 Send this to <strong>{inviteForName}</strong> via email or WhatsApp. Once they sign up, go to <strong>Users → Customers</strong> to see their full profile.
                  </div>
                </div>
              )}

              {inviteMsg && <div style={{...s.msgBox, ...s.msgError, marginTop:"12px"}}>{inviteMsg}</div>}
            </div>

            {/* Tip box */}
            <div style={{backgroundColor:"#EEF3FB", border:"1px solid #C0D7F5", borderRadius:"8px", padding:"16px 18px", display:"flex", alignItems:"flex-start", gap:"12px"}}>
              <span style={{fontSize:"20px", flexShrink:0}}>💡</span>
              <div>
                <p style={{fontSize:"13px", fontWeight:"600", color:"#0A66C2", marginBottom:"4px"}}>How to check if a customer has signed up</p>
                <p style={{fontSize:"13px", color:"#555", lineHeight:"1.6"}}>
                  Go to the <strong>Users tab</strong> and click the <strong>Customers</strong> filter. Once a customer uses the invite link and creates their account, their name, phone, and email will appear there.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── PROJECTS TAB ── */}
        {activeTab === "projects" && (
          <div>
            <div style={s.sectionHeader}>
              <h2 style={s.sectionTitle}>Projects</h2>
              <button onClick={() => setShowAddProject(!showAddProject)} style={s.primaryBtn}>
                {showAddProject ? "Cancel" : "+ New Project"}
              </button>
            </div>

            {showAddProject && (
              <div style={s.formCard}>
                <h3 style={s.formCardTitle}>Create New Project</h3>
                <form onSubmit={handleCreateProject} style={s.formGrid}>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Project name</label>
                    <input style={s.input} value={newProject.name} onChange={e => setNewProject({...newProject, name:e.target.value})} placeholder="Smith Residence" required/>
                  </div>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Description <span style={{color:"#999", fontWeight:"400"}}>(optional)</span></label>
                    <input style={s.input} value={newProject.description} onChange={e => setNewProject({...newProject, description:e.target.value})} placeholder="3BHK residential project"/>
                  </div>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Start date</label>
                    <input style={s.input} type="date" value={newProject.start_date} onChange={e => setNewProject({...newProject, start_date:e.target.value})}/>
                  </div>
                  <div style={s.fieldGroup}>
                    <label style={s.label}>End date</label>
                    <input style={s.input} type="date" value={newProject.end_date} onChange={e => setNewProject({...newProject, end_date:e.target.value})}/>
                  </div>
                  <div style={{gridColumn:"1/-1"}}>
                    <button type="submit" style={{...s.primaryBtn, padding:"12px 32px"}}>Create Project</button>
                  </div>
                </form>
              </div>
            )}

            {projectMsg && (
              <div style={{...s.msgBox, ...(projectMsg.startsWith("✓")?s.msgSuccess:s.msgError)}}>
                {projectMsg}
              </div>
            )}

            {projectsLoading ? (
              <div style={s.loading}>Loading projects...</div>
            ) : projects.length === 0 ? (
              <div style={s.emptyState}>No projects yet. Create your first project above.</div>
            ) : (
              <div style={s.projectsGrid}>
                {projects.map(p => (
                  <div key={p.id} style={s.projectCard}>
                    <div style={s.projectCardHeader}>
                      <h3 style={s.projectCardName}>{p.name}</h3>
                      <span style={{fontSize:"12px", fontWeight:"600", padding:"3px 10px", borderRadius:"12px",
                        backgroundColor:p.status==="completed"?"#F0FAF5":p.status==="in_progress"?"#EEF3FB":p.status==="on_hold"?"#FFF0F0":"#F3F2EF",
                        color:p.status==="completed"?"#057642":p.status==="in_progress"?"#0A66C2":p.status==="on_hold"?"#CC1016":"#666",
                        border:`1px solid ${p.status==="completed"?"#B8DFC9":p.status==="in_progress"?"#C0D7F5":p.status==="on_hold"?"#FFCCCC":"#D0CFC9"}`,
                      }}>
                        {p.status.replace("_"," ").replace(/\b\w/g,l=>l.toUpperCase())}
                      </span>
                    </div>
                    <div style={{marginTop:"12px"}}>
                      <div style={{display:"flex", justifyContent:"space-between", marginBottom:"6px"}}>
                        <span style={{fontSize:"12px", color:"#666"}}>Overall progress</span>
                        <span style={{fontSize:"12px", fontWeight:"600", color:"#0A66C2"}}>{p.overall_progress}%</span>
                      </div>
                      <div style={{height:"6px", backgroundColor:"#E0DFDC", borderRadius:"3px"}}>
                        <div style={{height:"100%", width:`${p.overall_progress}%`, backgroundColor:"#0A66C2", borderRadius:"3px", transition:"width 0.3s"}}/>
                      </div>
                    </div>
                    <div style={{display:"flex", justifyContent:"space-between", marginTop:"12px"}}>
                      <span style={{fontSize:"12px", color:"#666"}}>{p.section_count} sections</span>
                      {p.start_date && <span style={{fontSize:"12px", color:"#666"}}>Started {p.start_date}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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
  .logout-hover:hover { background: #F3F2EF !important; color: #CC1016 !important; }
  * { box-sizing: border-box; }
  table { border-collapse: collapse; }
`;

const s = {
  root:         { minHeight:"100vh", backgroundColor:"#F3F2EF", fontFamily:"'Inter', sans-serif", display:"flex", flexDirection:"column" },
  navbar:       { backgroundColor:"#FFFFFF", borderBottom:"1px solid #E0DFDC", position:"sticky", top:0, zIndex:100 },
  navInner:     { maxWidth:"1200px", margin:"0 auto", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  navLogo:      { display:"flex", alignItems:"center", gap:"8px" },
  navBrand:     { fontSize:"20px", fontWeight:"700", color:"#0A66C2", letterSpacing:"-0.3px" },
  navRight:     { display:"flex", alignItems:"center", gap:"12px" },
  navName:      { fontSize:"14px", fontWeight:"600", color:"#333" },
  roleBadge:    { fontSize:"12px", fontWeight:"600", padding:"4px 10px", borderRadius:"12px" },
  logoutBtn:    { padding:"8px 18px", backgroundColor:"transparent", color:"#666", border:"1px solid #C9C5C0", borderRadius:"24px", fontSize:"14px", fontWeight:"600", cursor:"pointer", fontFamily:"'Inter', sans-serif", transition:"all 0.15s" },
  main:         { flex:1, maxWidth:"1200px", margin:"0 auto", padding:"32px 24px", width:"100%" },
  pageHeader:   { marginBottom:"24px" },
  pageTitle:    { fontSize:"26px", fontWeight:"700", color:"#000000E6", marginBottom:"4px" },
  pageSub:      { fontSize:"14px", color:"#666" },
  tabs:         { display:"flex", gap:"4px", borderBottom:"2px solid #E0DFDC", marginBottom:"24px" },
  tab:          { padding:"10px 20px", fontSize:"14px", fontWeight:"600", color:"#666", background:"none", border:"none", cursor:"pointer", borderBottom:"2px solid transparent", marginBottom:"-2px", display:"flex", alignItems:"center", gap:"6px", transition:"all 0.15s", fontFamily:"'Inter', sans-serif" },
  tabActive:    { color:"#0A66C2", borderBottomColor:"#0A66C2" },
  tabCount:     { fontSize:"11px", backgroundColor:"#EEF3FB", color:"#0A66C2", padding:"1px 6px", borderRadius:"10px", fontWeight:"700" },
  sectionHeader:{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"16px", gap:"16px" },
  sectionTitle: { fontSize:"18px", fontWeight:"700", color:"#000000E6" },
  primaryBtn:   { padding:"10px 20px", backgroundColor:"#0A66C2", color:"#FFFFFF", border:"none", borderRadius:"24px", fontSize:"14px", fontWeight:"600", cursor:"pointer", fontFamily:"'Inter', sans-serif", transition:"background 0.15s", whiteSpace:"nowrap" },
  formCard:     { backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)", padding:"20px", marginBottom:"16px" },
  formCardTitle:{ fontSize:"15px", fontWeight:"700", color:"#000000E6", marginBottom:"8px" },
  formGrid:     { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" },
  fieldGroup:   { display:"flex", flexDirection:"column", gap:"6px" },
  label:        { fontSize:"12px", fontWeight:"600", color:"#333" },
  input:        { padding:"10px 12px", fontSize:"14px", border:"1.5px solid #C9C5C0", borderRadius:"6px", outline:"none", fontFamily:"'Inter', sans-serif", color:"#000000E6", backgroundColor:"#FFFFFF", transition:"border-color 0.15s" },
  msgBox:       { padding:"10px 14px", borderRadius:"6px", fontSize:"13px", marginBottom:"12px" },
  msgSuccess:   { backgroundColor:"#F0FAF5", border:"1px solid #B8DFC9", color:"#057642" },
  msgError:     { backgroundColor:"#FFF0F0", border:"1px solid #FFCCCC", color:"#CC1016" },
  credCard:     { backgroundColor:"#F0FAF5", border:"2px solid #B8DFC9", borderRadius:"10px", padding:"20px", marginBottom:"16px" },
  credHeader:   { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"12px" },
  credSuccess:  { display:"flex", alignItems:"center", gap:"8px" },
  credClose:    { background:"none", border:"none", fontSize:"16px", cursor:"pointer", color:"#666", padding:"4px 8px" },
  credGrid:     { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", backgroundColor:"#FFFFFF", borderRadius:"8px", padding:"16px", border:"1px solid #B8DFC9" },
  credItem:     { display:"flex", flexDirection:"column", gap:"4px" },
  credLabel:    { fontSize:"11px", fontWeight:"600", color:"#999", textTransform:"uppercase", letterSpacing:"0.5px" },
  credValue:    { fontSize:"15px", fontWeight:"600", color:"#000000E6", display:"flex", alignItems:"center" },
  filterRow:    { display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap" },
  filterPill:   { padding:"6px 14px", borderRadius:"20px", fontSize:"13px", fontWeight:"600", cursor:"pointer", border:"1.5px solid #C9C5C0", backgroundColor:"#FFFFFF", color:"#666", fontFamily:"'Inter', sans-serif", transition:"all 0.15s" },
  filterPillActive: { backgroundColor:"#0A66C2", borderColor:"#0A66C2", color:"#FFFFFF" },
  tableWrap:    { backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)", overflow:"hidden" },
  table:        { width:"100%", fontSize:"14px" },
  thead:        { backgroundColor:"#F8F7F4" },
  th:           { padding:"12px 16px", textAlign:"left", fontSize:"12px", fontWeight:"600", color:"#666", textTransform:"uppercase", letterSpacing:"0.5px" },
  tr:           { borderBottom:"1px solid #F3F2EF" },
  trAlt:        { backgroundColor:"#FAFAF8" },
  td:           { padding:"12px 16px", color:"#333", verticalAlign:"middle" },
  userCell:     { display:"flex", alignItems:"center", gap:"10px" },
  userAvatar:   { width:"32px", height:"32px", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:"700", flexShrink:0 },
  userName:     { fontWeight:"600", color:"#000000E6" },
  actionBtn:    { padding:"5px 12px", borderRadius:"16px", fontSize:"12px", fontWeight:"600", cursor:"pointer", border:"1px solid", fontFamily:"'Inter', sans-serif", transition:"all 0.15s" },
  actionBtnWarn:    { backgroundColor:"#FFF8E6", borderColor:"#F0C98A", color:"#7A3E00" },
  actionBtnSuccess: { backgroundColor:"#F0FAF5", borderColor:"#B8DFC9", color:"#057642" },
  actionBtnDanger:  { backgroundColor:"#FFF0F0", borderColor:"#FFCCCC", color:"#CC1016" },
  loading:      { padding:"40px", textAlign:"center", color:"#666", fontSize:"14px" },
  emptyState:   { padding:"40px", textAlign:"center", color:"#999", fontSize:"14px", backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)" },
  projectsGrid: { display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px" },
  projectCard:  { backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08)", padding:"20px" },
  projectCardHeader: { display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"8px" },
  projectCardName:   { fontSize:"15px", fontWeight:"700", color:"#000000E6" },
  footer:       { borderTop:"1px solid #E0DFDC", backgroundColor:"#FFFFFF", padding:"16px 24px", display:"flex", flexWrap:"wrap", gap:"16px", justifyContent:"center", marginTop:"auto" },
  footerItem:   { fontSize:"12px", color:"#666", cursor:"pointer" },
};