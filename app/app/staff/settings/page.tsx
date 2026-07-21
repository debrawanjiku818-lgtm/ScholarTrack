"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface LoginHistory {
  id: number;
  loginTime: string;
  ipAddress: string | null;
  status: string;
}

export default function StaffSettings() {
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [staffName, setStaffName] = useState("");
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
    if (user.role.toUpperCase() !== "STAFF") {
      router.push("/login");
      return;
    }

    setStaffName(user.username || "");
    fetchLoginHistory(token);
  }, [router]);

  const fetchLoginHistory = async (token: string) => {
    try {
      const response = await fetch("http://localhost:4000/auth/login-history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setLoginHistory(data);
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

  if (!staffName) {
    return <p>Redirecting to login...</p>;
  }

  return (
    <div className="dashboard-container">
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
          <a href="/staff/students" className="nav-item">
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
          <a href="/staff/settings" className="nav-item active">
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
            <p>View your account settings and login history</p>
          </div>
        </header>

        <div className="content-grid">
          <div className="card full-width">
            <div className="card-header">
              <h2>🔐 Login History</h2>
            </div>
            <div className="status-list">
              {loading ? (
                <p>Loading login history...</p>
              ) : loginHistory.length === 0 ? (
                <p>No login history yet</p>
              ) : (
                loginHistory.map((login) => (
                  <div key={login.id} className="status-item">
                    <div className="status-label">
                      <span className="login-time">{new Date(login.loginTime).toLocaleString()}</span>
                      <span className="login-ip">IP: {login.ipAddress || "unknown"}</span>
                    </div>
                    <span className={`status-value ${login.status === "success" ? "online" : "offline"}`}>
                      {login.status === "success" ? "Success" : "Failed"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>👤 Account Settings</h2>
            </div>
            <div className="status-list">
              <div className="status-item">
                <span className="status-label">Username</span>
                <span className="status-value">{staffName}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Role</span>
                <span className="status-value">Staff</span>
              </div>
              <div className="status-item">
                <span className="status-label">Account Status</span>
                <span className="status-value online">Active</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>🎨 Preferences</h2>
            </div>
            <div className="status-list">
              <div className="status-item">
                <span className="status-label">Email Notifications</span>
                <span className="status-value online">Enabled</span>
              </div>
              <div className="status-item">
                <span className="status-label">Dark Mode</span>
                <span className="status-value online">Enabled</span>
              </div>
              <div className="status-item">
                <span className="status-label">Language</span>
                <span className="status-value">English</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
