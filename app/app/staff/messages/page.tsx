"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender: { username: string; full_name: string };
  receiver: { username: string; full_name: string };
}

export default function StaffMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"inbox" | "sent">("inbox");
  const [newMessage, setNewMessage] = useState({ to: "", subject: "", content: "" });
  const [showCompose, setShowCompose] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchMessages(token);
  }, []);

  const fetchMessages = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMessage),
      });
      if (response.ok) {
        setNewMessage({ to: "", subject: "", content: "" });
        setShowCompose(false);
        fetchMessages(token!);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = async (messageId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId ? { ...msg, is_read: true } : msg
          )
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredMessages = selectedTab === "inbox"
    ? messages.filter(m => !m.sender_id || m.sender_id !== 0)
    : messages.filter(m => m.sender_id === 0);

  const unreadCount = messages.filter(m => !m.is_read).length;

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
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</div>
          Loading messages...
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}>
          <div>
            <h1 style={{
              fontSize: "2rem",
              fontWeight: "700",
              background: "linear-gradient(135deg, #f8fafc, #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              💬 Messages
            </h1>
            <p style={{ color: "#94a3b8" }}>
              {unreadCount > 0 ? `📩 ${unreadCount} unread messages` : "All caught up! 🎉"}
            </p>
          </div>
          <button
            onClick={() => setShowCompose(!showCompose)}
            style={{
              padding: "0.6rem 1.5rem",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            ✏️ New Message
          </button>
        </div>

        {/* Compose Message */}
        {showCompose && (
          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: "16px",
            padding: "1.5rem",
            border: "1px solid rgba(255,255,255,0.06)",
            marginBottom: "2rem",
          }}>
            <form onSubmit={handleSendMessage}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ color: "#94a3b8", fontSize: "0.9rem", display: "block", marginBottom: "0.3rem" }}>
                  To (username)
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={newMessage.to}
                  onChange={(e) => setNewMessage({ ...newMessage, to: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "0.7rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    color: "#f8fafc",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ color: "#94a3b8", fontSize: "0.9rem", display: "block", marginBottom: "0.3rem" }}>
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Enter subject"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "0.7rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    color: "#f8fafc",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ color: "#94a3b8", fontSize: "0.9rem", display: "block", marginBottom: "0.3rem" }}>
                  Message
                </label>
                <textarea
                  placeholder="Type your message..."
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  required
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "0.7rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    color: "#f8fafc",
                    fontSize: "1rem",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="submit"
                  style={{
                    padding: "0.6rem 1.5rem",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Send Message ✉️
                </button>
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  style={{
                    padding: "0.6rem 1.5rem",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "transparent",
                    color: "#94a3b8",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}>
          <button
            onClick={() => setSelectedTab("inbox")}
            style={{
              padding: "0.5rem 1.5rem",
              borderRadius: "50px",
              border: selectedTab === "inbox"
                ? "1px solid rgba(99,102,241,0.4)"
                : "1px solid rgba(255,255,255,0.08)",
              background: selectedTab === "inbox"
                ? "rgba(99,102,241,0.2)"
                : "rgba(255,255,255,0.03)",
              color: selectedTab === "inbox" ? "#a5b4fc" : "#94a3b8",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          >
            📥 Inbox {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={() => setSelectedTab("sent")}
            style={{
              padding: "0.5rem 1.5rem",
              borderRadius: "50px",
              border: selectedTab === "sent"
                ? "1px solid rgba(99,102,241,0.4)"
                : "1px solid rgba(255,255,255,0.08)",
              background: selectedTab === "sent"
                ? "rgba(99,102,241,0.2)"
                : "rgba(255,255,255,0.03)",
              color: selectedTab === "sent" ? "#a5b4fc" : "#94a3b8",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          >
            📤 Sent
          </button>
        </div>

        {/* Messages List */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}>
          {filteredMessages.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "3rem 2rem",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📭</div>
              <p style={{ color: "#94a3b8" }}>No messages in {selectedTab}</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => markAsRead(message.id)}
                style={{
                  background: message.is_read
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(99,102,241,0.08)",
                  borderRadius: "12px",
                  padding: "1rem 1.2rem",
                  border: message.is_read
                    ? "1px solid rgba(255,255,255,0.06)"
                    : "1px solid rgba(99,102,241,0.15)",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: "600", color: "#f8fafc" }}>
                        {message.sender?.full_name || message.sender?.username || "Unknown"}
                      </span>
                      {!message.is_read && (
                        <span style={{
                          fontSize: "0.6rem",
                          background: "rgba(99,102,241,0.3)",
                          padding: "0.1rem 0.5rem",
                          borderRadius: "50px",
                          color: "#a5b4fc",
                        }}>
                          New
                        </span>
                      )}
                    </div>
                    <h4 style={{ color: "#f8fafc", fontSize: "1rem", marginBottom: "0.1rem" }}>
                      {message.subject}
                    </h4>
                    <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "0.1rem" }}>
                      {message.content}
                    </p>
                  </div>
                  <div style={{
                    color: "#64748b",
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap",
                  }}>
                    {new Date(message.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
