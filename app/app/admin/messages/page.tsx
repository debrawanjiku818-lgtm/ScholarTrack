"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Recipient {
  id: number;
  username: string;
  full_name: string;
  role: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [content, setContent] = useState("");
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userStr);
    const role = user.role.toUpperCase();

    if (
      role !== "ADMIN" &&
      role !== "PRINCIPAL" &&
      role !== "DEPUTY_PRINCIPAL"
    ) {
      router.push("/login");
      return;
    }

    setAdminName(user.username || "");
    fetchMessages(token);
    fetchRecipients(token);
  }, [router]);

  const fetchMessages = async (token: string) => {
    try {
      const response = await fetch("http://localhost:4000/messages", {
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

  const fetchRecipients = async (token: string) => {
    try {
      const response = await fetch("http://localhost:4000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRecipients(data.users.filter((u: Recipient) => u.role !== "ADMIN"));
      }
    } catch (error) {
      console.error("Error fetching recipients:", error);
    }
  };

  const sendMessage = async () => {
    const token = localStorage.getItem("token");
    if (!token || !selectedRecipient || !content.trim()) return;

    setSending(true);
    try {
      const response = await fetch("http://localhost:4000/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipient_id: parseInt(selectedRecipient), content }),
      });
      if (response.ok) {
        setContent("");
        setSelectedRecipient("");
        fetchMessages(token);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch(`http://localhost:4000/messages/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMessages(token);
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!adminName) {
    return <p>Redirecting to login...</p>;
  }

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="user-avatar">
            <span>{adminName?.charAt(0).toUpperCase() || "G"}</span>
          </div>
          <div className="user-info">
            <h3>{adminName}</h3>
            <p>Admin</p>
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
          <a href="/admin/schedule" className="nav-item">
            <span>📅</span>
            <span>Schedule</span>
          </a>
          <a href="/admin/students" className="nav-item">
            <span>📈</span>
            <span>Progress</span>
          </a>
          <a href="/admin/messages" className="nav-item active">
            <span>💬</span>
            <span>Messages</span>
          </a>
          <a href="/admin/settings" className="nav-item">
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
            <h1>Messages 💬</h1>
            <p>Send and receive messages with staff and students</p>
          </div>
        </header>

        <div className="card full-width">
          <div className="card-header">
            <h2>✉️ Compose Message</h2>
          </div>
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <select
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
              className="admin-input"
            >
              <option value="">Select recipient</option>
              {recipients.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.full_name || r.username} ({r.role})
                </option>
              ))}
            </select>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message..."
              className="admin-input"
              rows={3}
            />
            <button onClick={sendMessage} disabled={sending} className="btn-primary">
              {sending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </div>

        <div className="card full-width" style={{ marginTop: "20px" }}>
          <div className="card-header">
            <h2>📥 Inbox</h2>
          </div>
          <div className="status-list">
            {loading ? (
              <p>Loading messages...</p>
            ) : messages.length === 0 ? (
              <p>No messages yet</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="status-item"
                  onClick={() => !message.is_read && markAsRead(message.id)}
                  style={{ cursor: message.is_read ? "default" : "pointer" }}
                >
                  <div className="status-label">
                    <span className="message-sender">{message.sender_name}</span>
                    <span className="message-role">{message.sender_role}</span>
                    <span className="message-content">{message.content}</span>
                    <span className="message-time">{new Date(message.created_at).toLocaleString()}</span>
                  </div>
                  <span className={`status-value ${message.is_read ? "" : "online"}`}>
                    {message.is_read ? "Read" : "New"}
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
