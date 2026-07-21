const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const url = `${API_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const authApi = {
  login: (username: string, password: string) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  register: (data: { username: string; password: string; role: string; email?: string; fullName?: string }) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getProfile: () => apiFetch("/auth/profile"),
  getLoginHistory: () => apiFetch("/auth/login-history"),
};

export const coursesApi = {
  getAll: () => apiFetch("/courses"),
  create: (data: { name: string; description?: string; image_url?: string }) =>
    apiFetch("/courses", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch(`/courses/${id}`, { method: "DELETE" }),
};

export const enrollmentsApi = {
  getMyEnrollments: () => apiFetch("/enrollments"),
  enroll: (courseId: number) =>
    apiFetch("/enrollments", { method: "POST", body: JSON.stringify({ course_id: courseId }) }),
  unenroll: (courseId: number) =>
    apiFetch("/enrollments", { method: "DELETE", body: JSON.stringify({ course_id: courseId }) }),
};

export const studentsApi = {
  getAll: () => apiFetch("/students"),
  getOne: (id: number) => apiFetch(`/students/${id}`),
  create: (data: { username: string; password: string; email?: string; fullName?: string }) =>
    apiFetch("/students", { method: "POST", body: JSON.stringify(data) }),
  enroll: (studentId: number, courseId: number) =>
    apiFetch(`/students/${studentId}/enroll`, { method: "POST", body: JSON.stringify({ courseId }) }),
  unenroll: (studentId: number, courseId: number) =>
    apiFetch(`/students/${studentId}/enroll/${courseId}`, { method: "DELETE" }),
  delete: (id: number) => apiFetch(`/students/${id}`, { method: "DELETE" }),
};

export const adminApi = {
  getStats: () => apiFetch("/admin/stats"),
  getUsers: () => apiFetch("/admin/users"),
  getStudents: () => apiFetch("/admin/students"),
  getStaff: () => apiFetch("/admin/staff"),
  createStudent: (data: { username: string; password: string; email?: string; fullName?: string }) =>
    apiFetch("/admin/students", { method: "POST", body: JSON.stringify(data) }),
  createStaff: (data: { username: string; password: string; email?: string; fullName?: string; role: string }) =>
    apiFetch("/admin/staff", { method: "POST", body: JSON.stringify(data) }),
  deleteUser: (id: number) => apiFetch(`/admin/users/${id}`, { method: "DELETE" }),
  deactivateUser: (id: number) => apiFetch(`/admin/users/${id}/deactivate`, { method: "PUT" }),
  activateUser: (id: number) => apiFetch(`/admin/users/${id}/activate`, { method: "PUT" }),
};

export const scheduleApi = {
  getAll: () => apiFetch("/schedule"),
  create: (data: { course: string; type: string; date: string; time: string; location: string }) =>
    apiFetch("/schedule", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: number) => apiFetch(`/schedule/${id}`, { method: "DELETE" }),
};

export const messagesApi = {
  getInbox: () => apiFetch("/messages"),
  getSent: () => apiFetch("/messages/sent"),
  send: (recipientId: number, content: string) =>
    apiFetch("/messages", { method: "POST", body: JSON.stringify({ recipient_id: recipientId, content }) }),
  markRead: (id: number) => apiFetch(`/messages/${id}/read`, { method: "PATCH" }),
};

export default apiFetch;
