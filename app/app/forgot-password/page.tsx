"use client";
import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("If an account exists with this email, you will receive a password reset link.");
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (error) {
      setError("Failed to connect to server");
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
      background: "#0f172a",
      padding: "2rem",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        borderRadius: "24px",
        padding: "2.5rem",
        maxWidth: "420px",
        width: "100%",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            margin: "0 auto 0.75rem",
            boxShadow: "0 0 40px rgba(99,102,241,0.3)",
          }}>
            🔑
          </div>
          <h1 style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "#f8fafc",
          }}>Forgot Password</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            Enter your email to receive a reset link
          </p>
        </div>

        {message && (
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
            ✅ {message}
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
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              color: "#94a3b8",
              fontSize: "0.9rem",
              fontWeight: "500",
              marginBottom: "0.4rem",
            }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.8rem 1rem",
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
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
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
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p style={{
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "0.95rem",
          marginTop: "1.5rem",
        }}>
          Remember your password?{" "}
          <Link href="/login" style={{
            color: "#818cf8",
            textDecoration: "none",
            fontWeight: "600",
            transition: "color 0.3s",
          }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
