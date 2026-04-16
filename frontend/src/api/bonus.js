const BASE = "http://localhost:8000";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Add bonus hours — admin only
export const addBonusHours = async (data) => {
  const res = await fetch(`${BASE}/bonus/add`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to add bonus hours");
  }
  return res.json();
};

// Get bonus hours for a specific user — admin only
export const getUserBonus = async (userId) => {
  const res = await fetch(`${BASE}/bonus/user/${userId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch user bonus");
  return res.json();
};

// Get my own bonus hours
export const getMyBonus = async () => {
  const res = await fetch(`${BASE}/bonus/mine`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch bonus hours");
  return res.json();
};

// Full hours summary for all users — admin only
export const getFullHoursSummary = async () => {
  const res = await fetch(`${BASE}/bonus/summary/all`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch hours summary");
  return res.json();
};

// Delete a bonus entry — admin only
export const deleteBonusEntry = async (bonusId) => {
  const res = await fetch(`${BASE}/bonus/${bonusId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete bonus entry");
  return res.json();
};