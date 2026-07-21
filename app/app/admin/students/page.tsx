"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminStudents() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userStr);
    const role = user.role.toUpperCase();

    if (
      role !== "ADMIN" &&
      role !== "PRINCIPAL" &&
      role !== "DEPUTY_PRINCIPAL"
    ) {
      router.push("/login");
      return;
    }

    setAdminName(user.username || "");
    fetchUsers(token);
  }, [router]);

  const fetchUsers = async (token: string) => {
    try {
      const response = await fetch("http://localhost:4000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!adminName) {
    return <p>Redirecting to login...</p>;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="user-avatar admin-avatar">
            <span>{adminName?.charAt(0).toUpperCase() || "A"}</span>
          </div>
          <div className="user-info">
            <h3>{adminName}</h3>
            <p>Administrator</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <a href="/admin" className="nav-item">
            <span>📊</span>
            <span>Dashboard</span>
          </a>
          <a href="/courses" className="nav-item">
            <span>📚</span>
            <span>Manage Courses</span>
          </a>
          <a href="/admin/students" className="nav-item active">
            <span>👨‍🎓</span>
            <span>Students</span>
          </a>
          <a href="/admin/schedule" className="nav-item">
            <span>📅</span>
            <span>Schedule</span>
          </a>
          <a href="/admin/settings" className="nav-item">
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
            <h1>Manage Students 👨‍🎓</h1>
            <p>View and manage all students in the system</p>
          </div>
        </header>

        <div className="card full-width">
          <div className="card-header">
            <h2>👥 All Users</h2>
          </div>
          <div className="status-list">
            {loading ? (
              <p>Loading users...</p>
            ) : users.length > 0 ? (
              users.map((user) => (
                <div key={user.id} className="status-item user-item">
                  <div className="status-label">
                    <span className="user-name">{user.full_name || user.username}</span>
                    <span className="user-email">{user.email}</span>
                    <span className="user-role">{user.role}</span>
                  </div>
                  <span className={`status-value ${user.is_active ? 'online' : 'offline'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))
            ) : (
              <p>No users found</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
