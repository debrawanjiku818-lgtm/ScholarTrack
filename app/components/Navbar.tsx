"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.8rem 2rem',
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <Image
              src="/logo.jpg"
              alt="ScholarTrack Logo"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <span style={{
            fontSize: '1.3rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>ScholarTrack</span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem' }}>Home</Link>
        <Link href="/about" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem' }}>About</Link>
        <Link href="/courses" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem' }}>Courses</Link>
        
        {user ? (
          <>
            <Link href="/dashboard" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' }}>
              📊 Dashboard
            </Link>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.3rem 0.8rem',
              borderRadius: '50px',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.15)',
            }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                👤 {user.full_name || user.username}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: 'rgba(239,68,68,0.15)',
                  color: '#ef4444',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '50px',
                  border: '1px solid rgba(239,68,68,0.15)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                }}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link href="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem' }}>Sign In</Link>
            <Link href="/register" style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              padding: '0.5rem 1.5rem',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.95rem',
              transition: 'all 0.3s',
            }}>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
