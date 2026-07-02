"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Admin() {
  const [courses, setCourses] = useState<string[]>([
    "Mathematics", "Computer Science", "Biology", "History", 
    "Physics", "Chemistry", "Geography", "Literature"
  ]);
  const [newCourse, setNewCourse] = useState("");
  const [adminName, setAdminName] = useState("");
  const [studentCount, setStudentCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.push("/admin-login");
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      router.push("/admin-login");
      return;
    }

    setAdminName(user.username || "");

    // Get student count from localStorage
    const allStudentCourses = localStorage.getItem("studentCourses");
    if (allStudentCourses) {
      const coursesMap = JSON.parse(allStudentCourses);
      setStudentCount(Object.keys(coursesMap).length);
    }
  }, [router]);

  const addCourse = () => {
    const trimmed = newCourse.trim();
    if (trimmed && !courses.includes(trimmed)) {
      setCourses([...courses, trimmed]);
      setNewCourse("");
    }
  };

  const removeCourse = (course: string) => {
    setCourses(courses.filter(c => c !== course));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/admin-login");
  };

  const stats = [
    { label: "Total Courses", value: courses.length, icon: "📚", gradient: "from-blue-500 to-cyan-400" },
    { label: "Total Students", value: studentCount, icon: "👨‍🎓", gradient: "from-green-500 to-emerald-400" },
    { label: "Active Enrollments", value: studentCount * 3, icon: "📊", gradient: "from-orange-500 to-amber-400" },
    { label: "Completion Rate", value: "87%", icon: "🎯", gradient: "from-purple-500 to-pink-400" },
  ];

  const recentActivity = [
    { action: "New student enrolled", course: "Computer Science", time: "2 hours ago", type: "enrollment" },
    { action: "Course updated", course: "Mathematics", time: "5 hours ago", type: "update" },
    { action: "Assignment submitted", course: "Biology", time: "1 day ago", type: "submission" },
  ];

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
          <a href="/admin" className="nav-item active">
            <span>📊</span>
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-item">
            <span>📚</span>
            <span>Manage Courses</span>
          </a>
          <a href="#" className="nav-item">
            <span>👨‍🎓</span>
            <span>Students</span>
          </a>
          <a href="#" className="nav-item">
            <span>📅</span>
            <span>Schedule</span>
          </a>
          <a href="#" className="nav-item">
            <span>📈</span>
            <span>Analytics</span>
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
            <h1>Welcome back, {adminName}! 👋</h1>
            <p>Here's what's happening with your school administration today.</p>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              <span>🔔</span>
              <span className="notification-badge">5</span>
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
          {/* Course Management */}
          <div className="card course-management-card">
            <div className="card-header">
              <h2>📚 Course Management</h2>
            </div>
            <div className="add-course-form">
              <input
                type="text"
                placeholder="Add new course"
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                className="admin-input"
              />
              <button onClick={addCourse} className="btn-primary">Add Course</button>
            </div>
            <div className="course-list-admin">
              {courses.map((course, index) => (
                <div key={index} className="course-item-admin">
                  <span>{course}</span>
                  <button 
                    onClick={() => removeCourse(course)} 
                    className="btn-remove-small"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card activity-card">
            <div className="card-header">
              <h2>🕐 Recent Activity</h2>
            </div>
            <div className="activity-list">
              {recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className={`activity-icon ${activity.type}`}>
                    <span>{activity.type === "enrollment" ? "👨‍🎓" : activity.type === "update" ? "📝" : "✅"}</span>
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
                <span>📊</span>
                <span>View Reports</span>
              </a>
              <a href="#" className="quick-action">
                <span>👨‍🎓</span>
                <span>Manage Students</span>
              </a>
              <a href="#" className="quick-action">
                <span>📧</span>
                <span>Send Notice</span>
              </a>
              <a href="#" className="quick-action">
                <span>📅</span>
                <span>Set Schedule</span>
              </a>
            </div>
          </div>

          {/* System Status */}
          <div className="card system-status-card">
            <div className="card-header">
              <h2>🖥️ System Status</h2>
            </div>
            <div className="status-list">
              <div className="status-item">
                <span className="status-label">Server Status</span>
                <span className="status-value online">Online</span>
              </div>
              <div className="status-item">
                <span className="status-label">Database</span>
                <span className="status-value online">Connected</span>
              </div>
              <div className="status-item">
                <span className="status-label">Storage</span>
                <span className="status-value warning">75% Used</span>
              </div>
              <div className="status-item">
                <span className="status-label">Last Backup</span>
                <span className="status-value">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
