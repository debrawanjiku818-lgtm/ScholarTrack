"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Enrollment { id: number; student_name: string; course_name: string; grade: string; status: string; submitted_at: string; completed_modules: number; total_modules: number; }
interface Stats { totalStudents: number; totalEnrollments: number; completionPercentage: number; studentsLoggedIn: number; }

export default function Staff() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "enrollments">("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== "STAFF") { router.push("/dashboard"); return; }
    }
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      setError("");
      const headers = { Authorization: `Bearer ${token}` };
      const [enrollRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/enrollments/all`, { headers }),
        fetch(`${API_URL}/admin/stats`, { headers }),
      ]);

      if (!enrollRes.ok || !statsRes.ok) {
        if (enrollRes.status === 401 || statsRes.status === 401) {
          localStorage.clear();
          router.push("/login");
          return;
        }
      }

      if (enrollRes.ok) {
        const data = await enrollRes.json();
        setEnrollments(Array.isArray(data) ? data : []);
      }
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGrade = async (enrollmentId: number, grade: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/enrollments/${enrollmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ grade }),
      });
      if (res.ok) {
        const userStr = localStorage.getItem("user");
        if (userStr) fetchData(localStorage.getItem("token")!);
      }
    } catch {}
  };

  if (loading) return <div className="page-loading">Loading staff panel...</div>;

  return (
    <div className="staff-page">
      <div className="staff-header"><h1>Staff Dashboard</h1></div>
      {error && <div className="error-message">{error}</div>}
      <div className="admin-tabs">
        <button className={activeTab === "overview" ? "tab-active" : "tab"} onClick={() => setActiveTab("overview")}>Overview</button>
        <button className={activeTab === "enrollments" ? "tab-active" : "tab"} onClick={() => setActiveTab("enrollments")}>Student Enrollments</button>
      </div>
      {activeTab === "overview" && (
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-icon from-blue-500">👨‍🎓</div><div className="stat-content"><h3>{stats?.totalStudents || 0}</h3><p>Total Students</p></div></div>
          <div className="stat-card"><div className="stat-icon from-blue-500">🔑</div><div className="stat-content"><h3>{stats?.studentsLoggedIn || 0}</h3><p>Students Logged In</p></div></div>
          <div className="stat-card"><div className="stat-icon from-orange-500">📚</div><div className="stat-content"><h3>{stats?.totalEnrollments || 0}</h3><p>Total Enrollments</p></div></div>
          <div className="stat-card"><div className="stat-icon from-green-500">✅</div><div className="stat-content"><h3>{stats?.completionPercentage || 0}%</h3><p>Completion Rate</p></div></div>
        </div>
      )}
      {activeTab === "enrollments" && (
        <div className="card">
          <h2>Student Enrollments</h2>
          {enrollments.length === 0 ? (
            <div className="empty-state"><p>No enrollments yet</p></div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Student</th><th>Course</th><th>Grade</th><th>Status</th><th>Progress</th><th>Actions</th></tr></thead>
                <tbody>{enrollments.map((e) => (<tr key={e.id}><td>{e.student_name}</td><td>{e.course_name}</td><td>{e.grade || "Not graded"}</td><td><span className={`status-badge ${e.status?.toLowerCase().replace(" ", "-") || "pending"}`}>{e.status || "Pending"}</span></td><td>{e.completed_modules || 0}/{e.total_modules || 5} modules</td><td><select className="form-select" value={e.grade || ""} onChange={(ev) => handleUpdateGrade(e.id, ev.target.value)}><option value="">Set Grade</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option><option value="F">F</option></select></td></tr>))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
