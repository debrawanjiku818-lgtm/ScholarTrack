"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const passwordStrength = () => {
    if (password.length === 0) return { score: 0, label: "" };
    if (password.length < 4) return { score: 1, label: "Weak", color: "#ef4444" };
    if (password.length < 8) return { score: 2, label: "Fair", color: "#f59e0b" };
    if (password.match(/[A-Z]/) && password.match(/[0-9]/)) return { score: 3, label: "Good", color: "#34d399" };
    return { score: 2, label: "Fair", color: "#f59e0b" };
  };

  const strength = passwordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          email: email || undefined,
          fullName: fullName || undefined,
          role: "STUDENT",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a, #1e293b, #0f172a)",
      padding: "2rem",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "radial-gradient(ellipse at 70% 50%, rgba(236,72,153,0.15) 0%, transparent 50%), radial-gradient(ellipse at 30% 50%, rgba(99,102,241,0.1) 0%, transparent 50%)",
        animation: "spin 30s linear infinite reverse",
      }} />

      <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        borderRadius: "24px",
        padding: "2.5rem",
        maxWidth: "440px",
        width: "100%",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            margin: "0 auto 0.75rem",
            boxShadow: "0 0 40px rgba(236,72,153,0.3)",
          }}>
            🚀
          </div>
          <h1 style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            background: "linear-gradient(135deg, #f8fafc, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Join ScholarTrack
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginTop: "0.25rem" }}>
            Create your free account
          </p>
        </div>

        {success && (
          <div style={{
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.2)",
            borderRadius: "12px",
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            color: "#34d399",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            ✅ Account created! Redirecting to login...
          </div>
        )}

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "12px",
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            color: "#ef4444",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{
              display: "block",
              color: "#94a3b8",
              fontSize: "0.9rem",
              fontWeight: "500",
              marginBottom: "0.4rem",
            }}>
              Username *
            </label>
            <input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.7rem 1rem",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                color: "#f8fafc",
                fontSize: "1rem",
                outline: "none",
                transition: "all 0.3s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                e.currentTarget.style.boxShadow = "0 0 30px rgba(99,102,241,0.05)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{
              display: "block",
              color: "#94a3b8",
              fontSize: "0.9rem",
              fontWeight: "500",
              marginBottom: "0.4rem",
            }}>
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: "100%",
                padding: "0.7rem 1rem",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                color: "#f8fafc",
                fontSize: "1rem",
                outline: "none",
                transition: "all 0.3s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                e.currentTarget.style.boxShadow = "0 0 30px rgba(99,102,241,0.05)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{
              display: "block",
              color: "#94a3b8",
              fontSize: "0.9rem",
              fontWeight: "500",
              marginBottom: "0.4rem",
            }}>
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "0.7rem 1rem",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                color: "#f8fafc",
                fontSize: "1rem",
                outline: "none",
                transition: "all 0.3s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                e.currentTarget.style.boxShadow = "0 0 30px rgba(99,102,241,0.05)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{
              display: "block",
              color: "#94a3b8",
              fontSize: "0.9rem",
              fontWeight: "500",
              marginBottom: "0.4rem",
            }}>
              Password *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  color: "#f8fafc",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "all 0.3s",
                  paddingRight: "3rem",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(99,102,241,0.05)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.8rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  padding: "0.25rem",
                }}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
            {password.length > 0 && (
              <div style={{ marginTop: "0.4rem" }}>
                <div style={{
                  height: "4px",
                  borderRadius: "4px",
                  background: "rgba(255,255,255,0.05)",
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${(strength.score / 3) * 100}%`,
                    height: "100%",
                    background: strength.color,
                    borderRadius: "4px",
                    transition: "width 0.3s",
                  }} />
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "0.2rem",
                  fontSize: "0.75rem",
                  color: strength.color,
                }}>
                  <span>{strength.label}</span>
                  <span style={{ color: "#64748b" }}>
                    {password.length < 4 ? "Too short" : password.length < 8 ? "Add more characters" : "Good"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              color: "#94a3b8",
              fontSize: "0.9rem",
              fontWeight: "500",
              marginBottom: "0.4rem",
            }}>
              Confirm Password *
            </label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.7rem 1rem",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                color: "#f8fafc",
                fontSize: "1rem",
                outline: "none",
                transition: "all 0.3s",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                e.currentTarget.style.boxShadow = "0 0 30px rgba(99,102,241,0.05)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.8rem",
              borderRadius: "12px",
              border: "none",
              background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 0 40px rgba(99,102,241,0.2)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 0 60px rgba(99,102,241,0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 0 40px rgba(99,102,241,0.2)";
            }}
          >
            {loading ? (
              <div style={{
                display: "inline-block",
                width: "20px",
                height: "20px",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTop: "2px solid white",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
            ) : (
              "Create Account 🚀"
            )}
          </button>
        </form>

        <p style={{
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "0.95rem",
          marginTop: "1.5rem",
        }}>
          Already have an account?{" "}
          <Link href="/login" style={{
            color: "#818cf8",
            textDecoration: "none",
            fontWeight: "600",
          }}>
            Sign in instead
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
