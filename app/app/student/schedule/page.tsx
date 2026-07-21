"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ScheduleItem {
  id: number;
  course: string;
  type: string;
  date: string;
  time: string;
  location: string;
}

export default function StudentSchedule() {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([
    {
      id: 1,
      course: "Mathematics",
      type: "Online Class",
      date: "2026-07-07",
      time: "09:00",
      location: "Zoom"
    },
    {
      id: 2,
      course: "Computer Science",
      type: "CAT",
      date: "2026-07-10",
      time: "10:00",
      location: "Room 101"
    },
    {
      id: 3,
      course: "Biology",
      type: "Exam",
      date: "2026-07-15",
      time: "14:00",
      location: "Main Hall"
    },
    {
      id: 4,
      course: "Physics",
      type: "Online Class",
      date: "2026-07-08",
      time: "11:00",
      location: "Google Meet"
    }
  ]);
  const [studentName, setStudentName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role.toUpperCase() !== "STUDENT") {
      router.push("/login");
      return;
    }

    setStudentName(user.username || "");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!studentName) {
    return <p>Redirecting to login...</p>;
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="user-avatar">
            <span>{studentName?.charAt(0).toUpperCase() || "G"}</span>
          </div>
          <div className="user-info">
            <h3>{studentName}</h3>
            <p>Student</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <a href="/dashboard" className="nav-item">
            <span>📊</span>
            <span>Dashboard</span>
          </a>
          <a href="/courses" className="nav-item">
            <span>📚</span>
            <span>My Courses</span>
          </a>
          <a href="/student/schedule" className="nav-item active">
            <span>📅</span>
            <span>Schedule</span>
          </a>
          <a href="/student/progress" className="nav-item">
            <span>📈</span>
            <span>Progress</span>
          </a>
          <a href="/student/messages" className="nav-item">
            <span>💬</span>
            <span>Messages</span>
          </a>
          <a href="/student/settings" className="nav-item">
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
            <h1>My Schedule 📅</h1>
            <p>View your class schedule, exams, and CATs for this term</p>
          </div>
        </header>

        <div className="card full-width">
          <div className="card-header">
            <h2>📋 Term Schedule</h2>
          </div>
          <div className="status-list">
            {scheduleItems.map((item) => (
              <div key={item.id} className="status-item schedule-item">
                <div className="status-label">
                  <span className="schedule-course">{item.course}</span>
                  <span className="schedule-type">{item.type}</span>
                  <span className="schedule-date">{item.date}</span>
                  <span className="schedule-time">{item.time}</span>
                  <span className="schedule-location">📍 {item.location}</span>
                </div>
                <span className={`status-value ${item.type === 'Exam' ? 'warning' : 'online'}`}>
                  {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
