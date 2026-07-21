"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Helper function
const isActive = (item: any) => {
  return item?.isActive === true || item?.is_active === true;
};

// Get subject from staff username
const getSubject = (username: string): string => {
  const map: Record<string, string> = {
    'math_teacher': 'Mathematics',
    'science_teacher': 'Science',
    'programming_teacher': 'Programming',
    'business_teacher': 'Business',
    'design_teacher': 'Design'
  };
  return map[username] || '';
};

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalEnrollments: 0,
    totalStudents: 0,
    totalStaff: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userStr);
    setUser(parsedUser);
    fetchData(token, parsedUser);
  }, []);

  const fetchData = async (token: string, currentUser: any) => {
    try {
      if (currentUser.role === "ADMIN" || currentUser.role === "PRINCIPAL" || currentUser.role === "DEPUTY_PRINCIPAL") {
        const usersRes = await fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (usersRes.ok) {
          const data = await usersRes.json();
          const usersList = data.users || [];
          setUsers(usersList);
          
          const activeUsers = usersList.filter((u: any) => isActive(u)).length;
          const students = usersList.filter((u: any) => u.role === "STUDENT").length;
          const staff = usersList.filter((u: any) => u.role === "STAFF" || u.role === "PRINCIPAL" || u.role === "DEPUTY_PRINCIPAL").length;
          
          setStats(prev => ({
            ...prev,
            totalUsers: usersList.length,
            activeUsers,
            inactiveUsers: usersList.length - activeUsers,
            totalStudents: students,
            totalStaff: staff,
          }));
        }
      }

      const coursesRes = await fetch(`${API_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        const coursesList = data.courses || [];
        setCourses(coursesList);
        
        const activeCourses = coursesList.filter((c: any) => isActive(c)).length;
        setStats(prev => ({
          ...prev,
          totalCourses: coursesList.length,
          activeCourses,
        }));
      }

      let enrollmentsData = [];
      
      if (currentUser.role === "STUDENT") {
        const enrollRes = await fetch(`${API_URL}/enrollments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (enrollRes.ok) {
          enrollmentsData = await enrollRes.json();
          setEnrollments(enrollmentsData);
        }
      } else {
        const enrollRes = await fetch(`${API_URL}/enrollments/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (enrollRes.ok) {
          enrollmentsData = await enrollRes.json();
          setEnrollments(enrollmentsData);
        }
      }

      setStats(prev => ({
        ...prev,
        totalEnrollments: enrollmentsData.length,
      }));

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      ADMIN: "#818cf8",
      STUDENT: "#34d399",
      STAFF: "#f472b6",
      PRINCIPAL: "#fbbf24",
      DEPUTY_PRINCIPAL: "#fb923c",
    };
    return colors[role] || "#94a3b8";
  };

  const getRoleBadge = (role: string): string => {
    const badges: Record<string, string> = {
      ADMIN: "🛡️",
      STUDENT: "🎓",
      STAFF: "👨‍🏫",
      PRINCIPAL: "👔",
      DEPUTY_PRINCIPAL: "👔",
    };
    return badges[role] || "👤";
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        color: "#94a3b8",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!user) return null;

  const role = user.role;
  const isAdmin = role === "ADMIN";
  const isPrincipal = role === "PRINCIPAL" || role === "DEPUTY_PRINCIPAL";
  const isStaff = role === "STAFF";
  const isStudent = role === "STUDENT";

  const sidebarItems = [{ id: "overview", label: "Overview", icon: "📊" }];

  if (isAdmin) {
    sidebarItems.push(
      { id: "users", label: "Users", icon: "👤" },
      { id: "courses", label: "Courses", icon: "📚" },
      { id: "enrollments", label: "Enrollments", icon: "📊" },
      { id: "broadcast", label: "Broadcast", icon: "📢" },
      { id: "settings", label: "Settings", icon: "⚙️" }
    );
  } else if (isPrincipal || role === "DEPUTY_PRINCIPAL") {
    sidebarItems.push(
      { id: "staff", label: "Staff", icon: "👨‍🏫" },
      { id: "students", label: "Students", icon: "🎓" },
      { id: "reports", label: "Reports", icon: "📊" }
    );
  } else if (isStaff) {
    sidebarItems.push(
      { id: "mycourses", label: "My Courses", icon: "📚" },
      { id: "students", label: "My Students", icon: "👨‍🎓" },
      { id: "grading", label: "Grading", icon: "📝" },
      { id: "messages", label: "Messages", icon: "💬" },
      { id: "settings", label: "Settings", icon: "⚙️" }
    );
  } else if (isStudent) {
    sidebarItems.push(
      { id: "mycourses", label: "My Courses", icon: "📚" },
      { id: "progress", label: "Progress", icon: "📊" },
      { id: "messages", label: "Messages", icon: "💬" },
      { id: "settings", label: "Settings", icon: "⚙️" }
    );
  }

  return (
    <div style={{ display: "flex", background: "#0f172a", minHeight: "100vh" }}>
      <div style={{
        width: "240px",
        background: "rgba(255,255,255,0.02)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        padding: "1.5rem 0",
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}>
        <div style={{
          padding: "0 1.5rem 1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          marginBottom: "0.5rem",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${getRoleColor(role)}, ${getRoleColor(role)}dd)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              color: "white",
            }}>
              {getRoleBadge(role)}
            </div>
            <div>
              <div style={{ color: "#f8fafc", fontSize: "0.9rem", fontWeight: "600" }}>
                {user.fullName || user.username}
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.7rem", textTransform: "uppercase" }}>
                {role}
              </div>
            </div>
          </div>
        </div>

        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.6rem 1.5rem",
              margin: "0 0.5rem",
              borderRadius: "8px",
              border: "none",
              background: activeTab === item.id ? "rgba(99,102,241,0.15)" : "transparent",
              color: activeTab === item.id ? "#a5b4fc" : "#94a3b8",
              cursor: "pointer",
              width: "calc(100% - 1rem)",
              transition: "all 0.3s",
              fontSize: "0.9rem",
              fontWeight: activeTab === item.id ? "600" : "400",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div style={{
          marginTop: "auto",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          paddingTop: "0.5rem",
        }}>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.6rem 1.5rem",
              margin: "0 0.5rem",
              borderRadius: "8px",
              border: "none",
              background: "rgba(239,68,68,0.1)",
              color: "#ef4444",
              cursor: "pointer",
              width: "calc(100% - 1rem)",
              transition: "all 0.3s",
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            <span style={{ fontSize: "1.2rem" }}>🚪</span>
            Logout
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        padding: "2rem",
        overflowY: "auto",
        maxHeight: "100vh",
      }}>
        {activeTab === "overview" && (
          <OverviewContent 
            user={user} 
            stats={stats} 
            users={users} 
            courses={courses} 
            enrollments={enrollments}
            isAdmin={isAdmin}
            isStudent={isStudent}
            isStaff={isStaff}
            isPrincipal={isPrincipal}
          />
        )}
        {activeTab === "users" && <UsersContent users={users} />}
        {activeTab === "courses" && <CoursesContent courses={courses} />}
        {activeTab === "enrollments" && <EnrollmentsContent enrollments={enrollments} />}
        {activeTab === "broadcast" && <BroadcastContent user={user} />}
        {activeTab === "settings" && <SettingsContent user={user} />}
        {activeTab === "mycourses" && <MyCoursesContent courses={courses} user={user} enrollments={enrollments} />}
        {activeTab === "students" && <StudentsContent users={users} enrollments={enrollments} courses={courses} user={user} />}
        {activeTab === "grading" && <GradingContent enrollments={enrollments} courses={courses} user={user} />}
        {activeTab === "messages" && <MessagesContent user={user} />}
        {activeTab === "staff" && <StaffContent users={users} />}
        {activeTab === "reports" && <ReportsContent courses={courses} enrollments={enrollments} />}
        {activeTab === "progress" && <ProgressContent enrollments={enrollments} />}
      </div>
    </div>
  );
}

// ============================================
// OVERVIEW CONTENT
// ============================================
function OverviewContent({ user, stats, users, courses, enrollments, isAdmin, isStudent, isStaff, isPrincipal }: any) {
  const completedCount = enrollments.filter((e: any) => e.progress === 100).length;
  const avgProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((acc: number, e: any) => acc + (e.progress || 0), 0) / enrollments.length) 
    : 0;

  const gradePoints: Record<string, number> = {
    'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'E': 0.0,
  };
  const graded = enrollments.filter((e: any) => e.grade && gradePoints[e.grade] !== undefined);
  const gpa = graded.length > 0 ? (graded.reduce((sum, e) => sum + gradePoints[e.grade], 0) / graded.length) : 0;

  const totalStudents = users.filter((u: any) => u.role === "STUDENT").length || 0;
  const pendingGrading = enrollments.filter((e: any) => !e.grade).length || 0;
  const classesToday = 2;
  const activeUsers = users.filter((u: any) => isActive(u)).length || 0;
  const activeCourses = courses.filter((c: any) => isActive(c)).length || 0;

  return (
    <div>
      <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "0.25rem" }}>
        Welcome back, {user.fullName || user.username}! 👋
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
        Here's what's happening with your {user.role.toLowerCase()} dashboard
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1.5rem",
        marginBottom: "2rem",
      }}>
        {isAdmin && (
          <>
            <StatCard label="Total Users" value={stats.totalUsers} icon="👤" color="#818cf8" />
            <StatCard label="Active Users" value={activeUsers} icon="✅" color="#34d399" />
            <StatCard label="Total Courses" value={stats.totalCourses} icon="📚" color="#f472b6" />
            <StatCard label="Active Courses" value={activeCourses} icon="📊" color="#fbbf24" />
          </>
        )}
        {isPrincipal && (
          <>
            <StatCard label="Total Students" value={totalStudents} icon="🎓" color="#818cf8" />
            <StatCard label="Total Staff" value={stats.totalStaff || 0} icon="👨‍🏫" color="#34d399" />
            <StatCard label="Total Courses" value={stats.totalCourses || 0} icon="📚" color="#f472b6" />
            <StatCard label="Enrollments" value={stats.totalEnrollments || 0} icon="📊" color="#fbbf24" />
          </>
        )}
        {isStaff && (
          <>
            <StatCard label="Courses Teaching" value={3} icon="📚" color="#818cf8" />
            <StatCard label="Total Students" value={totalStudents} icon="🎓" color="#34d399" />
            <StatCard label="Pending Grading" value={pendingGrading} icon="📝" color="#f472b6" />
            <StatCard label="Classes Today" value={classesToday} icon="📅" color="#fbbf24" />
          </>
        )}
        {isStudent && (
          <>
            <StatCard label="Enrolled Courses" value={enrollments.length} icon="📚" color="#818cf8" />
            <StatCard label="Completed" value={completedCount} icon="✅" color="#34d399" />
            <StatCard label="Average Progress" value={`${avgProgress}%`} icon="📊" color="#f472b6" />
            <StatCard label="GPA" value={gpa > 0 ? gpa.toFixed(2) : 'N/A'} icon="🎯" color="#fbbf24" />
          </>
        )}
      </div>

      <div style={{
        background: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
        padding: "1.5rem",
        border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <h3 style={{ color: "#f8fafc", fontSize: "1.1rem", marginBottom: "1rem" }}>📋 Recent Activity</h3>
        {enrollments.slice(0, 5).map((e: any, i: number) => (
          <div key={i} style={{
            padding: "0.5rem 0",
            borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}>
            <span>✅</span>
            <span style={{ color: "#f8fafc", fontSize: "0.9rem" }}>
              {e.course?.name || "Unknown"} 
              <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
                {" "}· {new Date(e.enrolledAt || e.enrolled_at).toLocaleDateString()}
              </span>
              {e.grade && (
                <span style={{ 
                  background: "rgba(99,102,241,0.2)", 
                  padding: "0.1rem 0.5rem", 
                  borderRadius: "50px",
                  fontSize: "0.75rem",
                  color: "#a5b4fc",
                  marginLeft: "0.5rem"
                }}>
                  Grade: {e.grade}
                </span>
              )}
            </span>
          </div>
        ))}
        {enrollments.length === 0 && (
          <p style={{ color: "#64748b", fontSize: "0.9rem", textAlign: "center" }}>
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// STAT CARD
// ============================================
function StatCard({ label, value, icon, color }: any) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      borderRadius: "12px",
      padding: "1.2rem",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
        <span style={{ fontSize: "1.5rem" }}>{icon}</span>
        <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{label}</span>
      </div>
      <div style={{ fontSize: "2rem", fontWeight: "700", color: color }}>{value}</div>
    </div>
  );
}

// ============================================
// USERS CONTENT
// ============================================
function UsersContent({ users }: any) {
  const activeUsers = users.filter((u: any) => isActive(u)).length;
  const inactiveUsers = users.length - activeUsers;

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>👤 Users</h2>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        {users.length} total users · {activeUsers} active · {inactiveUsers} inactive
      </p>
      <div style={{
        background: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <th style={{ padding: "0.8rem", textAlign: "left", color: "#94a3b8", fontSize: "0.8rem" }}>Username</th>
              <th style={{ padding: "0.8rem", textAlign: "left", color: "#94a3b8", fontSize: "0.8rem" }}>Full Name</th>
              <th style={{ padding: "0.8rem", textAlign: "left", color: "#94a3b8", fontSize: "0.8rem" }}>Email</th>
              <th style={{ padding: "0.8rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>Role</th>
              <th style={{ padding: "0.8rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <td style={{ padding: "0.8rem", color: "#f8fafc" }}>{u.username}</td>
                <td style={{ padding: "0.8rem", color: "#f8fafc" }}>{u.fullName || "-"}</td>
                <td style={{ padding: "0.8rem", color: "#94a3b8" }}>{u.email || "-"}</td>
                <td style={{ padding: "0.8rem", textAlign: "center" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "0.2rem 0.8rem",
                    borderRadius: "50px",
                    background: `${getRoleColor(u.role)}22`,
                    color: getRoleColor(u.role),
                    fontSize: "0.75rem",
                    fontWeight: "600",
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: "0.8rem", textAlign: "center" }}>
                  <span style={{
                    color: isActive(u) ? "#34d399" : "#ef4444",
                    fontSize: "0.8rem",
                    fontWeight: "500",
                  }}>
                    {isActive(u) ? "✅ Active" : "❌ Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    ADMIN: "#818cf8",
    STUDENT: "#34d399",
    STAFF: "#f472b6",
    PRINCIPAL: "#fbbf24",
    DEPUTY_PRINCIPAL: "#fb923c",
  };
  return colors[role] || "#94a3b8";
}

// ============================================
// COURSES CONTENT
// ============================================
function CoursesContent({ courses }: any) {
  const activeCourses = courses.filter((c: any) => isActive(c)).length;
  const inactiveCourses = courses.length - activeCourses;

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>📚 Courses</h2>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        {courses.length} total courses · {activeCourses} active · {inactiveCourses} inactive
      </p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "1rem",
      }}>
        {courses.map((c: any) => (
          <div key={c.id} style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: "12px",
            padding: "1rem",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <h4 style={{ color: "#f8fafc", marginBottom: "0.25rem" }}>{c.name}</h4>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{c.description || "No description"}</p>
            <span style={{
              display: "inline-block",
              marginTop: "0.5rem",
              padding: "0.2rem 0.8rem",
              borderRadius: "50px",
              background: isActive(c) ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)",
              color: isActive(c) ? "#34d399" : "#ef4444",
              fontSize: "0.75rem",
            }}>
              {isActive(c) ? "✅ Active" : "❌ Inactive"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// ENROLLMENTS CONTENT
// ============================================
function EnrollmentsContent({ enrollments }: any) {
  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>📊 Enrollments</h2>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>{enrollments.length} total enrollments</p>
      <div style={{
        background: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <th style={{ padding: "0.8rem", textAlign: "left", color: "#94a3b8", fontSize: "0.8rem" }}>Course</th>
              <th style={{ padding: "0.8rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>Progress</th>
              <th style={{ padding: "0.8rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e: any) => (
              <tr key={e.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <td style={{ padding: "0.8rem", color: "#f8fafc" }}>{e.course?.name || "Unknown"}</td>
                <td style={{ padding: "0.8rem", textAlign: "center", color: "#94a3b8" }}>{e.progress || 0}%</td>
                <td style={{ padding: "0.8rem", textAlign: "center" }}>
                  <span style={{
                    color: e.progress === 100 ? "#34d399" : "#fbbf24",
                    fontSize: "0.8rem",
                  }}>
                    {e.progress === 100 ? "✅ Completed" : "📖 In Progress"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// BROADCAST CONTENT
// ============================================
function BroadcastContent({ user }: any) {
  const [recipientRole, setRecipientRole] = useState("ALL");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sentMessages, setSentMessages] = useState<any[]>([]);

  const fetchSentMessages = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/messages/sent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSentMessages(data);
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchSentMessages();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/messages/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient_role: recipientRole,
          content: content,
        }),
      });

      if (response.ok) {
        setMessage("✅ Broadcast sent successfully!");
        setContent("");
        fetchSentMessages();
      } else {
        const data = await response.json();
        setError(data.message || "❌ Failed to send broadcast");
      }
    } catch {
      setError("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: "ALL", label: "📢 All Users" },
    { value: "STUDENT", label: "🎓 Students" },
    { value: "STAFF", label: "👨‍🏫 Staff" },
    { value: "ADMIN", label: "🛡️ Admins" },
  ];

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>📢 Broadcast Message</h2>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        Send announcements to all users or specific roles
      </p>

      {message && (
        <div style={{
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: "12px",
          padding: "0.75rem 1rem",
          marginBottom: "1rem",
          color: "#34d399",
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "12px",
          padding: "0.75rem 1rem",
          marginBottom: "1rem",
          color: "#ef4444",
        }}>
          {error}
        </div>
      )}

      <div style={{
        background: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
        padding: "1.5rem",
        border: "1px solid rgba(255,255,255,0.06)",
        marginBottom: "2rem",
      }}>
        <form onSubmit={handleSendBroadcast}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "#94a3b8", fontSize: "0.9rem", display: "block", marginBottom: "0.3rem" }}>
              Send to
            </label>
            <select
              value={recipientRole}
              onChange={(e) => setRecipientRole(e.target.value)}
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                color: "#f8fafc",
                fontSize: "0.95rem",
                outline: "none",
              }}
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ color: "#94a3b8", fontSize: "0.9rem", display: "block", marginBottom: "0.3rem" }}>
              Message
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your announcement here..."
              rows={4}
              required
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                color: "#f8fafc",
                fontSize: "0.95rem",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.6rem",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              fontSize: "0.95rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Sending..." : "📢 Send Broadcast"}
          </button>
        </form>
      </div>

      <h3 style={{ color: "#f8fafc", fontSize: "1.1rem", marginBottom: "0.75rem" }}>📤 Sent Broadcasts</h3>
      {sentMessages.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: "12px",
          padding: "2rem",
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <p style={{ color: "#94a3b8" }}>No broadcasts sent yet</p>
        </div>
      ) : (
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}>
          {sentMessages.map((msg) => (
            <div key={msg.id} style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: "12px",
              padding: "1rem",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                  To: <span style={{ color: "#f8fafc", fontWeight: "600" }}>{msg.recipient_role || "ALL"}</span>
                </span>
                <span style={{ color: "#64748b", fontSize: "0.75rem" }}>
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>
              <p style={{ color: "#f8fafc", fontSize: "0.95rem", marginTop: "0.3rem" }}>{msg.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// SETTINGS CONTENT
// ============================================
function SettingsContent({ user }: any) {
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, email }),
      });

      if (response.ok) {
        setMessage("✅ Profile updated successfully!");
      } else {
        setError("❌ Failed to update profile");
      }
    } catch {
      setError("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("❌ Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        setMessage("✅ Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError("❌ Failed to change password");
      }
    } catch {
      setError("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>⚙️ Settings</h2>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        Manage your account settings and preferences
      </p>

      {message && (
        <div style={{
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: "12px",
          padding: "0.75rem 1rem",
          marginBottom: "1rem",
          color: "#34d399",
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "12px",
          padding: "0.75rem 1rem",
          marginBottom: "1rem",
          color: "#ef4444",
        }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: "12px",
          padding: "1.5rem",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <h3 style={{ color: "#f8fafc", marginBottom: "1rem" }}>👤 Profile Settings</h3>
          <form onSubmit={handleUpdateProfile}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ color: "#94a3b8", fontSize: "0.9rem", display: "block", marginBottom: "0.3rem" }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#f8fafc",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ color: "#94a3b8", fontSize: "0.9rem", display: "block", marginBottom: "0.3rem" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#f8fafc",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white",
                fontSize: "0.95rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Saving..." : "Update Profile"}
            </button>
          </form>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: "12px",
          padding: "1.5rem",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <h3 style={{ color: "#f8fafc", marginBottom: "1rem" }}>🔑 Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ color: "#94a3b8", fontSize: "0.9rem", display: "block", marginBottom: "0.3rem" }}>
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#f8fafc",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
                required
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ color: "#94a3b8", fontSize: "0.9rem", display: "block", marginBottom: "0.3rem" }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#f8fafc",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
                required
              />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ color: "#94a3b8", fontSize: "0.9rem", display: "block", marginBottom: "0.3rem" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#f8fafc",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.6rem",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white",
                fontSize: "0.95rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STAFF: MY COURSES
// ============================================
function MyCoursesContent({ courses, user, enrollments }: any) {
  const staffSubject = getSubject(user?.username || '');
  const staffCourses = courses.filter((c: any) => {
    const subject = c.subject?.name || '';
    return subject === staffSubject;
  });

  const courseIds = staffCourses.map((c: any) => c.id);
  const relevantEnrollments = enrollments.filter((e: any) => courseIds.includes(e.courseId));

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>📚 My Courses</h2>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        {staffSubject ? `You teach ${staffCourses.length} courses in ${staffSubject}` : 'No courses assigned'}
      </p>
      {staffCourses.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: "12px",
          padding: "3rem",
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
          <p style={{ color: "#94a3b8" }}>No courses assigned to you yet</p>
        </div>
      ) : (
        staffCourses.map((course: any) => {
          const studentCount = relevantEnrollments.filter((e: any) => e.courseId === course.id).length;
          return (
            <div key={course.id} style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: "12px",
              padding: "1rem 1.5rem",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}>
              <div>
                <h4 style={{ color: "#f8fafc", fontWeight: "600", marginBottom: "0.1rem" }}>
                  {course.name}
                </h4>
                <p style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                  {studentCount} students enrolled · {course.isActive ? '✅ Active' : '❌ Inactive'}
                </p>
              </div>
              <Link href={`/courses/${course.id}`} style={{
                color: "#818cf8",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: "500",
              }}>
                View Course →
              </Link>
            </div>
          );
        })
      )}
    </div>
  );
}

// ============================================
// STAFF: STUDENTS
// ============================================
function StudentsContent({ users, enrollments, courses, user }: any) {
  const allStudents = users.filter((u: any) => u.role === "STUDENT");
  const staffSubject = getSubject(user?.username || '');
  
  const staffCourseIds = courses
    .filter((c: any) => {
      const subject = c.subject?.name || '';
      return subject === staffSubject;
    })
    .map((c: any) => c.id);

  const studentIds = new Set();
  enrollments.forEach((e: any) => {
    if (staffCourseIds.includes(e.courseId)) {
      studentIds.add(e.userId);
    }
  });

  const filteredStudents = allStudents.filter((s: any) => studentIds.has(s.id));
  const activeStudents = filteredStudents.filter((s: any) => isActive(s)).length;

  const studentsWithData = filteredStudents.map((student: any) => {
    const studentEnrollments = enrollments.filter((e: any) => e.userId === student.id && staffCourseIds.includes(e.courseId));
    return {
      ...student,
      totalCourses: studentEnrollments.length,
      avgProgress: studentEnrollments.length > 0 
        ? Math.round(studentEnrollments.reduce((acc: number, e: any) => acc + (e.progress || 0), 0) / studentEnrollments.length)
        : 0,
    };
  });

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>👨‍🎓 My Students</h2>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        {filteredStudents.length} students in your {staffSubject || 'courses'} · {activeStudents} active
      </p>
      <div style={{
        background: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <th style={{ padding: "0.8rem", textAlign: "left", color: "#94a3b8", fontSize: "0.8rem" }}>Student</th>
              <th style={{ padding: "0.8rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>Courses</th>
              <th style={{ padding: "0.8rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>Avg Progress</th>
              <th style={{ padding: "0.8rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {studentsWithData.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                  No students enrolled in your {staffSubject || 'courses'} yet
                </td>
              </tr>
            ) : (
              studentsWithData.map((s: any) => (
                <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "0.8rem", color: "#f8fafc" }}>{s.fullName || s.username}</td>
                  <td style={{ padding: "0.8rem", textAlign: "center", color: "#94a3b8" }}>{s.totalCourses}</td>
                  <td style={{ padding: "0.8rem", textAlign: "center", color: "#94a3b8" }}>{s.avgProgress}%</td>
                  <td style={{ padding: "0.8rem", textAlign: "center" }}>
                    <span style={{
                      color: s.isActive ? "#34d399" : "#ef4444",
                      fontSize: "0.8rem",
                    }}>
                      {s.isActive ? "✅ Active" : "❌ Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// STAFF: GRADING
// ============================================
function GradingContent({ enrollments, courses, user }: any) {
  const [grades, setGrades] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const staffSubject = getSubject(user?.username || '');

  const staffCourseIds = courses
    .filter((c: any) => {
      const subject = c.subject?.name || '';
      return subject === staffSubject;
    })
    .map((c: any) => c.id);

  const staffEnrollments = enrollments.filter((e: any) => staffCourseIds.includes(e.courseId));

  // Initialize grades only when staffEnrollments changes
  useEffect(() => {
    const initialGrades: Record<number, string> = {};
    staffEnrollments.forEach((e: any) => {
      if (e.grade) {
        initialGrades[e.id] = e.grade;
      }
    });
    setGrades(initialGrades);
  }, [staffEnrollments.length]);

  const handleGradeChange = (enrollmentId: number, grade: string) => {
    setGrades(prev => ({ ...prev, [enrollmentId]: grade }));
  };

  const handleSaveGrade = async (enrollmentId: number) => {
    const grade = grades[enrollmentId];
    if (!grade) {
      setError("Please select a grade");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/enrollments/${enrollmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ grade }),
      });

      if (response.ok) {
        setMessage("✅ Grade saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError("❌ Failed to save grade");
        setTimeout(() => setError(""), 3000);
      }
    } catch {
      setError("❌ Something went wrong");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const gradeOptions = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "E"];

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>📝 Grading</h2>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        {staffEnrollments.length} students to grade in your {staffSubject || 'courses'}
      </p>

      {message && (
        <div style={{
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: "12px",
          padding: "0.75rem 1rem",
          marginBottom: "1rem",
          color: "#34d399",
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "12px",
          padding: "0.75rem 1rem",
          marginBottom: "1rem",
          color: "#ef4444",
        }}>
          {error}
        </div>
      )}

      <div style={{
        background: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <th style={{ padding: "0.8rem", textAlign: "left", color: "#94a3b8", fontSize: "0.8rem" }}>Student</th>
              <th style={{ padding: "0.8rem", textAlign: "left", color: "#94a3b8", fontSize: "0.8rem" }}>Course</th>
              <th style={{ padding: "0.8rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>Progress</th>
              <th style={{ padding: "0.8rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>Grade</th>
              <th style={{ padding: "0.8rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {staffEnrollments.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                  No students enrolled in your {staffSubject || 'courses'} yet
                </td>
              </tr>
            ) : (
              staffEnrollments.map((e: any) => {
                const studentName = e.user?.fullName || e.user?.username || "Unknown";
                return (
                  <tr key={e.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "0.8rem", color: "#f8fafc" }}>{studentName}</td>
                    <td style={{ padding: "0.8rem", color: "#94a3b8" }}>{e.course?.name || "Unknown"}</td>
                    <td style={{ padding: "0.8rem", textAlign: "center", color: "#94a3b8" }}>{e.progress || 0}%</td>
                    <td style={{ padding: "0.8rem", textAlign: "center" }}>
                      <select
                        value={grades[e.id] || ""}
                        onChange={(e) => handleGradeChange(Number(e.target.value))}
                        style={{
                          padding: "0.3rem 0.6rem",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.03)",
                          color: "#f8fafc",
                          fontSize: "0.9rem",
                          outline: "none",
                        }}
                      >
                        <option value="">Select</option>
                        {gradeOptions.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: "0.8rem", textAlign: "center" }}>
                      <button
                        onClick={() => handleSaveGrade(e.id)}
                        disabled={loading}
                        style={{
                          padding: "0.3rem 1rem",
                          borderRadius: "8px",
                          border: "none",
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          color: "white",
                          cursor: loading ? "not-allowed" : "pointer",
                          fontSize: "0.85rem",
                          fontWeight: "500",
                          opacity: loading ? 0.7 : 1,
                        }}
                      >
                        {loading ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// MESSAGES CONTENT
// ============================================
function MessagesContent({ user }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${API_URL}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  if (loading) {
    return <div style={{ color: "#94a3b8" }}>Loading messages...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>💬 Messages</h2>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        Your inbox messages
      </p>
      {messages.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: "12px",
          padding: "2rem",
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <p style={{ color: "#94a3b8" }}>No messages yet</p>
        </div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} style={{
            background: msg.is_broadcast ? "rgba(99,102,241,0.05)" : "rgba(255,255,255,0.03)",
            borderRadius: "12px",
            padding: "1rem",
            border: msg.is_broadcast ? "1px solid rgba(99,102,241,0.1)" : "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                {msg.is_broadcast ? "📢 Broadcast" : `From: ${msg.sender_name || "Unknown"}`}
              </span>
              <span style={{ color: "#64748b", fontSize: "0.75rem" }}>
                {new Date(msg.created_at).toLocaleString()}
              </span>
            </div>
            <p style={{ color: "#f8fafc", fontSize: "0.95rem", marginTop: "0.3rem" }}>{msg.content}</p>
          </div>
        ))
      )}
    </div>
  );
}

// ============================================
// STAFF CONTENT
// ============================================
function StaffContent({ users }: any) {
  const staff = users.filter((u: any) => u.role === "STAFF" || u.role === "PRINCIPAL" || u.role === "DEPUTY_PRINCIPAL");
  const activeStaff = staff.filter((s: any) => isActive(s)).length;

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>👨‍🏫 Staff</h2>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
        {staff.length} total staff · {activeStaff} active
      </p>
      <div style={{
        background: "rgba(255,255,255,0.03)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <th style={{ padding: "0.8rem", textAlign: "left", color: "#94a3b8", fontSize: "0.8rem" }}>Name</th>
              <th style={{ padding: "0.8rem", textAlign: "left", color: "#94a3b8", fontSize: "0.8rem" }}>Role</th>
              <th style={{ padding: "0.8rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s: any) => (
              <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <td style={{ padding: "0.8rem", color: "#f8fafc" }}>{s.fullName || s.username}</td>
                <td style={{ padding: "0.8rem", color: "#94a3b8" }}>{s.role}</td>
                <td style={{ padding: "0.8rem", textAlign: "center" }}>
                  <span style={{
                    color: isActive(s) ? "#34d399" : "#ef4444",
                    fontSize: "0.8rem",
                  }}>
                    {isActive(s) ? "✅ Active" : "❌ Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// REPORTS CONTENT
// ============================================
function ReportsContent({ courses, enrollments }: any) {
  const activeCourses = courses.filter((c: any) => isActive(c)).length;

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>📊 Reports</h2>
      <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>School statistics</p>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "2rem" }}>📚</div>
          <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Total Courses</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "#f8fafc" }}>{courses.length}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "2rem" }}>✅</div>
          <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Active Courses</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "#34d399" }}>{activeCourses}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "2rem" }}>📊</div>
          <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Enrollments</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "#f472b6" }}>{enrollments.length}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "2rem" }}>📈</div>
          <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Avg Progress</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "#fbbf24" }}>
            {enrollments.length > 0 ? Math.round(enrollments.reduce((acc: number, e: any) => acc + (e.progress || 0), 0) / enrollments.length) : 0}%
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PROGRESS CONTENT
// ============================================
function ProgressContent({ enrollments }: any) {
  const totalProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((acc: number, e: any) => acc + (e.progress || 0), 0) / enrollments.length) 
    : 0;

  const gradePoints: Record<string, number> = {
    'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'E': 0.0,
  };
  const graded = enrollments.filter((e: any) => e.grade && gradePoints[e.grade] !== undefined);
  const gpa = graded.length > 0 ? (graded.reduce((sum, e) => sum + gradePoints[e.grade], 0) / graded.length) : 0;

  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "0.5rem" }}>📊 My Progress</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "1rem",
        marginBottom: "2rem",
      }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: "12px",
          padding: "1rem",
          border: "1px solid rgba(255,255,255,0.06)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Overall Progress</div>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#818cf8" }}>{totalProgress}%</div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: "12px",
          padding: "1rem",
          border: "1px solid rgba(255,255,255,0.06)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Courses Enrolled</div>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#34d399" }}>{enrollments.length}</div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: "12px",
          padding: "1rem",
          border: "1px solid rgba(255,255,255,0.06)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>GPA</div>
          <div style={{ fontSize: "2rem", fontWeight: "700", color: "#fbbf24" }}>
            {gpa > 0 ? gpa.toFixed(2) : 'N/A'}
          </div>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: "12px",
          padding: "3rem",
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
          <p style={{ color: "#94a3b8" }}>No courses to track progress</p>
        </div>
      ) : (
        enrollments.map((e: any) => (
          <div key={e.id} style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: "12px",
            padding: "1rem",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <span style={{ color: "#f8fafc", fontWeight: "600" }}>{e.course?.name || "Unknown"}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {e.grade && (
                  <span style={{
                    padding: "0.1rem 0.6rem",
                    borderRadius: "50px",
                    background: "rgba(99,102,241,0.2)",
                    color: "#a5b4fc",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                  }}>
                    Grade: {e.grade}
                  </span>
                )}
                <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{e.progress || 0}%</span>
              </div>
            </div>
            <div style={{ width: "100%", height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", marginTop: "0.3rem" }}>
              <div style={{
                width: `${e.progress || 0}%`,
                height: "100%",
                borderRadius: "4px",
                background: "linear-gradient(90deg, #818cf8, #8b5cf6)",
              }} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
