"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export default function PrincipalTeachers() {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchStaff(token);
  }, []);

  const fetchStaff = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const staffUsers = (data.users || []).filter(
          (u: User) => u.role === "STAFF" || u.role === "PRINCIPAL" || u.role === "DEPUTY_PRINCIPAL"
        );
        setStaff(staffUsers);
      }
    } catch (error) {
      console.error(error);
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
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👨‍🏫</div>
          Loading teachers...
        </div>
      </div>
    );
  }

  const activeStaff = staff.filter(s => s.is_active).length;

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
          👨‍🏫 Teachers & Staff
        </h1>
        <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
          {staff.length} total staff members • {activeStaff} active
        </p>

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
                <th style={{ padding: "1rem", textAlign: "left", color: "#94a3b8", fontWeight: "500", fontSize: "0.85rem" }}>Name</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#94a3b8", fontWeight: "500", fontSize: "0.85rem" }}>Username</th>
                <th style={{ padding: "1rem", textAlign: "left", color: "#94a3b8", fontWeight: "500", fontSize: "0.85rem" }}>Email</th>
                <th style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", fontWeight: "500", fontSize: "0.85rem" }}>Role</th>
                <th style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", fontWeight: "500", fontSize: "0.85rem" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
                    No staff members found
                  </td>
                </tr>
              ) : (
                staff.map((user) => (
                  <tr
                    key={user.id}
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
                    <td style={{ padding: "1rem", color: "#f8fafc" }}>{user.full_name || "-"}</td>
                    <td style={{ padding: "1rem", color: "#f8fafc" }}>{user.username}</td>
                    <td style={{ padding: "1rem", color: "#94a3b8" }}>{user.email || "-"}</td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "0.2rem 0.8rem",
                        borderRadius: "50px",
                        background: `${getRoleColor(user.role)}22`,
                        color: getRoleColor(user.role),
                        fontSize: "0.75rem",
                        fontWeight: "600",
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <span style={{
                        color: user.is_active ? "#34d399" : "#ef4444",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                      }}>
                        {user.is_active ? "✅ Active" : "❌ Inactive"}
                      </span>
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
