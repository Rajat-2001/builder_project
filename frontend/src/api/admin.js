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


// ─────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────

/**
 * Get all users in the system
 * GET /admin/users
 */
export async function getAllUsers() {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/**
 * Admin creates a user directly
 * POST /admin/users
 * @param {{ full_name, phone, password, role, email? }} data
 */
export async function createUser(data) {
  const res = await fetch(`${BASE_URL}/admin/users`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Activate or deactivate a user
 * PATCH /admin/users/{id}/deactivate
 * @param {string} userId
 * @param {boolean} isActive
 */
export async function toggleUserActive(userId, isActive) {
  const res = await fetch(`${BASE_URL}/admin/users/${userId}/deactivate`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ is_active: isActive }),
  });
  return handleResponse(res);
}

/**
 * Permanently delete a user
 * DELETE /admin/users/{id}
 * @param {string} userId
 */
export async function deleteUser(userId) {
  const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}


// ─────────────────────────────────────────
// INVITE MANAGEMENT
// ─────────────────────────────────────────

/**
 * Generate an invite link
 * POST /admin/invites
 * @param {string} role
 */
export async function createInvite(role) {
  const res = await fetch(`${BASE_URL}/admin/invites`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ role }),
  });
  return handleResponse(res);
}

/**
 * Get all invites
 * GET /admin/invites
 */
export async function getAllInvites() {
  const res = await fetch(`${BASE_URL}/admin/invites`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}


// ─────────────────────────────────────────
// PROJECT MANAGEMENT
// ─────────────────────────────────────────

/**
 * Get all projects
 * GET /admin/projects
 */
export async function getAllProjects() {
  const res = await fetch(`${BASE_URL}/admin/projects`, {
    method: "GET",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

/**
 * Create a new project
 * POST /admin/projects
 */
export async function createProject(data) {
  const res = await fetch(`${BASE_URL}/admin/projects`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Update project details or progress
 * PATCH /admin/projects/{id}
 */
export async function updateProject(projectId, data) {
  const res = await fetch(`${BASE_URL}/admin/projects/${projectId}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Add a section to a project
 * POST /admin/projects/{id}/sections
 */
export async function addSection(projectId, data) {
  const res = await fetch(`${BASE_URL}/admin/projects/${projectId}/sections`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/**
 * Update a section's percentage
 * PATCH /admin/projects/{id}/sections/{sectionId}
 */
export async function updateSection(projectId, sectionId, data) {
  const res = await fetch(
    `${BASE_URL}/admin/projects/${projectId}/sections/${sectionId}`,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(data),
    }
  );
  return handleResponse(res);
}