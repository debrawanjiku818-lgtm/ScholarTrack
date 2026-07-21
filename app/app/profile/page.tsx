"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface UserProfile { id: number; username: string; email: string; full_name: string; role: string; }

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    fetch(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => { if (res.status === 401) { localStorage.clear(); router.push("/login"); return null; } return res.json(); })
      .then((data) => { if (data) setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="page-loading">Loading profile...</div>;
  if (!profile) return null;

  const roleLabels: Record<string, string> = {
    STUDENT: "Student", STAFF: "Staff", ADMIN: "Administrator",
    PRINCIPAL: "Principal", DEPUTY_PRINCIPAL: "Deputy Principal",
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar"><span>{(profile.full_name || profile.username).charAt(0).toUpperCase()}</span></div>
        <h1>{profile.full_name || profile.username}</h1>
        <span className={`role-badge role-${profile.role.toLowerCase()}`}>{roleLabels[profile.role] || profile.role}</span>
        <div className="profile-details">
          <div className="detail-row"><span className="detail-label">Username</span><span className="detail-value">{profile.username}</span></div>
          <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{profile.email || "Not provided"}</span></div>
          <div className="detail-row"><span className="detail-label">Role</span><span className="detail-value">{roleLabels[profile.role] || profile.role}</span></div>
          <div className="detail-row"><span className="detail-label">User ID</span><span className="detail-value">#{profile.id}</span></div>
        </div>
      </div>
    </div>
  );
}
