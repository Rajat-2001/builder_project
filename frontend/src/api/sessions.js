const BASE = "http://localhost:8000";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Clock in to a project
export const clockIn = async (projectId) => {
  const res = await fetch(`${BASE}/sessions/clock-in`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ project_id: projectId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to clock in");
  }
  return res.json();
};

// Clock out — pass unit ids worked on
export const clockOut = async (unitIds = []) => {
  const res = await fetch(`${BASE}/sessions/clock-out`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ unit_ids: unitIds }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to clock out");
  }
  return res.json();
};

// Get current session status
export const getSessionStatus = async () => {
  const res = await fetch(`${BASE}/sessions/status`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to get session status");
  return res.json();
};

// Submit work report during or end of shift
export const submitWorkReport = async (unitIds, taskCompletions = []) => {
  const res = await fetch(`${BASE}/sessions/submit-report`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      unit_ids: unitIds,
      task_completions: taskCompletions,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to submit report");
  }
  return res.json();
};

// Get my session history
export const getMyHistory = async () => {
  const res = await fetch(`${BASE}/sessions/my-history`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
};

// Get my hours summary per project
export const getMySummary = async () => {
  const res = await fetch(`${BASE}/sessions/my-summary`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
};

// Team lead — get all reports for a project
export const getTeamReports = async (projectId) => {
  const res = await fetch(`${BASE}/sessions/team-reports/${projectId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch team reports");
  return res.json();
};