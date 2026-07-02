"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Staff() {
  const [staffName, setStaffName] = useState("");
  const [studentCount, setStudentCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== "staff") {
      router.push("/login");
      return;
    }

    setStaffName(user.username || "");

    // Get student count from localStorage
    const allStudentCourses = localStorage.getItem("studentCourses");
    if (allStudentCourses) {
      const coursesMap = JSON.parse(allStudentCourses);
      setStudentCount(Object.keys(coursesMap).length);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const stats = [
    { label: "Total Students", value: studentCount, icon: "👨‍🎓", gradient: "from-blue-500 to-cyan-400" },
    { label: "Active Courses", value: 8, icon: "📚", gradient: "from-green-500 to-emerald-400" },
    { label: "Tasks Assigned", value: 12, icon: "📋", gradient: "from-orange-500 to-amber-400" },
    { label: "Completion Rate", value: "85%", icon: "🎯", gradient: "from-purple-500 to-pink-400" },
  ];

  const recentActivity = [
    { action: "Grade submitted", course: "Mathematics", time: "2 hours ago", type: "grade" },
    { action: "Assignment reviewed", course: "Computer Science", time: "5 hours ago", type: "review" },
    { action: "Student query answered", course: "Biology", time: "1 day ago", type: "query" },
  ];

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
          <a href="/staff" className="nav-item active">
            <span>📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-item">
            <span>📚</span>
            <span>Courses</span>
          </a>
          <a href="#" className="nav-item">
            <span>👨‍🎓</span>
            <span>Students</span>
          </a>
          <a href="#" className="nav-item">
            <span>📝</span>
            <span>Grading</span>
          </a>
          <a href="#" className="nav-item">
            <span>📅</span>
            <span>Schedule</span>
          </a>
          <a href="#" className="nav-item">
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
            <h1>Welcome back, {staffName}! 👋</h1>
            <p>Here's what's happening with your teaching duties today.</p>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              <span>🔔</span>
              <span className="notification-badge">4</span>
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className={`stat-icon ${stat.gradient}`}>
                <span>{stat.icon}</span>
              </div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="content-grid">
          {/* Recent Activity */}
          <div className="card activity-card">
            <div className="card-header">
              <h2>🕐 Recent Activity</h2>
            </div>
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className={`activity-icon ${activity.type}`}>
                    <span>{activity.type === "grade" ? "📝" : activity.type === "review" ? "✅" : "💬"}</span>
                  </div>
                  <div className="activity-content">
                    <h4>{activity.action}</h4>
                    <p>{activity.course}</p>
                  </div>
                  <span className="activity-time">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card quick-actions-card">
            <div className="card-header">
              <h2>⚡ Quick Actions</h2>
            </div>
            <div className="quick-actions-grid">
              <a href="#" className="quick-action">
                <span>📝</span>
                <span>Grade Assignments</span>
              </a>
              <a href="#" className="quick-action">
                <span>👨‍🎓</span>
                <span>View Students</span>
              </a>
              <a href="#" className="quick-action">
                <span>📧</span>
                <span>Send Notice</span>
              </a>
              <a href="#" className="quick-action">
                <span>📅</span>
                <span>Update Schedule</span>
              </a>
            </div>
          </div>

          {/* Tasks */}
          <div className="card system-status-card">
            <div className="card-header">
              <h2>📋 Pending Tasks</h2>
            </div>
            <div className="status-list">
              <div className="status-item">
                <span className="status-label">Grade Quiz - Math</span>
                <span className="status-value warning">Pending</span>
              </div>
              <div className="status-item">
                <span className="status-label">Review Projects - CS</span>
                <span className="status-value warning">5 Pending</span>
              </div>
              <div className="status-item">
                <span className="status-label">Lab Reports - Biology</span>
                <span className="status-value online">Completed</span>
              </div>
              <div className="status-item">
                <span className="status-label">Prepare Lesson Plan</span>
                <span className="status-value">Tomorrow</span>
              </div>
            </div>
          </div>

          {/* Student Progress */}
          <div className="card course-progress-card">
            <div className="card-header">
              <h2>📈 Student Progress Overview</h2>
            </div>
            <div className="course-list">
              <div className="course-item">
                <div className="course-info">
                  <h4>Mathematics Class</h4>
                  <p>Average Progress</p>
                </div>
                <div className="course-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "75%" }}></div>
                  </div>
                  <span>75%</span>
                </div>
              </div>
              <div className="course-item">
                <div className="course-info">
                  <h4>Computer Science</h4>
                  <p>Average Progress</p>
                </div>
                <div className="course-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "60%" }}></div>
                  </div>
                  <span>60%</span>
                </div>
              </div>
              <div className="course-item">
                <div className="course-info">
                  <h4>Biology</h4>
                  <p>Average Progress</p>
                </div>
                <div className="course-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: "85%" }}></div>
                  </div>
                  <span>85%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
