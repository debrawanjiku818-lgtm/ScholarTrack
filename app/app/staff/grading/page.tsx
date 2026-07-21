"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Enrollment {
  id: number;
  student: { id: number; username: string; full_name: string };
  course: { id: number; name: string };
  progress: number;
  grade?: string;
}

export default function StaffGrading() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchEnrollments(token);
  }, []);

  const fetchEnrollments = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/enrollments/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = async (enrollmentId: number, grade: string) => {
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
        setEnrollments(prev =>
          prev.map(e =>
            e.id === enrollmentId ? { ...e, grade } : e
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredEnrollments = selectedCourse === "all"
    ? enrollments
    : enrollments.filter(e => e.course.id === parseInt(selectedCourse));

  const courses = [...new Set(enrollments.map(e => e.course.id))].map(id => {
    const course = enrollments.find(e => e.course.id === id)?.course;
    return course;
  }).filter(Boolean);

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
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
          Loading grading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{
          fontSize: "2rem",
          fontWeight: "700",
          marginBottom: "0.5rem",
          background: "linear-gradient(135deg, #f8fafc, #818cf8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          📝 Grading
        </h1>
        <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
          {enrollments.length} students enrolled in your courses
        </p>

        {/* Filter */}
        <div style={{ marginBottom: "2rem" }}>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: "#f8fafc",
              fontSize: "0.95rem",
              outline: "none",
              cursor: "pointer",
              minWidth: "200px",
            }}
          >
            <option value="all">All Courses</option>
            {courses.map((course: any) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.06)",
          overflow: "hidden",
        }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
          }}>
            <thead>
              <tr style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                <th style={{ padding: "1rem", textAlign: "left", color: "#94a3b8", fontWeight: "500", fontSize: "0.85rem" }}>Student</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#94a3b8", fontWeight: "500", fontSize: "0.85rem" }}>Course</th>
                <th style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", fontWeight: "500", fontSize: "0.85rem" }}>Progress</th>
                <th style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", fontWeight: "500", fontSize: "0.85rem" }}>Grade</th>
                <th style={{ padding: "1rem", textAlign: "right", color: "#94a3b8", fontWeight: "500", fontSize: "0.85rem" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
                    No enrollments found
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enrollment) => (
                  <tr
                    key={enrollment.id}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      transition: "background 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <td style={{ padding: "1rem", color: "#f8fafc" }}>
                      {enrollment.student?.full_name || enrollment.student?.username || "Unknown"}
                    </td>
                    <td style={{ padding: "1rem", color: "#94a3b8" }}>
                      {enrollment.course?.name || "Unknown"}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        justifyContent: "center",
                      }}>
                        <div style={{
                          width: "60px",
                          height: "4px",
                          borderRadius: "4px",
                          background: "rgba(255,255,255,0.05)",
                        }}>
                          <div style={{
                            width: `${enrollment.progress || 0}%`,
                            height: "100%",
                            background: "linear-gradient(90deg, #818cf8, #8b5cf6)",
                            borderRadius: "4px",
                          }} />
                        </div>
                        <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                          {enrollment.progress || 0}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <input
                        type="text"
                        value={enrollment.grade || ""}
                        onChange={(e) => handleGradeChange(enrollment.id, e.target.value)}
                        placeholder="A, B+, 85%"
                        style={{
                          width: "80px",
                          padding: "0.3rem 0.6rem",
                          borderRadius: "8px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.03)",
                          color: "#f8fafc",
                          fontSize: "0.85rem",
                          textAlign: "center",
                          outline: "none",
                          transition: "all 0.3s",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                          e.currentTarget.style.boxShadow = "0 0 20px rgba(99,102,241,0.1)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <button
                        onClick={() => {
                          const grade = enrollment.grade || "";
                          if (grade) {
                            handleGradeChange(enrollment.id, grade);
                          }
                        }}
                        style={{
                          padding: "0.3rem 1rem",
                          borderRadius: "8px",
                          border: "none",
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          color: "white",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: "500",
                          transition: "all 0.3s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
