"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Schedule {
  id: number;
  course_id: number;
  day: string;
  start_time: string;
  end_time: string;
  course: { name: string };
}

export default function StaffSchedule() {
  const [schedule, setSchedule] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchSchedule(token);
  }, []);

  const fetchSchedule = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/schedule`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSchedule(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const getDaySchedule = (day: string) => {
    return schedule.filter(s => s.day === day);
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
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
          Loading schedule...
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
          📅 My Schedule
        </h1>
        <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
          {schedule.length} classes scheduled this week
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}>
          {days.map((day) => {
            const daySchedule = getDaySchedule(day);
            return (
              <div key={day} style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: "16px",
                padding: "1.5rem",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <h3 style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  color: "#f8fafc",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}>
                  {day}
                </h3>
                {daySchedule.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: "0.9rem", fontStyle: "italic" }}>
                    No classes
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {daySchedule.map((item) => (
                      <div key={item.id} style={{
                        background: "rgba(99,102,241,0.08)",
                        borderRadius: "10px",
                        padding: "0.75rem 1rem",
                        border: "1px solid rgba(99,102,241,0.1)",
                      }}>
                        <div style={{ fontWeight: "600", color: "#f8fafc", fontSize: "0.95rem" }}>
                          {item.course?.name || "Unknown Course"}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                          {item.start_time} - {item.end_time}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
