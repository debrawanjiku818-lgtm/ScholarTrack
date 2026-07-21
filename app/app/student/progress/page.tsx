"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface CourseProgress {
  id: number;
  name: string;
  progress: number;
  completed_modules: number;
  total_modules: number;
  grade: string | null;
  status: string;
}

export default function StudentProgress() {
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [studentName, setStudentName] = useState("");
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
    if (user.role.toUpperCase() !== "STUDENT") {
      router.push("/login");
      return;
    }

    setStudentName(user.username || "");
    fetchProgress(token);
  }, [router]);

  const fetchProgress = async (token: string) => {
    try {
      const response = await fetch("http://localhost:4000/dashboard/student", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCourseProgress(data.enrolledCourses || []);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

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
          <a href="/student/schedule" className="nav-item">
            <span>📅</span>
            <span>Schedule</span>
          </a>
          <a href="/student/progress" className="nav-item active">
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

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>My Progress 📈</h1>
            <p>Track your academic progress and course completion</p>
          </div>
        </header>

        <div className="card full-width">
          <div className="card-header">
            <h2>📊 Course Progress</h2>
          </div>
          <div className="course-list">
            {loading ? (
              <p>Loading progress...</p>
            ) : courseProgress.length === 0 ? (
              <p>No enrolled courses yet</p>
            ) : (
              courseProgress.map((course) => (
                <div key={course.id} className="course-item">
                  <div className="course-info">
                    <h4>{course.name}</h4>
                    <p>{course.completed_modules}/{course.total_modules} modules completed</p>
                    <p>Grade: {course.grade || "Not graded yet"}</p>
                  </div>
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span>{course.progress}%</span>
                  </div>
                  <span className={`status-value ${course.status === "Completed" ? "online" : "warning"}`}>
                    {course.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
