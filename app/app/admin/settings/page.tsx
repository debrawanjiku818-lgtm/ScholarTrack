"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface LoginLog {
  id: number;
  username: string;
  role: string | null;
  status: string;
  ipAddress: string | null;
  loginTime: string;
}

export default function AdminSettings() {
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);
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
    fetchLoginHistory(token);
  }, [router]);

  const fetchLoginHistory = async (token: string) => {
    try {
      const response = await fetch("http://localhost:4000/auth/login-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setLoginLogs(data);
      }
    } catch (error) {
      console.error("Error fetching login history:", error);
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
          <a href="/admin/students" className="nav-item">
            <span>👨‍🎓</span>
            <span>Students</span>
          </a>
          <a href="/admin/schedule" className="nav-item">
            <span>📅</span>
            <span>Schedule</span>
          </a>
          <a href="/admin/settings" className="nav-item active">
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

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Settings ⚙️</h1>
            <p>System settings and login activity monitoring</p>
          </div>
        </header>

        <div className="content-grid">
          <div className="card full-width">
            <div className="card-header">
              <h2>🔐 Login Activity Logs</h2>
            </div>
            <div className="status-list">
              {loading ? (
                <p>Loading login logs...</p>
              ) : loginLogs.length === 0 ? (
                <p>No login activity yet</p>
              ) : (
                loginLogs.map((log) => (
                  <div key={log.id} className="status-item">
                    <div className="status-label">
                      <span className="log-username">{log.username}</span>
                      <span className="log-role">{log.role || "unknown"}</span>
                      <span className="log-time">{new Date(log.loginTime).toLocaleString()}</span>
                      <span className="log-ip">IP: {log.ipAddress || "unknown"}</span>
                    </div>
                    <span className={`status-value ${log.status === "success" ? "online" : "offline"}`}>
                      {log.status === "success" ? "Success" : "Failed"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
