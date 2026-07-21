"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Message { id: number; sender_name: string; sender_role: string; recipient_name: string; recipient_role: string; content: string; is_read: boolean; created_at: string; }
interface User { id: number; username: string; full_name: string; role: string; }

export default function Messages() {
  const [inbox, setInbox] = useState<Message[]>([]);
  const [sent, setSent] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [recipientId, setRecipientId] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => { if (!token) { router.push("/login"); return; } fetchData(); }, [router]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [inboxRes, sentRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/messages`, { headers }), fetch(`${API_URL}/messages/sent`, { headers }), fetch(`${API_URL}/admin/users`, { headers }),
      ]);
      if (inboxRes.ok) setInbox(await inboxRes.json());
      if (sentRes.ok) setSent(await sentRes.json());
      if (usersRes.ok) { const d = await usersRes.json(); setUsers(d.users || d || []); }
    } catch { setError("Failed to load messages"); } finally { setLoading(false); }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault(); if (!recipientId || !content.trim()) return;
    setSendLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipient_id: parseInt(recipientId), content }),
      });
      if (res.ok) { setSuccess("Message sent successfully!"); setContent(""); setRecipientId(""); fetchData(); }
      else { const d = await res.json(); setError(d.message || "Failed to send"); }
    } catch { setError("Failed to send message"); } finally { setSendLoading(false); }
  };

  const markAsRead = async (id: number) => {
    try { await fetch(`${API_URL}/messages/${id}/read`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }); fetchData(); } catch {}
  };

  if (loading) return <div className="page-loading">Loading messages...</div>;
  const messages = activeTab === "inbox" ? inbox : sent;

  return (
    <div className="messages-page">
      <div className="messages-header"><h1>Messages</h1></div>
      <div className="messages-tabs">
        <button className={activeTab === "inbox" ? "tab-active" : "tab"} onClick={() => setActiveTab("inbox")}>Inbox ({inbox.filter((m) => !m.is_read).length})</button>
        <button className={activeTab === "sent" ? "tab-active" : "tab"} onClick={() => setActiveTab("sent")}>Sent</button>
      </div>
      <div className="send-message-form">
        <h3>Send New Message</h3>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSend}>
          <div className="form-group"><label>To</label>
            <select value={recipientId} onChange={(e) => setRecipientId(e.target.value)} required className="form-select">
              <option value="">Select recipient...</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.username} ({u.role})</option>)}
            </select>
          </div>
          <div className="form-group"><label>Message</label><textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Type your message..." required rows={3} className="form-textarea" /></div>
          <button type="submit" disabled={sendLoading} className="btn-primary">{sendLoading ? "Sending..." : "Send Message"}</button>
        </form>
      </div>
      <div className="messages-list">
        {messages.length === 0 ? <div className="empty-state"><p>No messages {activeTab === "inbox" ? "in your inbox" : "sent yet"}</p></div> :
          messages.map((msg) => (
            <div key={msg.id} className={`message-card ${!msg.is_read && activeTab === "inbox" ? "unread" : ""}`} onClick={() => activeTab === "inbox" && !msg.is_read ? markAsRead(msg.id) : undefined}>
              <div className="message-header">
                <span className="message-from">{activeTab === "inbox" ? `From: ${msg.sender_name || "Unknown"} (${msg.sender_role || "Unknown"})` : `To: ${msg.recipient_name || "Unknown"} (${msg.recipient_role || "Unknown"})`}</span>
                <span className="message-time">{new Date(msg.created_at).toLocaleString()}</span>
              </div>
              <p className="message-content">{msg.content}</p>
              {activeTab === "inbox" && !msg.is_read && <span className="unread-badge">New</span>}
            </div>
          ))}
      </div>
    </div>
  );
}
