// Base URL — change this one line when you deploy to production
const BASE_URL = "http://localhost:8000";


// ─────────────────────────────────────────
// HELPER — attaches JWT to every request
// Reads token from localStorage automatically
// so you never have to pass it manually
// ─────────────────────────────────────────
function authHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}


// ─────────────────────────────────────────
// HELPER — central error handler
// FastAPI returns errors as { detail: "message" }
// This extracts that message so pages can show it directly
// ─────────────────────────────────────────
async function handleResponse(res) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Something went wrong.");
  }
  return res.json();
}


// ─────────────────────────────────────────
// INVITE
// ─────────────────────────────────────────

/**
 * Admin calls this to generate an invite link.
 * POST /auth/invite
 * @param {string} role - "worker" | "team_lead"
 * @returns {{ invite_link, role, expires_at }}
 */
export async function createInvite(role) {
  const res = await fetch(`${BASE_URL}/auth/invite`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ role }),
  });
  return handleResponse(res);
}


/**
 * Called the moment someone lands on /join?token=...
 * Checks if the token is valid before showing the signup form.
 * GET /auth/validate-invite?token=<uuid>
 * @param {string} token - UUID from URL query param
 * @returns {{ valid: bool, role?: string, message?: string }}
 */
export async function validateInvite(token) {
  const res = await fetch(
    `${BASE_URL}/auth/validate-invite?token=${token}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );
  return handleResponse(res);
}


// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

/**
 * Worker submits the signup form.
 * POST /auth/register
 * @param {{ token, full_name, phone, password, email? }} data
 * @returns {{ message: string }}
 */
export async function register(data) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}


/**
 * Any user logs in with phone + password.
 * POST /auth/login
 * @param {{ phone, password }} data
 * @returns {{ access_token: string, token_type: string }}
 */
export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}


/**
 * Fetches the logged-in user's profile.
 * Called by AuthContext on load and after login.
 * GET /auth/me
 * @returns {{ id, full_name, phone, email, role, created_at }}
 */
export async function getMe() {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}