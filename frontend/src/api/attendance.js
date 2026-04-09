const BASE_URL = "http://localhost:8000";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || "Something went wrong.");
  }
  return res.json();
}


/**
 * Clock in
 * POST /attendance/clock-in
 */
export async function clockIn() {
  const res = await fetch(`${BASE_URL}/attendance/clock-in`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse(res);
}


/**
 * Clock out
 * POST /attendance/clock-out
 */
export async function clockOut() {
  const res = await fetch(`${BASE_URL}/attendance/clock-out`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handleResponse(res);
}


/**
 * Get current clock in status
 * GET /attendance/status
 */
export async function getAttendanceStatus() {
  const res = await fetch(`${BASE_URL}/attendance/status`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}


/**
 * Get own attendance history
 * GET /attendance/history
 */
export async function getAttendanceHistory() {
  const res = await fetch(`${BASE_URL}/attendance/history`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}


/**
 * Get weekly/monthly summary
 * GET /attendance/summary
 */
export async function getAttendanceSummary() {
  const res = await fetch(`${BASE_URL}/attendance/summary`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}


/**
 * Get team attendance for a date
 * GET /attendance/team?date=YYYY-MM-DD
 * @param {string} date - optional, defaults to today on backend
 */
export async function getTeamAttendance(date = null) {
  const url = date
    ? `${BASE_URL}/attendance/team?date=${date}`
    : `${BASE_URL}/attendance/team`;

  const res = await fetch(url, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}


/**
 * Get my projects (customer only)
 * GET /projects/my
 */
export async function getMyProjects() {
  const res = await fetch(`${BASE_URL}/projects/my`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}