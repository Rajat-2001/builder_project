// // // import { useState } from "react";
// // // import { useNavigate } from "react-router-dom";
// // // import { useAuth } from "../context/AuthContext";
// // // import { loginUser } from "../api/auth";

// // // export default function Login() {
// // //   const navigate  = useNavigate();
// // //   const { login } = useAuth();

// // //   // Form state
// // //   const [phone,    setPhone]    = useState("");
// // //   const [password, setPassword] = useState("");

// // //   // UI state
// // //   const [error,    setError]    = useState("");
// // //   const [loading,  setLoading]  = useState(false);

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();          // stop page from refreshing
// // //     setError("");
// // //     setLoading(true);

// // //     try {
// // //       // Step 1 — hit POST /auth/login
// // //       const data = await loginUser({ phone, password });

// // //       // Step 2 — save token + fetch user profile via AuthContext
// // //       await login(data.access_token);

// // //       // Step 3 — redirect to dashboard
// // //       navigate("/dashboard");

// // //     } catch (err) {
// // //       setError(err.message);     // shows FastAPI's error detail directly
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
// // //       <div className="w-full max-w-md">

// // //         {/* Logo / App name */}
// // //         <div className="text-center mb-8">
// // //           <h1 className="text-3xl font-bold text-white tracking-tight">
// // //             Builder
// // //           </h1>
// // //           <p className="text-slate-400 mt-2 text-sm">
// // //             Site management — sign in to continue
// // //           </p>
// // //         </div>

// // //         {/* Card */}
// // //         <div className="bg-[#1E293B] rounded-2xl p-8 shadow-xl">

// // //           <h2 className="text-xl font-semibold text-white mb-6">
// // //             Sign in
// // //           </h2>

// // //           <form onSubmit={handleSubmit} className="space-y-5">

// // //             {/* Phone */}
// // //             <div>
// // //               <label className="block text-sm font-medium text-slate-300 mb-1.5">
// // //                 Phone number
// // //               </label>
// // //               <input
// // //                 type="tel"
// // //                 value={phone}
// // //                 onChange={(e) => setPhone(e.target.value)}
// // //                 placeholder="9999999999"
// // //                 required
// // //                 className="
// // //                   w-full px-4 py-3 rounded-xl
// // //                   bg-[#0F172A] border border-slate-700
// // //                   text-white placeholder-slate-500
// // //                   focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400
// // //                   transition
// // //                 "
// // //               />
// // //             </div>

// // //             {/* Password */}
// // //             <div>
// // //               <label className="block text-sm font-medium text-slate-300 mb-1.5">
// // //                 Password
// // //               </label>
// // //               <input
// // //                 type="password"
// // //                 value={password}
// // //                 onChange={(e) => setPassword(e.target.value)}
// // //                 placeholder="••••••••"
// // //                 required
// // //                 className="
// // //                   w-full px-4 py-3 rounded-xl
// // //                   bg-[#0F172A] border border-slate-700
// // //                   text-white placeholder-slate-500
// // //                   focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400
// // //                   transition
// // //                 "
// // //               />
// // //             </div>

// // //             {/* Error message */}
// // //             {error && (
// // //               <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
// // //                 <p className="text-red-400 text-sm">{error}</p>
// // //               </div>
// // //             )}

// // //             {/* Submit */}
// // //             <button
// // //               type="submit"
// // //               disabled={loading}
// // //               className="
// // //                 w-full py-3 rounded-xl font-semibold text-sm
// // //                 bg-amber-400 hover:bg-amber-300 text-slate-900
// // //                 disabled:opacity-50 disabled:cursor-not-allowed
// // //                 transition duration-150
// // //               "
// // //             >
// // //               {loading ? "Signing in..." : "Sign in"}
// // //             </button>

// // //           </form>
// // //         </div>

// // //         {/* Footer note */}
// // //         <p className="text-center text-slate-500 text-xs mt-6">
// // //           No account? Contact your site admin for an invite link.
// // //         </p>

// // //       </div>
// // //     </div>
// // //   );
// // // }

// // import { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { useAuth } from "../context/AuthContext";
// // import { loginUser } from "../api/auth";

// // export default function Login() {
// //   const navigate  = useNavigate();
// //   const { login } = useAuth();

// //   const [phone,    setPhone]    = useState("");
// //   const [password, setPassword] = useState("");
// //   const [error,    setError]    = useState("");
// //   const [loading,  setLoading]  = useState(false);
// //   const [focused,  setFocused]  = useState("");

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setError("");
// //     setLoading(true);
// //     try {
// //       const data = await loginUser({ phone, password });
// //       await login(data.access_token);
// //       navigate("/dashboard");
// //     } catch (err) {
// //       setError(err.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div style={styles.root}>
// //       <div style={styles.gridOverlay} />

// //       {/* Left panel — branding */}
// //       <div style={styles.leftPanel}>
// //         <div style={styles.leftInner}>
// //           <div style={styles.logoRow}>
// //             <div style={styles.logoIcon}>
// //               <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
// //                 <path d="M3 21L3 8L12 3L21 8V21" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round"/>
// //                 <path d="M9 21V14H15V21" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round"/>
// //                 <path d="M3 12H21" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2 2"/>
// //               </svg>
// //             </div>
// //             <span style={styles.logoText}>BUILDER</span>
// //           </div>

// //           <div style={styles.taglineBlock}>
// //             <h1 style={styles.headline}>Site management<br />built for the field.</h1>
// //             <p style={styles.subline}>Track teams, attendance, and projects — from ground level to completion.</p>
// //           </div>

// //           <div style={styles.statsRow}>
// //             {[["3", "Role levels"], ["48h", "Invite expiry"], ["JWT", "Secured"]].map(([val, label]) => (
// //               <div key={label} style={styles.statBox}>
// //                 <span style={styles.statVal}>{val}</span>
// //                 <span style={styles.statLabel}>{label}</span>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </div>

// //       {/* Right panel — form */}
// //       <div style={styles.rightPanel}>
// //         <div style={styles.formCard}>
// //           <div style={styles.formHeader}>
// //             <h2 style={styles.formTitle}>Sign in</h2>
// //             <p style={styles.formSub}>Enter your credentials to continue</p>
// //           </div>

// //           <form onSubmit={handleSubmit} style={styles.form}>
// //             <div style={styles.fieldGroup}>
// //               <label style={styles.label}>Phone number</label>
// //               <div style={{ ...styles.inputWrap, ...(focused === "phone" ? styles.inputWrapFocused : {}) }}>
// //                 <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
// //                   <path d="M6.6 10.8C7.8 13.2 9.8 15.2 12.2 16.4L14 14.6C14.2 14.4 14.6 14.4 14.8 14.5C15.8 14.9 16.9 15.1 18 15.1C18.6 15.1 19 15.5 19 16.1V19C19 19.6 18.6 20 18 20C9.2 20 2 12.8 2 4C2 3.4 2.4 3 3 3H6C6.6 3 7 3.4 7 4C7 5.1 7.2 6.2 7.6 7.2C7.7 7.5 7.6 7.8 7.4 8L5.6 9.8C6 10.2 6.3 10.5 6.6 10.8Z" fill="currentColor"/>
// //                 </svg>
// //                 <input
// //                   type="tel"
// //                   value={phone}
// //                   onChange={(e) => setPhone(e.target.value)}
// //                   onFocus={() => setFocused("phone")}
// //                   onBlur={() => setFocused("")}
// //                   placeholder="9999999999"
// //                   required
// //                   style={styles.input}
// //                 />
// //               </div>
// //             </div>

// //             <div style={styles.fieldGroup}>
// //               <label style={styles.label}>Password</label>
// //               <div style={{ ...styles.inputWrap, ...(focused === "password" ? styles.inputWrapFocused : {}) }}>
// //                 <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none">
// //                   <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
// //                   <path d="M7 11V7C7 4.8 8.8 3 11 3H13C15.2 3 17 4.8 17 7V11" stroke="currentColor" strokeWidth="2"/>
// //                 </svg>
// //                 <input
// //                   type="password"
// //                   value={password}
// //                   onChange={(e) => setPassword(e.target.value)}
// //                   onFocus={() => setFocused("password")}
// //                   onBlur={() => setFocused("")}
// //                   placeholder="••••••••"
// //                   required
// //                   style={styles.input}
// //                 />
// //               </div>
// //             </div>

// //             {error && (
// //               <div style={styles.errorBox}>
// //                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
// //                   <circle cx="12" cy="12" r="10" stroke="#F87171" strokeWidth="2"/>
// //                   <path d="M12 8V12M12 16H12.01" stroke="#F87171" strokeWidth="2" strokeLinecap="round"/>
// //                 </svg>
// //                 <span style={styles.errorText}>{error}</span>
// //               </div>
// //             )}

// //             <button type="submit" disabled={loading} style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {}) }}>
// //               {loading ? (
// //                 <span style={styles.loadingRow}>
// //                   <span style={styles.spinner} />
// //                   Signing in...
// //                 </span>
// //               ) : "Sign in →"}
// //             </button>
// //           </form>

// //           <p style={styles.footerNote}>No account? Contact your site admin for an invite.</p>
// //         </div>
// //       </div>

// //       <style>{`
// //         @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700&display=swap');
// //         @keyframes spin { to { transform: rotate(360deg); } }
// //         @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
// //         input::placeholder { color: #334155; }
// //         button:hover:not(:disabled) { background: #FBBF24 !important; transform: translateY(-1px); }
// //       `}</style>
// //     </div>
// //   );
// // }

// // const styles = {
// //   root: { minHeight:"100vh", display:"flex", backgroundColor:"#080E1A", fontFamily:"'Barlow', sans-serif", position:"relative", overflow:"hidden" },
// //   gridOverlay: { position:"absolute", inset:0, backgroundImage:`linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)`, backgroundSize:"40px 40px", pointerEvents:"none" },
// //   leftPanel: { flex:"1", display:"flex", alignItems:"center", justifyContent:"center", padding:"60px", borderRight:"1px solid rgba(245,158,11,0.1)" },
// //   leftInner: { maxWidth:"420px", width:"100%" },
// //   logoRow: { display:"flex", alignItems:"center", gap:"10px", marginBottom:"64px" },
// //   logoIcon: { width:"40px", height:"40px", borderRadius:"8px", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", display:"flex", alignItems:"center", justifyContent:"center" },
// //   logoText: { fontFamily:"'Barlow Condensed', sans-serif", fontSize:"20px", fontWeight:"700", letterSpacing:"4px", color:"#F59E0B" },
// //   taglineBlock: { marginBottom:"48px" },
// //   headline: { fontFamily:"'Barlow Condensed', sans-serif", fontSize:"42px", fontWeight:"700", color:"#F1F5F9", lineHeight:"1.15", marginBottom:"16px", letterSpacing:"-0.5px" },
// //   subline: { fontSize:"15px", color:"#64748B", lineHeight:"1.6" },
// //   statsRow: { display:"flex", gap:"16px" },
// //   statBox: { display:"flex", flexDirection:"column", gap:"4px", padding:"16px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"10px", flex:1 },
// //   statVal: { fontFamily:"'Barlow Condensed', sans-serif", fontSize:"22px", fontWeight:"700", color:"#F59E0B", letterSpacing:"1px" },
// //   statLabel: { fontSize:"11px", color:"#475569", textTransform:"uppercase", letterSpacing:"0.5px" },
// //   rightPanel: { width:"480px", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px" },
// //   formCard: { width:"100%", background:"rgba(15,23,42,0.8)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"40px", animation:"fadeUp 0.4s ease forwards" },
// //   formHeader: { marginBottom:"32px" },
// //   formTitle: { fontFamily:"'Barlow Condensed', sans-serif", fontSize:"28px", fontWeight:"700", color:"#F1F5F9", marginBottom:"6px", letterSpacing:"0.5px" },
// //   formSub: { fontSize:"13px", color:"#475569" },
// //   form: { display:"flex", flexDirection:"column", gap:"20px" },
// //   fieldGroup: { display:"flex", flexDirection:"column", gap:"8px" },
// //   label: { fontSize:"11px", fontWeight:"600", color:"#64748B", textTransform:"uppercase", letterSpacing:"0.8px" },
// //   inputWrap: { display:"flex", alignItems:"center", gap:"10px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", padding:"0 16px", transition:"border-color 0.2s, box-shadow 0.2s" },
// //   inputWrapFocused: { borderColor:"rgba(245,158,11,0.5)", boxShadow:"0 0 0 3px rgba(245,158,11,0.08)" },
// //   inputIcon: { color:"#475569", flexShrink:0 },
// //   input: { flex:1, background:"transparent", border:"none", outline:"none", padding:"14px 0", fontSize:"15px", color:"#F1F5F9", fontFamily:"'Barlow', sans-serif" },
// //   errorBox: { display:"flex", alignItems:"center", gap:"8px", background:"rgba(248,113,113,0.06)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:"8px", padding:"10px 14px" },
// //   errorText: { fontSize:"13px", color:"#F87171" },
// //   submitBtn: { width:"100%", padding:"15px", background:"#F59E0B", color:"#0F172A", border:"none", borderRadius:"10px", fontSize:"15px", fontWeight:"700", fontFamily:"'Barlow', sans-serif", cursor:"pointer", letterSpacing:"0.5px", transition:"background 0.2s, transform 0.1s", marginTop:"4px" },
// //   submitBtnDisabled: { opacity:0.6, cursor:"not-allowed" },
// //   loadingRow: { display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" },
// //   spinner: { width:"14px", height:"14px", border:"2px solid rgba(15,23,42,0.3)", borderTop:"2px solid #0F172A", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" },
// //   footerNote: { marginTop:"24px", fontSize:"12px", color:"#334155", textAlign:"center" },
// // };

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { loginUser } from "../api/auth";

// export default function Login() {
//   const navigate  = useNavigate();
//   const { login } = useAuth();

//   const [phone,    setPhone]    = useState("");
//   const [password, setPassword] = useState("");
//   const [error,    setError]    = useState("");
//   const [loading,  setLoading]  = useState(false);
//   const [focused,  setFocused]  = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       const data = await loginUser({ phone, password });
//       await login(data.access_token);
//       navigate("/dashboard");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={s.root}>
//       <style>{css}</style>

//       {/* Top nav bar */}
//       <div style={s.navbar}>
//         <div style={s.navInner}>
//           <div style={s.navLogo}>
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//               <path d="M3 21V8L12 3L21 8V21" stroke="#0A66C2" strokeWidth="2.5" strokeLinejoin="round"/>
//               <path d="M9 21V14H15V21" stroke="#0A66C2" strokeWidth="2.5" strokeLinejoin="round"/>
//             </svg>
//             <span style={s.navBrand}>Builder</span>
//           </div>
//           <span style={s.navTagline}>Construction Site Management</span>
//         </div>
//       </div>

//       {/* Main content */}
//       <div style={s.main}>

//         {/* Left — hero text */}
//         <div style={s.hero}>
//           <h1 style={s.heroTitle}>Manage your construction sites with confidence.</h1>
//           <p style={s.heroSub}>Track teams, attendance, and projects — built for the field.</p>

//           <div style={s.featureList}>
//             {[
//               ["👷", "Role-based access for every team member"],
//               ["📋", "Real-time attendance tracking"],
//               ["🔐", "Invite-only, secure onboarding"],
//               ["📊", "Project and team management"],
//             ].map(([icon, text]) => (
//               <div key={text} style={s.featureRow}>
//                 <span style={s.featureIcon}>{icon}</span>
//                 <span style={s.featureText}>{text}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Right — login card */}
//         <div style={s.cardWrap}>
//           <div style={s.card} className="card-anim">

//             <h2 style={s.cardTitle}>Sign in</h2>
//             <p style={s.cardSub}>Stay updated on your construction projects</p>

//             <form onSubmit={handleSubmit} style={s.form}>

//               <div style={s.fieldGroup}>
//                 <label style={s.label}>Phone number</label>
//                 <input
//                   type="tel"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   onFocus={() => setFocused("phone")}
//                   onBlur={() => setFocused("")}
//                   placeholder="9999999999"
//                   required
//                   style={{
//                     ...s.input,
//                     ...(focused === "phone" ? s.inputFocused : {})
//                   }}
//                 />
//               </div>

//               <div style={s.fieldGroup}>
//                 <label style={s.label}>Password</label>
//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   onFocus={() => setFocused("password")}
//                   onBlur={() => setFocused("")}
//                   placeholder="••••••••"
//                   required
//                   style={{
//                     ...s.input,
//                     ...(focused === "password" ? s.inputFocused : {})
//                   }}
//                 />
//               </div>

//               {error && (
//                 <div style={s.errorBox}>
//                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
//                     <circle cx="12" cy="12" r="10" stroke="#CC1016" strokeWidth="2"/>
//                     <path d="M12 8V12M12 16H12.01" stroke="#CC1016" strokeWidth="2" strokeLinecap="round"/>
//                   </svg>
//                   <span style={s.errorText}>{error}</span>
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={loading}
//                 style={{...s.btn, ...(loading ? s.btnDisabled : {})}}
//                 className="btn-hover"
//               >
//                 {loading ? (
//                   <span style={s.loadRow}>
//                     <span style={s.spinner} /> Signing in...
//                   </span>
//                 ) : "Sign in"}
//               </button>

//             </form>

//             <div style={s.divider}>
//               <div style={s.dividerLine} />
//               <span style={s.dividerText}>or</span>
//               <div style={s.dividerLine} />
//             </div>

//             <p style={s.joinNote}>
//               New to Builder?{" "}
//               <span style={s.joinLink}>Contact your admin for an invite link.</span>
//             </p>

//           </div>

//           {/* Below card note */}
//           <p style={s.belowCard}>
//             By signing in, you agree to Builder's{" "}
//             <span style={s.blueText}>Terms of Service</span> and{" "}
//             <span style={s.blueText}>Privacy Policy</span>.
//           </p>
//         </div>

//       </div>

//       {/* Footer */}
//       <div style={s.footer}>
//         {["About", "Help Center", "Privacy", "Terms", "© 2025 Builder"].map((item) => (
//           <span key={item} style={s.footerItem}>{item}</span>
//         ))}
//       </div>

//     </div>
//   );
// }

// const css = `
//   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
//   @keyframes spin { to { transform: rotate(360deg); } }
//   @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
//   .card-anim { animation: fadeUp 0.35s ease forwards; }
//   .btn-hover:hover:not(:disabled) { background: #004182 !important; }
//   input::placeholder { color: #999; font-size: 14px; }
//   * { box-sizing: border-box; }
// `;

// const s = {
//   root: { minHeight:"100vh", backgroundColor:"#F3F2EF", fontFamily:"'Inter', sans-serif", display:"flex", flexDirection:"column" },
//   navbar: { backgroundColor:"#FFFFFF", borderBottom:"1px solid #E0DFDC", position:"sticky", top:0, zIndex:100 },
//   navInner: { maxWidth:"1128px", margin:"0 auto", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" },
//   navLogo: { display:"flex", alignItems:"center", gap:"8px" },
//   navBrand: { fontSize:"20px", fontWeight:"700", color:"#0A66C2", letterSpacing:"-0.3px" },
//   navTagline: { fontSize:"13px", color:"#666", display:"flex", alignItems:"center" },
//   main: { flex:1, maxWidth:"1128px", margin:"0 auto", padding:"48px 24px", display:"flex", alignItems:"center", gap:"80px", width:"100%" },
//   hero: { flex:1, maxWidth:"500px" },
//   heroTitle: { fontSize:"32px", fontWeight:"700", color:"#000000E6", lineHeight:"1.25", marginBottom:"16px", letterSpacing:"-0.5px" },
//   heroSub: { fontSize:"16px", color:"#666", lineHeight:"1.6", marginBottom:"32px" },
//   featureList: { display:"flex", flexDirection:"column", gap:"16px" },
//   featureRow: { display:"flex", alignItems:"center", gap:"12px" },
//   featureIcon: { fontSize:"20px", width:"32px", textAlign:"center" },
//   featureText: { fontSize:"15px", color:"#333", fontWeight:"500" },
//   cardWrap: { width:"400px", flexShrink:0 },
//   card: { backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)", padding:"32px" },
//   cardTitle: { fontSize:"22px", fontWeight:"700", color:"#000000E6", marginBottom:"4px" },
//   cardSub: { fontSize:"13px", color:"#666", marginBottom:"24px" },
//   form: { display:"flex", flexDirection:"column", gap:"16px" },
//   fieldGroup: { display:"flex", flexDirection:"column", gap:"6px" },
//   label: { fontSize:"13px", fontWeight:"600", color:"#333" },
//   input: { width:"100%", padding:"12px 14px", fontSize:"15px", border:"1.5px solid #C9C5C0", borderRadius:"6px", outline:"none", fontFamily:"'Inter', sans-serif", color:"#000000E6", transition:"border-color 0.15s, box-shadow 0.15s", backgroundColor:"#FFFFFF" },
//   inputFocused: { borderColor:"#0A66C2", boxShadow:"0 0 0 2px rgba(10,102,194,0.15)" },
//   errorBox: { display:"flex", alignItems:"center", gap:"8px", backgroundColor:"#FFF0F0", border:"1px solid #FFCCCC", borderRadius:"6px", padding:"10px 12px" },
//   errorText: { fontSize:"13px", color:"#CC1016" },
//   btn: { width:"100%", padding:"14px", backgroundColor:"#0A66C2", color:"#FFFFFF", border:"none", borderRadius:"24px", fontSize:"16px", fontWeight:"600", fontFamily:"'Inter', sans-serif", cursor:"pointer", transition:"background 0.2s", marginTop:"4px" },
//   btnDisabled: { opacity:0.6, cursor:"not-allowed" },
//   loadRow: { display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" },
//   spinner: { width:"14px", height:"14px", border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #FFF", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" },
//   divider: { display:"flex", alignItems:"center", gap:"8px", margin:"20px 0" },
//   dividerLine: { flex:1, height:"1px", backgroundColor:"#E0DFDC" },
//   dividerText: { fontSize:"13px", color:"#999", whiteSpace:"nowrap" },
//   joinNote: { fontSize:"14px", color:"#333", textAlign:"center", lineHeight:"1.5" },
//   joinLink: { color:"#0A66C2", fontWeight:"600", cursor:"pointer" },
//   belowCard: { fontSize:"12px", color:"#999", textAlign:"center", marginTop:"16px", lineHeight:"1.6", padding:"0 8px" },
//   blueText: { color:"#0A66C2", cursor:"pointer" },
//   footer: { borderTop:"1px solid #E0DFDC", backgroundColor:"#FFFFFF", padding:"16px 24px", display:"flex", flexWrap:"wrap", gap:"16px", justifyContent:"center" },
//   footerItem: { fontSize:"12px", color:"#666", cursor:"pointer" },
// };


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/auth";

export default function Login() {
  const navigate  = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState("");

  // If already logged in redirect to dashboard immediately
  // If already logged in redirect to dashboard immediately
useEffect(() => {
  if (isAuthenticated && user) {
    switch (user.role) {
      case "admin":      navigate("/admin",      { replace: true }); break;
      case "team_lead":  navigate("/team",       { replace: true }); break;
      case "worker":     navigate("/worker",     { replace: true }); break;
      case "customer":   navigate("/customer",   { replace: true }); break;
      case "architect":  navigate("/architect",  { replace: true }); break;
      case "supervisor": navigate("/supervisor", { replace: true }); break;
    }
  }
}, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginUser({ phone, password });
      await login(data.access_token);
      // Navigate to /dashboard — RoleRedirect handles where to go
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          <span style={s.navTagline}>Construction Site Management</span>
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>

        {/* Left — hero */}
        <div style={s.hero}>
          <h1 style={s.heroTitle}>Manage your construction sites with confidence.</h1>
          <p style={s.heroSub}>Track teams, attendance, and projects — built for the field.</p>

          <div style={s.featureList}>
            {[
              ["👷", "Role-based access for every team member"],
              ["⏱️", "Real-time clock in / clock out tracking"],
              ["📊", "Project progress for customers"],
              ["🔐", "Invite-only, secure onboarding"],
            ].map(([icon, text]) => (
              <div key={text} style={s.featureRow}>
                <span style={s.featureIcon}>{icon}</span>
                <span style={s.featureText}>{text}</span>
              </div>
            ))}
          </div>

          {/* Role badges preview */}
          <div style={s.rolesPreview}>
            {[
              { label:"Administrator", color:"#0A66C2", bg:"#EEF3FB", border:"#C0D7F5" },
              { label:"Team Leader",   color:"#057642", bg:"#F0FAF5", border:"#B8DFC9" },
              { label:"Worker",        color:"#7A3E00", bg:"#FDF3E7", border:"#F0C98A" },
              { label:"Customer",      color:"#B24020", bg:"#FDF0EC", border:"#F5C2B0" },
            ].map(r => (
              <span key={r.label} style={{fontSize:"12px", fontWeight:"600", padding:"4px 10px", borderRadius:"12px", backgroundColor:r.bg, border:`1px solid ${r.border}`, color:r.color}}>
                {r.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right — form card */}
        <div style={s.cardWrap}>
          <div style={s.card}>
            <h2 style={s.cardTitle}>Sign in</h2>
            <p style={s.cardSub}>Stay updated on your construction projects</p>

            <form onSubmit={handleSubmit} style={s.form}>

              <div style={s.fieldGroup}>
                <label style={s.label}>Phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={() => setFocused("phone")}
                  onBlur={() => setFocused("")}
                  placeholder="9999999999"
                  required
                  style={{...s.input, ...(focused === "phone" ? s.inputFocused : {})}}
                />
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  placeholder="••••••••"
                  required
                  style={{...s.input, ...(focused === "password" ? s.inputFocused : {})}}
                />
              </div>

              {error && (
                <div style={s.errorBox}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
                    <circle cx="12" cy="12" r="10" stroke="#CC1016" strokeWidth="2"/>
                    <path d="M12 8V12M12 16H12.01" stroke="#CC1016" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span style={s.errorText}>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{...s.btn, ...(loading ? s.btnDisabled : {})}}
                className="btn-hover"
              >
                {loading ? (
                  <span style={s.loadRow}>
                    <span style={s.spinner}/> Signing in...
                  </span>
                ) : "Sign in"}
              </button>

            </form>

            <div style={s.divider}>
              <div style={s.dividerLine}/>
              <span style={s.dividerText}>or</span>
              <div style={s.dividerLine}/>
            </div>

            <p style={s.joinNote}>
              New to Builder?{" "}
              <span style={s.joinLink}>Contact your admin for an invite link.</span>
            </p>
          </div>

          <p style={s.belowCard}>
            By signing in you agree to Builder's{" "}
            <span style={s.blueText}>Terms of Service</span> and{" "}
            <span style={s.blueText}>Privacy Policy</span>.
          </p>
        </div>
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
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .btn-hover:hover:not(:disabled) { background: #004182 !important; }
  input::placeholder { color: #999; font-size: 14px; }
  * { box-sizing: border-box; }
`;

const s = {
  root:       { minHeight:"100vh", backgroundColor:"#F3F2EF", fontFamily:"'Inter', sans-serif", display:"flex", flexDirection:"column" },
  navbar:     { backgroundColor:"#FFFFFF", borderBottom:"1px solid #E0DFDC", position:"sticky", top:0, zIndex:100 },
  navInner:   { maxWidth:"1128px", margin:"0 auto", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  navLogo:    { display:"flex", alignItems:"center", gap:"8px" },
  navBrand:   { fontSize:"20px", fontWeight:"700", color:"#0A66C2", letterSpacing:"-0.3px" },
  navTagline: { fontSize:"13px", color:"#666" },
  main:       { flex:1, maxWidth:"1128px", margin:"0 auto", padding:"48px 24px", display:"flex", alignItems:"center", gap:"80px", width:"100%" },
  hero:       { flex:1, maxWidth:"500px" },
  heroTitle:  { fontSize:"32px", fontWeight:"700", color:"#000000E6", lineHeight:"1.25", marginBottom:"16px", letterSpacing:"-0.5px" },
  heroSub:    { fontSize:"16px", color:"#666", lineHeight:"1.6", marginBottom:"32px" },
  featureList:{ display:"flex", flexDirection:"column", gap:"16px", marginBottom:"28px" },
  featureRow: { display:"flex", alignItems:"center", gap:"12px" },
  featureIcon:{ fontSize:"20px", width:"32px", textAlign:"center" },
  featureText:{ fontSize:"15px", color:"#333", fontWeight:"500" },
  rolesPreview:{ display:"flex", flexWrap:"wrap", gap:"8px" },
  cardWrap:   { width:"400px", flexShrink:0 },
  card:       { backgroundColor:"#FFFFFF", borderRadius:"8px", boxShadow:"0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.06)", padding:"32px", animation:"fadeUp 0.35s ease forwards" },
  cardTitle:  { fontSize:"22px", fontWeight:"700", color:"#000000E6", marginBottom:"4px" },
  cardSub:    { fontSize:"13px", color:"#666", marginBottom:"24px" },
  form:       { display:"flex", flexDirection:"column", gap:"16px" },
  fieldGroup: { display:"flex", flexDirection:"column", gap:"6px" },
  label:      { fontSize:"13px", fontWeight:"600", color:"#333" },
  input:      { width:"100%", padding:"12px 14px", fontSize:"15px", border:"1.5px solid #C9C5C0", borderRadius:"6px", outline:"none", fontFamily:"'Inter', sans-serif", color:"#000000E6", transition:"border-color 0.15s, box-shadow 0.15s", backgroundColor:"#FFFFFF" },
  inputFocused:{ borderColor:"#0A66C2", boxShadow:"0 0 0 2px rgba(10,102,194,0.15)" },
  errorBox:   { display:"flex", alignItems:"center", gap:"8px", backgroundColor:"#FFF0F0", border:"1px solid #FFCCCC", borderRadius:"6px", padding:"10px 12px" },
  errorText:  { fontSize:"13px", color:"#CC1016" },
  btn:        { width:"100%", padding:"14px", backgroundColor:"#0A66C2", color:"#FFFFFF", border:"none", borderRadius:"24px", fontSize:"16px", fontWeight:"600", fontFamily:"'Inter', sans-serif", cursor:"pointer", transition:"background 0.2s", marginTop:"4px" },
  btnDisabled:{ opacity:0.6, cursor:"not-allowed" },
  loadRow:    { display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" },
  spinner:    { width:"14px", height:"14px", border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #FFF", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" },
  divider:    { display:"flex", alignItems:"center", gap:"8px", margin:"20px 0" },
  dividerLine:{ flex:1, height:"1px", backgroundColor:"#E0DFDC" },
  dividerText:{ fontSize:"13px", color:"#999" },
  joinNote:   { fontSize:"14px", color:"#333", textAlign:"center", lineHeight:"1.5" },
  joinLink:   { color:"#0A66C2", fontWeight:"600", cursor:"pointer" },
  belowCard:  { fontSize:"12px", color:"#999", textAlign:"center", marginTop:"16px", lineHeight:"1.6", padding:"0 8px" },
  blueText:   { color:"#0A66C2", cursor:"pointer" },
  footer:     { borderTop:"1px solid #E0DFDC", backgroundColor:"#FFFFFF", padding:"16px 24px", display:"flex", flexWrap:"wrap", gap:"16px", justifyContent:"center" },
  footerItem: { fontSize:"12px", color:"#666", cursor:"pointer" },
};