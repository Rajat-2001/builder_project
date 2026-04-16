const BASE = "http://localhost:8000";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

// Get all units for a project
export const getUnits = async (projectId) => {
  const res = await fetch(`${BASE}/units/project/${projectId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch units");
  return res.json();
};

// Get single unit with its tasks
export const getUnit = async (unitId) => {
  const res = await fetch(`${BASE}/units/${unitId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch unit");
  return res.json();
};

// Create a single unit
export const createUnit = async (projectId, data) => {
  const res = await fetch(`${BASE}/units/project/${projectId}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create unit");
  return res.json();
};

// Bulk create units
export const bulkCreateUnits = async (projectId, units) => {
  const res = await fetch(`${BASE}/units/project/${projectId}/bulk`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(units),
  });
  if (!res.ok) throw new Error("Failed to bulk create units");
  return res.json();
};

// Update unit status
export const updateUnitStatus = async (unitId, status) => {
  const res = await fetch(`${BASE}/units/${unitId}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update unit status");
  return res.json();
};

// Add custom task to a unit
export const addUnitTask = async (unitId, data) => {
  const res = await fetch(`${BASE}/units/${unitId}/tasks`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add task");
  return res.json();
};

// Delete a custom task
export const deleteUnitTask = async (taskId) => {
  const res = await fetch(`${BASE}/units/tasks/${taskId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete task");
  return res.json();
};

// Update unit notes
export const updateUnitNotes = async (unitId, notes) => {
  const res = await fetch(`${BASE}/units/${unitId}/notes`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) throw new Error("Failed to update notes");
  return res.json();
};