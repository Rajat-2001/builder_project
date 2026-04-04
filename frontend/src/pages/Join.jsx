// import { useState, useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { validateInvite, register } from "../api/auth";

// // Role badge colors — each role gets a distinct amber/slate/blue tone
// const ROLE_STYLES = {
//   admin:     "bg-amber-400/20 text-amber-300 border border-amber-400/30",
//   team_lead: "bg-blue-400/20  text-blue-300  border border-blue-400/30",
//   worker:    "bg-slate-400/20 text-slate-300 border border-slate-400/30",
// };

// const ROLE_LABELS = {
//   admin:     "Admin",
//   team_lead: "Team Lead",
//   worker:    "Worker",
// };

// export default function Join() {
//   const navigate                     = useNavigate();
//   const [searchParams]               = useSearchParams();
//   const token                        = searchParams.get("token");

//   // Token validation state
//   const [tokenStatus, setTokenStatus] = useState("checking"); // "checking" | "valid" | "invalid"
//   const [tokenMessage, setTokenMessage] = useState("");
//   const [role, setRole]               = useState(null);

//   // Form state
//   const [fullName,  setFullName]  = useState("");
//   const [phone,     setPhone]     = useState("");
//   const [password,  setPassword]  = useState("");
//   const [email,     setEmail]     = useState("");

//   // UI state
//   const [error,   setError]   = useState("");
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);


//   // ── Validate token the moment the page loads ──
//   useEffect(() => {
//     // No token in URL at all → invalid immediately
//     if (!token) {
//       setTokenStatus("invalid");
//       setTokenMessage("No invite token found. Please use the full invite link.");
//       return;
//     }

//     validateInvite(token)
//       .then((data) => {
//         if (data.valid) {
//           setRole(data.role);
//           setTokenStatus("valid");
//         } else {
//           setTokenStatus("invalid");
//           setTokenMessage(data.message || "This invite is invalid.");
//         }
//       })
//       .catch(() => {
//         setTokenStatus("invalid");
//         setTokenMessage("Could not verify invite. Please try again.");
//       });
//   }, [token]);


//   // ── Handle signup form submission ──
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       await register({
//         token,
//         full_name: fullName,
//         phone,
//         password,
//         email: email || undefined,   // don't send empty string — send nothing
//       });

//       setSuccess(true);

//       // Redirect to login after 2 seconds
//       setTimeout(() => navigate("/login"), 2000);

//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };


//   // ── Checking state — shown while validateInvite is in flight ──
//   if (tokenStatus === "checking") {
//     return (
//       <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
//         <p className="text-slate-400 text-sm animate-pulse">
//           Verifying your invite link...
//         </p>
//       </div>
//     );
//   }


//   // ── Invalid token — full error page, no form shown ──
//   if (tokenStatus === "invalid") {
//     return (
//       <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
//         <div className="w-full max-w-md text-center">
//           <div className="bg-[#1E293B] rounded-2xl p-10 shadow-xl">
//             <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
//               <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                   d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
//               </svg>
//             </div>
//             <h2 className="text-xl font-semibold text-white mb-2">
//               Invalid Invite
//             </h2>
//             <p className="text-slate-400 text-sm mb-6">
//               {tokenMessage}
//             </p>
//             <button
//               onClick={() => navigate("/login")}
//               className="text-amber-400 text-sm hover:text-amber-300 transition"
//             >
//               Back to login
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }


//   // ── Success state — shown after successful registration ──
//   if (success) {
//     return (
//       <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
//         <div className="w-full max-w-md text-center">
//           <div className="bg-[#1E293B] rounded-2xl p-10 shadow-xl">
//             <div className="w-14 h-14 rounded-full bg-amber-400/10 flex items-center justify-center mx-auto mb-5">
//               <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                   d="M5 13l4 4L19 7" />
//               </svg>
//             </div>
//             <h2 className="text-xl font-semibold text-white mb-2">
//               Account created!
//             </h2>
//             <p className="text-slate-400 text-sm">
//               Redirecting you to login...
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }


//   // ── Valid token — show the signup form ──
//   return (
//     <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 py-10">
//       <div className="w-full max-w-md">

//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-white tracking-tight">
//             Builder
//           </h1>
//           <p className="text-slate-400 mt-2 text-sm">
//             You've been invited to join
//           </p>
//         </div>

//         {/* Card */}
//         <div className="bg-[#1E293B] rounded-2xl p-8 shadow-xl">

//           {/* Role badge — read only, set by admin */}
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-xl font-semibold text-white">
//               Create account
//             </h2>
//             <span className={`text-xs font-medium px-3 py-1 rounded-full ${ROLE_STYLES[role]}`}>
//               {ROLE_LABELS[role]}
//             </span>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-5">

//             {/* Full name */}
//             <div>
//               <label className="block text-sm font-medium text-slate-300 mb-1.5">
//                 Full name
//               </label>
//               <input
//                 type="text"
//                 value={fullName}
//                 onChange={(e) => setFullName(e.target.value)}
//                 placeholder="John Smith"
//                 required
//                 className="
//                   w-full px-4 py-3 rounded-xl
//                   bg-[#0F172A] border border-slate-700
//                   text-white placeholder-slate-500
//                   focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400
//                   transition
//                 "
//               />
//             </div>

//             {/* Phone */}
//             <div>
//               <label className="block text-sm font-medium text-slate-300 mb-1.5">
//                 Phone number
//               </label>
//               <input
//                 type="tel"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 placeholder="9999999999"
//                 required
//                 className="
//                   w-full px-4 py-3 rounded-xl
//                   bg-[#0F172A] border border-slate-700
//                   text-white placeholder-slate-500
//                   focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400
//                   transition
//                 "
//               />
//             </div>

//             {/* Email — optional */}
//             <div>
//               <label className="block text-sm font-medium text-slate-300 mb-1.5">
//                 Email
//                 <span className="text-slate-500 font-normal ml-1">(optional)</span>
//               </label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="john@example.com"
//                 className="
//                   w-full px-4 py-3 rounded-xl
//                   bg-[#0F172A] border border-slate-700
//                   text-white placeholder-slate-500
//                   focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400
//                   transition
//                 "
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <label className="block text-sm font-medium text-slate-300 mb-1.5">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="••••••••"
//                 required
//                 className="
//                   w-full px-4 py-3 rounded-xl
//                   bg-[#0F172A] border border-slate-700
//                   text-white placeholder-slate-500
//                   focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400
//                   transition
//                 "
//               />
//             </div>

//             {/* Error */}
//             {error && (
//               <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
//                 <p className="text-red-400 text-sm">{error}</p>
//               </div>
//             )}

//             {/* Submit */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="
//                 w-full py-3 rounded-xl font-semibold text-sm
//                 bg-amber-400 hover:bg-amber-300 text-slate-900
//                 disabled:opacity-50 disabled:cursor-not-allowed
//                 transition duration-150
//               "
//             >
//               {loading ? "Creating account..." : "Create account"}
//             </button>

//           </form>
//         </div>

//         <p className="text-center text-slate-500 text-xs mt-6">
//           Already have an account?{" "}
//           <button
//             onClick={() => navigate("/login")}
//             className="text-amber-400 hover:text-amber-300 transition"
//           >
//             Sign in
//           </button>
//         </p>

//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { validateInvite, register } from "../api/auth";

const ROLE_CONFIG = {
  admin:     { label:"Admin",     color:"#F59E0B", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.25)" },
  team_lead: { label:"Team Lead", color:"#60A5FA", bg:"rgba(96,165,250,0.1)",  border:"rgba(96,165,250,0.25)" },
  worker:    { label:"Worker",    color:"#34D399", bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.25)" },
};

export default function Join() {
  const navigate             = useNavigate();
  const [searchParams]       = useSearchParams();
  const token                = searchParams.get("token");

  const [tokenStatus,   setTokenStatus]   = useState("checking");
  const [tokenMessage,  setTokenMessage]  = useState("");
  const [role,          setRole]          = useState(null);
  const [fullName,      setFullName]      = useState("");
  const [phone,         setPhone]         = useState("");
  const [password,      setPassword]      = useState("");
  const [email,         setEmail]         = useState("");
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [success,       setSuccess]       = useState(false);
  const [focused,       setFocused]       = useState("");

  useEffect(() => {
    if (!token) {
      setTokenStatus("invalid");
      setTokenMessage("No invite token found. Please use the full invite link.");
      return;
    }
    validateInvite(token)
      .then((data) => {
        if (data.valid) { setRole(data.role); setTokenStatus("valid"); }
        else { setTokenStatus("invalid"); setTokenMessage(data.message || "This invite is invalid."); }
      })
      .catch(() => { setTokenStatus("invalid"); setTokenMessage("Could not verify invite. Please try again."); });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ token, full_name: fullName, phone, password, email: email || undefined });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700&display=swap');
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    input::placeholder { color: #334155; }
    button:hover:not(:disabled) { background: #FBBF24 !important; transform: translateY(-1px); }
  `;

  if (tokenStatus === "checking") return (
    <div style={{...styles.root, alignItems:"center", justifyContent:"center"}}>
      <style>{sharedStyles}</style>
      <div style={styles.gridOverlay} />
      <div style={{textAlign:"center"}}>
        <div style={styles.logoRow2}>
          <div style={styles.logoIcon}><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 21L3 8L12 3L21 8V21" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round"/><path d="M9 21V14H15V21" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round"/></svg></div>
          <span style={styles.logoText}>BUILDER</span>
        </div>
        <p style={{color:"#475569", fontSize:"14px", animation:"pulse 1.5s ease infinite"}}>Verifying your invite link...</p>
      </div>
    </div>
  );

  if (tokenStatus === "invalid") return (
    <div style={{...styles.root, alignItems:"center", justifyContent:"center"}}>
      <style>{sharedStyles}</style>
      <div style={styles.gridOverlay} />
      <div style={{...styles.card, textAlign:"center", maxWidth:"400px", animation:"fadeUp 0.4s ease forwards"}}>
        <div style={{width:"56px", height:"56px", borderRadius:"50%", background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px"}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#F87171" strokeWidth="2"/><path d="M15 9L9 15M9 9L15 15" stroke="#F87171" strokeWidth="2" strokeLinecap="round"/></svg>
        </div>
        <h2 style={{...styles.cardTitle, marginBottom:"8px"}}>Invalid Invite</h2>
        <p style={{fontSize:"14px", color:"#475569", marginBottom:"28px", lineHeight:"1.6"}}>{tokenMessage}</p>
        <button onClick={() => navigate("/login")} style={{...styles.submitBtn, background:"transparent", border:"1px solid rgba(245,158,11,0.3)", color:"#F59E0B"}}>
          Back to login
        </button>
      </div>
    </div>
  );

  if (success) return (
    <div style={{...styles.root, alignItems:"center", justifyContent:"center"}}>
      <style>{sharedStyles}</style>
      <div style={styles.gridOverlay} />
      <div style={{...styles.card, textAlign:"center", maxWidth:"400px", animation:"fadeUp 0.4s ease forwards"}}>
        <div style={{width:"56px", height:"56px", borderRadius:"50%", background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px"}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 style={{...styles.cardTitle, marginBottom:"8px"}}>Account created!</h2>
        <p style={{fontSize:"14px", color:"#475569"}}>Redirecting you to login...</p>
      </div>
    </div>
  );

  const roleConf = ROLE_CONFIG[role] || ROLE_CONFIG.worker;

  return (
    <div style={{...styles.root, alignItems:"center", justifyContent:"center", padding:"40px 20px"}}>
      <style>{sharedStyles}</style>
      <div style={styles.gridOverlay} />

      <div style={{width:"100%", maxWidth:"480px"}}>
        {/* Header */}
        <div style={{textAlign:"center", marginBottom:"32px", animation:"fadeUp 0.3s ease forwards"}}>
          <div style={styles.logoRow2}>
            <div style={styles.logoIcon}><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 21L3 8L12 3L21 8V21" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round"/><path d="M9 21V14H15V21" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round"/></svg></div>
            <span style={styles.logoText}>BUILDER</span>
          </div>
          <p style={{color:"#475569", fontSize:"14px", marginTop:"8px"}}>You've been invited to join</p>
        </div>

        {/* Card */}
        <div style={{...styles.card, animation:"fadeUp 0.4s ease forwards"}}>
          {/* Role badge */}
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"28px"}}>
            <h2 style={styles.cardTitle}>Create account</h2>
            <span style={{fontSize:"12px", fontWeight:"600", padding:"5px 12px", borderRadius:"20px", background:roleConf.bg, border:`1px solid ${roleConf.border}`, color:roleConf.color, letterSpacing:"0.5px", textTransform:"uppercase"}}>
              {roleConf.label}
            </span>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {[
              { key:"fullName",  label:"Full name",    type:"text",     val:fullName,  set:setFullName,  placeholder:"John Smith",        required:true },
              { key:"phone",     label:"Phone number", type:"tel",      val:phone,     set:setPhone,     placeholder:"9999999999",        required:true },
              { key:"email",     label:"Email",        type:"email",    val:email,     set:setEmail,     placeholder:"john@example.com",  required:false, optional:true },
              { key:"password",  label:"Password",     type:"password", val:password,  set:setPassword,  placeholder:"••••••••",          required:true },
            ].map(({ key, label, type, val, set, placeholder, required, optional }) => (
              <div key={key} style={styles.fieldGroup}>
                <label style={styles.label}>
                  {label}
                  {optional && <span style={{color:"#334155", fontWeight:"400", textTransform:"none", letterSpacing:"0", marginLeft:"4px"}}>(optional)</span>}
                </label>
                <div style={{ ...styles.inputWrap, ...(focused === key ? styles.inputWrapFocused : {}) }}>
                  <input
                    type={type}
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    onFocus={() => setFocused(key)}
                    onBlur={() => setFocused("")}
                    placeholder={placeholder}
                    required={required}
                    style={styles.input}
                  />
                </div>
              </div>
            ))}

            {error && (
              <div style={styles.errorBox}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}><circle cx="12" cy="12" r="10" stroke="#F87171" strokeWidth="2"/><path d="M12 8V12M12 16H12.01" stroke="#F87171" strokeWidth="2" strokeLinecap="round"/></svg>
                <span style={styles.errorText}>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} style={{ ...styles.submitBtn, ...(loading ? {opacity:0.6, cursor:"not-allowed"} : {}) }}>
              {loading ? (
                <span style={{display:"flex", alignItems:"center", justifyContent:"center", gap:"8px"}}>
                  <span style={styles.spinner} /> Creating account...
                </span>
              ) : "Create account →"}
            </button>
          </form>
        </div>

        <p style={{textAlign:"center", fontSize:"12px", color:"#334155", marginTop:"20px"}}>
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} style={{background:"none", border:"none", color:"#F59E0B", cursor:"pointer", fontSize:"12px", fontFamily:"'Barlow', sans-serif"}}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight:"100vh", display:"flex", flexDirection:"column", backgroundColor:"#080E1A", fontFamily:"'Barlow', sans-serif", position:"relative", overflow:"hidden" },
  gridOverlay: { position:"absolute", inset:0, backgroundImage:`linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px),linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)`, backgroundSize:"40px 40px", pointerEvents:"none" },
  logoRow2: { display:"flex", alignItems:"center", gap:"10px", justifyContent:"center", marginBottom:"4px" },
  logoIcon: { width:"36px", height:"36px", borderRadius:"8px", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", display:"flex", alignItems:"center", justifyContent:"center" },
  logoText: { fontFamily:"'Barlow Condensed', sans-serif", fontSize:"18px", fontWeight:"700", letterSpacing:"4px", color:"#F59E0B" },
  card: { background:"rgba(15,23,42,0.8)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"36px" },
  cardTitle: { fontFamily:"'Barlow Condensed', sans-serif", fontSize:"24px", fontWeight:"700", color:"#F1F5F9", letterSpacing:"0.5px" },
  form: { display:"flex", flexDirection:"column", gap:"18px" },
  fieldGroup: { display:"flex", flexDirection:"column", gap:"8px" },
  label: { fontSize:"11px", fontWeight:"600", color:"#64748B", textTransform:"uppercase", letterSpacing:"0.8px" },
  inputWrap: { display:"flex", alignItems:"center", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", padding:"0 16px", transition:"border-color 0.2s, box-shadow 0.2s" },
  inputWrapFocused: { borderColor:"rgba(245,158,11,0.5)", boxShadow:"0 0 0 3px rgba(245,158,11,0.08)" },
  input: { flex:1, background:"transparent", border:"none", outline:"none", padding:"13px 0", fontSize:"14px", color:"#F1F5F9", fontFamily:"'Barlow', sans-serif", width:"100%" },
  errorBox: { display:"flex", alignItems:"center", gap:"8px", background:"rgba(248,113,113,0.06)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:"8px", padding:"10px 14px" },
  errorText: { fontSize:"13px", color:"#F87171" },
  submitBtn: { width:"100%", padding:"14px", background:"#F59E0B", color:"#0F172A", border:"none", borderRadius:"10px", fontSize:"15px", fontWeight:"700", fontFamily:"'Barlow', sans-serif", cursor:"pointer", letterSpacing:"0.5px", transition:"background 0.2s, transform 0.1s", marginTop:"4px" },
  spinner: { width:"14px", height:"14px", border:"2px solid rgba(15,23,42,0.3)", borderTop:"2px solid #0F172A", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" },
};