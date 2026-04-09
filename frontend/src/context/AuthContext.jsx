// import { createContext, useContext, useState, useEffect } from "react";
// import { getMe } from "../api/auth";

// // ─────────────────────────────────────────
// // Create the context object
// // This is the "container" that holds auth state
// // Any component that calls useAuth() gets access to everything inside
// // ─────────────────────────────────────────
// const AuthContext = createContext(null);


// // ─────────────────────────────────────────
// // AuthProvider — wraps your entire app
// // Place this in main.jsx around <App />
// // ─────────────────────────────────────────
// export function AuthProvider({ children }) {

//   const [user, setUser]       = useState(null);    // full user object from /auth/me
//   const [loading, setLoading] = useState(true);    // true while checking existing session


//   // ── On first load, check if a token already exists in localStorage ──
//   // This is what keeps users logged in after a page refresh
//   // Without this, every refresh would kick users back to /login
//   useEffect(() => {
//     const token = localStorage.getItem("access_token");

//     if (token) {
//       // Token exists — verify it's still valid by hitting /auth/me
//       getMe()
//         .then((userData) => setUser(userData))
//         .catch(() => {
//           // Token is expired or invalid — clean it up
//           localStorage.removeItem("access_token");
//           setUser(null);
//         })
//         .finally(() => setLoading(false));
//     } else {
//       // No token at all — user is definitely not logged in
//       setLoading(false);
//     }
//   }, []); // empty array = runs once on mount only


//   // ── Called by Login page after successful POST /auth/login ──
//   // Saves the JWT, then fetches and stores the full user profile
//   const login = async (token) => {
//     localStorage.setItem("access_token", token);
//     const userData = await getMe();
//     setUser(userData);
//   };


//   // ── Called by Navbar logout button ──
//   // Wipes token and user state — redirects handled by ProtectedRoute
//   const logout = () => {
//     localStorage.removeItem("access_token");
//     setUser(null);
//   };


//   // Everything exposed to the rest of the app
//   const value = {
//     user,           // { id, full_name, phone, email, role, created_at }
//     loading,        // true while session is being verified on first load
//     login,          // fn(token) → saves token, fetches user
//     logout,         // fn() → clears everything
//     isAuthenticated: !!user,          // quick boolean check
//     isAdmin:     user?.role === "admin",
//     isTeamLead:  user?.role === "team_lead",
//     isWorker:    user?.role === "worker",
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }


// // ─────────────────────────────────────────
// // useAuth — the hook every component uses
// // Usage: const { user, login, logout, isAdmin } = useAuth();
// // ─────────────────────────────────────────
// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used inside <AuthProvider>");
//   }
//   return context;
// }

import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load — check if token exists and is still valid
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      getMe()
        .then((userData) => {
          // Check if account is still active
          if (userData.is_active === false) {
            localStorage.removeItem("access_token");
            setUser(null);
          } else {
            setUser(userData);
          }
        })
        .catch(() => {
          localStorage.removeItem("access_token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Called by Login page after successful login
  const login = async (token) => {
    localStorage.setItem("access_token", token);
    const userData = await getMe();

    // Block deactivated accounts
    if (userData.is_active === false) {
      localStorage.removeItem("access_token");
      throw new Error("Your account has been deactivated. Contact your admin.");
    }

    setUser(userData);
  };

  // Called by logout button
  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin:         user?.role === "admin",
    isTeamLead:      user?.role === "team_lead",
    isWorker:        user?.role === "worker",
    isCustomer:      user?.role === "customer",
    isArchitect:     user?.role === "architect",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}