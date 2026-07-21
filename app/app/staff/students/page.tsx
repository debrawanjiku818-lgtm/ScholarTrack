"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Student {
  id: number;
  username: string;
  full_name: string;
  email: string;
  enrollment_count: number;
  completed_count: number;
  is_active: boolean;
}

export default function StaffStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffName, setStaffName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role.toUpperCase() !== "STAFF") {
      router.push("/login");
      return;
    }

    setStaffName(user.username || "");
    fetchStudents(token);
  }, [router]);

  const fetchStudents = async (token: string) => {
    try {
      const response = await fetch("http://localhost:4000/dashboard/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!staffName) {
    return <p>Redirecting to login...</p>;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="user-avatar">
            <span>{staffName?.charAt(0).toUpperCase() || "S"}</span>
          </div>
          <div className="user-info">
            <h3>{staffName}</h3>
            <p>Staff Member</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <a href="/staff" className="nav-item">
            <span>📊</span>
            <span>Dashboard</span>
          </a>
          <a href="/courses" className="nav-item">
            <span>📚</span>
            <span>Courses</span>
          </a>
          <a href="/staff/students" className="nav-item active">
            <span>👨‍🎓</span>
            <span>Students</span>
          </a>
          <a href="/staff/grading" className="nav-item">
            <span>📝</span>
            <span>Grading</span>
          </a>
          <a href="/staff/schedule" className="nav-item">
            <span>📅</span>
            <span>Schedule</span>
          </a>
          <a href="/staff/settings" className="nav-item">
            <span>⚙️</span>
            <span>Settings</span>
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Active Students 👨‍🎓</h1>
            <p>View and manage all active students</p>
          </div>
        </header>

        <div className="card full-width">
          <div className="card-header">
            <h2>👥 All Students</h2>
          </div>
          <div className="status-list">
            {loading ? (
              <p>Loading students...</p>
            ) : students.length > 0 ? (
              students.map((student) => (
                <div key={student.id} className="status-item user-item">
                  <div className="status-label">
                    <span className="user-name">{student.full_name || student.username}</span>
                    <span className="user-email">{student.email}</span>
                    <span className="user-role">{student.enrollment_count} courses enrolled</span>
                    <span className="user-role">{student.completed_count} completed</span>
                  </div>
                  <span className={`status-value ${student.is_active ? 'online' : 'offline'}`}>
                    {student.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))
            ) : (
              <p>No students found</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
