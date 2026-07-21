"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Stats { totalStudents: number; totalStaff: number; totalEnrollments: number; completedCourses: number; completionPercentage: number; activeCourses: number; }
interface LogEntry { id: number; username: string; role: string; status: string; ipAddress: string; loginTime: string; }
interface Course { id: number; name: string; description: string; is_active: boolean; }

export default function Admin() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "courses">("overview");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");
  const [newCourse, setNewCourse] = useState({ name: "", description: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const allowed = ["ADMIN", "PRINCIPAL", "DEPUTY_PRINCIPAL"];
      if (!allowed.includes(user.role)) { router.push("/dashboard"); return; }
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, logsRes, coursesRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(`${API_URL}/auth/login-history`, { headers }),
        fetch(`${API_URL}/courses`, { headers }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
      if (coursesRes.ok) { const data = await coursesRes.json(); setCourses(data.courses || []); }
    } catch {} finally { setLoading(false); }
  };

  const showNotification = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(""), 3000); };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newCourse),
      });
      if (res.ok) {
        showNotification("Course added successfully!");
        setNewCourse({ name: "", description: "" });
        setShowAddForm(false);
        fetchData();
      } else showNotification("Failed to add course");
    } catch { showNotification("Failed to add course"); }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm("Delete this course?")) return;
    try {
      const res = await fetch(`${API_URL}/courses/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { showNotification("Course removed successfully!"); fetchData(); }
      else showNotification("Failed to remove course");
    } catch { showNotification("Failed to remove course"); }
  };

  if (loading) return <div className="page-loading">Loading admin panel...</div>;

  return (
    <div className="admin-page">
      {notification && <div className="notification-toast">{notification}</div>}
      <div className="admin-header"><h1>Admin Dashboard</h1></div>
      <div className="admin-tabs">
        <button className={activeTab === "overview" ? "tab-active" : "tab"} onClick={() => setActiveTab("overview")}>Overview</button>
        <button className={activeTab === "logs" ? "tab-active" : "tab"} onClick={() => setActiveTab("logs")}>Login Logs</button>
        <button className={activeTab === "courses" ? "tab-active" : "tab"} onClick={() => setActiveTab("courses")}>Manage Courses</button>
      </div>
      {activeTab === "overview" && stats && (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon from-blue-500">👨‍🎓</div><div className="stat-content"><h3>{stats.totalStudents || 0}</h3><p>Total Students</p></div></div>
          <div className="stat-card"><div className="stat-icon from-green-500">👨‍🏫</div><div className="stat-content"><h3>{stats.totalStaff || 0}</h3><p>Total Staff</p></div></div>
          <div className="stat-card"><div className="stat-icon from-orange-500">📚</div><div className="stat-content"><h3>{stats.totalEnrollments || 0}</h3><p>Total Enrollments</p></div></div>
          <div className="stat-card"><div className="stat-icon from-purple-500">✅</div><div className="stat-content"><h3>{stats.completionPercentage || 0}%</h3><p>Completion Rate</p></div></div>
          <div className="stat-card"><div className="stat-icon from-indigo-500">🎓</div><div className="stat-content"><h3>{stats.completedCourses || 0}</h3><p>Courses Completed</p></div></div>
          <div className="stat-card"><div className="stat-icon from-blue-500">📖</div><div className="stat-content"><h3>{stats.activeCourses || 0}</h3><p>Active Courses</p></div></div>
        </div>
      )}
      {activeTab === "logs" && (
        <div className="card logs-card">
          <h2>Login History</h2>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>User</th><th>Role</th><th>Status</th><th>IP Address</th><th>Time</th></tr></thead>
              <tbody>{logs.map((log) => (<tr key={log.id}><td>{log.username}</td><td>{log.role || "N/A"}</td><td><span className={`status-badge ${log.status}`}>{log.status}</span></td><td>{log.ipAddress || "N/A"}</td><td>{new Date(log.loginTime).toLocaleString()}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === "courses" && (
        <div>
          <div className="page-header"><h2>Manage Courses</h2><button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>{showAddForm ? "Cancel" : "Add Course"}</button></div>
          {showAddForm && (
            <div className="card add-course-form">
              <h3>Add New Course</h3>
              <form onSubmit={handleAddCourse}>
                <div className="form-group"><label>Course Name *</label><input type="text" value={newCourse.name} onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })} required /></div>
                <div className="form-group"><label>Description</label><textarea value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} rows={3} className="form-textarea" /></div>
                <button type="submit" className="btn-primary">Add Course</button>
              </form>
            </div>
          )}
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-info"><h3>{course.name}</h3><p>{course.description || "No description"}</p><span className={`status-badge ${course.is_active ? "active" : "inactive"}`}>{course.is_active ? "Active" : "Inactive"}</span></div>
                <button className="btn-danger" onClick={() => handleDeleteCourse(course.id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
