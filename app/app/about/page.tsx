"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function About() {
  const [stats, setStats] = useState({ courses: 0, educators: 0, students: 0, schools: 0 });

  useEffect(() => {
    const targets = { courses: 20, educators: 12, students: 1500, schools: 45 };
    const duration = 2000;
    const steps = 60;
    const increment = {
      courses: targets.courses / steps,
      educators: targets.educators / steps,
      students: targets.students / steps,
      schools: targets.schools / steps,
    };
    let current = { courses: 0, educators: 0, students: 0, schools: 0 };
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current.courses = Math.min(current.courses + increment.courses, targets.courses);
      current.educators = Math.min(current.educators + increment.educators, targets.educators);
      current.students = Math.min(current.students + increment.students, targets.students);
      current.schools = Math.min(current.schools + increment.schools, targets.schools);
      setStats({ ...current });
      if (step >= steps) clearInterval(interval);
    }, duration / steps);
  }, []);

  const team = [
    {
      name: "Sarah Chen",
      role: "Founder & CEO",
      bio: "Former educator with 15+ years of experience in EdTech",
      image: "/cs lec.jpg",
    },
    {
      name: "David Lee",
      role: "Head of Academics",
      bio: "PhD in Mathematics, passionate about innovative teaching",
      image: "/maths lec.jpg",
    },
    {
      name: "Maria Garcia",
      role: "Director of Operations",
      bio: "Expert in educational administration and school management",
      image: "/bio lec.jpg",
    },
    {
      name: "James Kim",
      role: "Lead Developer",
      bio: "Full-stack developer with a passion for educational technology",
      image: "/cs.jpg",
    },
  ];

  const testimonials = [
    {
      name: "Alice Johnson",
      role: "Student",
      quote: "ScholarTrack changed my life. The courses are amazing and the instructors are top-notch!",
      image: "/cs.jpg",
    },
    {
      name: "Peter Miller",
      role: "Teacher",
      quote: "I've been teaching for 10 years and this platform has made my job so much easier.",
      image: "/maths.jpg",
    },
    {
      name: "Mary Brown",
      role: "School Principal",
      quote: "The best educational platform I've ever seen. Our students love it!",
      image: "/bio lec.jpg",
    },
  ];

  const timeline = [
    { year: "2022", title: "Founded", desc: "ScholarTrack was founded with a mission to transform education" },
    { year: "2023", title: "First 100 Students", desc: "Reached 100 students in our first year" },
    { year: "2024", title: "20+ Courses", desc: "Expanded to offer over 20 courses across various subjects" },
    { year: "2025", title: "Global Reach", desc: "Reached students from over 50 schools worldwide" },
  ];

  const values = [
    { icon: "🎓", title: "Quality Education", desc: "We believe everyone deserves access to quality education" },
    { icon: "🤝", title: "Community", desc: "Building a supportive community of learners and educators" },
    { icon: "💡", title: "Innovation", desc: "Using technology to create better learning experiences" },
    { icon: "🌍", title: "Accessibility", desc: "Making education accessible to everyone, everywhere" },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K+';
    return Math.round(num) + '+';
  };

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#f8fafc" }}>
      
      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(236,72,153,0.15), rgba(99,102,241,0.1))",
        padding: "5rem 2rem",
        textAlign: "center",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: "-50%",
          right: "-20%",
          width: "50%",
          height: "200%",
          background: "radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <h1 style={{
          fontSize: "clamp(2.5rem, 5vw, 4rem)",
          fontWeight: "800",
          marginBottom: "1rem",
          background: "linear-gradient(135deg, #f8fafc, #818cf8, #ec4899)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          position: "relative",
        }}>
          About ScholarTrack
        </h1>
        <p style={{
          color: "#94a3b8",
          fontSize: "1.2rem",
          maxWidth: "700px",
          margin: "0 auto",
          lineHeight: "1.8",
          position: "relative",
        }}>
          Empowering education through technology. We're on a mission to transform 
          learning and make quality education accessible to everyone.
        </p>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 2rem" }}>

        {/* Stats Section */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1.5rem",
          marginBottom: "4rem",
        }}>
          {[
            { value: stats.courses, label: "Courses", icon: "📚", color: "#818cf8" },
            { value: stats.educators, label: "Expert Educators", icon: "👨‍🏫", color: "#f472b6" },
            { value: stats.students, label: "Students", icon: "👩‍🎓", color: "#34d399" },
            { value: stats.schools, label: "Partner Schools", icon: "🏫", color: "#fbbf24" },
          ].map((item, i) => (
            <div key={i} style={{
              textAlign: "center",
              padding: "1.5rem",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.06)",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.3rem" }}>{item.icon}</div>
              <div style={{
                fontSize: "2.5rem",
                fontWeight: "800",
                background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                {item.value === stats.courses ? formatNumber(item.value) : 
                 item.value === stats.educators ? formatNumber(item.value) :
                 item.value === stats.students ? formatNumber(item.value) :
                 formatNumber(item.value)}
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          marginBottom: "4rem",
        }}>
          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: "20px",
            padding: "2.5rem",
            border: "1px solid rgba(255,255,255,0.06)",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
          }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎯</div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "700", marginBottom: "0.5rem" }}>Our Mission</h2>
            <p style={{ color: "#94a3b8", lineHeight: "1.8" }}>
              To empower learners worldwide with high-quality, accessible, and innovative 
              education through technology.
            </p>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: "20px",
            padding: "2.5rem",
            border: "1px solid rgba(255,255,255,0.06)",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.borderColor = "rgba(236,72,153,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
          }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👁️</div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "700", marginBottom: "0.5rem" }}>Our Vision</h2>
            <p style={{ color: "#94a3b8", lineHeight: "1.8" }}>
              A world where everyone has access to quality education and the opportunity 
              to reach their full potential.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ marginBottom: "4rem" }}>
          <h2 style={{
            fontSize: "2rem",
            fontWeight: "700",
            textAlign: "center",
            marginBottom: "2.5rem",
            background: "linear-gradient(135deg, #f8fafc, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Our Journey
          </h2>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            maxWidth: "700px",
            margin: "0 auto",
          }}>
            {timeline.map((item, i) => (
              <div key={i} style={{
                display: "flex",
                gap: "2rem",
                alignItems: "flex-start",
                padding: "1.5rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.06)",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(5px)";
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              }}
              >
                <div style={{
                  minWidth: "80px",
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  background: "linear-gradient(135deg, #818cf8, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  {item.year}
                </div>
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.2rem" }}>{item.title}</h4>
                  <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Our Values */}
        <div style={{ marginBottom: "4rem" }}>
          <h2 style={{
            fontSize: "2rem",
            fontWeight: "700",
            textAlign: "center",
            marginBottom: "2.5rem",
            background: "linear-gradient(135deg, #f8fafc, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Our Values
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem",
          }}>
            {values.map((value, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: "16px",
                padding: "2rem",
                textAlign: "center",
                border: "1px solid rgba(255,255,255,0.06)",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>{value.icon}</div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "0.5rem" }}>{value.title}</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: "1.6" }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div style={{ marginBottom: "4rem" }}>
          <h2 style={{
            fontSize: "2rem",
            fontWeight: "700",
            textAlign: "center",
            marginBottom: "0.5rem",
            background: "linear-gradient(135deg, #f8fafc, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Meet Our Team
          </h2>
          <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "2.5rem" }}>
            The passionate people behind ScholarTrack
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}>
            {team.map((member, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: "16px",
                padding: "2rem",
                textAlign: "center",
                border: "1px solid rgba(255,255,255,0.06)",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.3)";
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              }}
              >
                <div style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  margin: "0 auto 1rem",
                  position: "relative",
                  border: "3px solid rgba(99,102,241,0.3)",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)";
                  e.currentTarget.style.boxShadow = "0 0 40px rgba(99,102,241,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "0.2rem" }}>{member.name}</h3>
                <p style={{ color: "#818cf8", fontSize: "0.9rem", fontWeight: "500", marginBottom: "0.5rem" }}>{member.role}</p>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: "1.6" }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div style={{ marginBottom: "4rem" }}>
          <h2 style={{
            fontSize: "2rem",
            fontWeight: "700",
            textAlign: "center",
            marginBottom: "0.5rem",
            background: "linear-gradient(135deg, #f8fafc, #94a3b8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            What Our Community Says
          </h2>
          <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "2.5rem" }}>
            Real stories from real people
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}>
            {testimonials.map((item, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)",
                borderRadius: "16px",
                padding: "2rem",
                border: "1px solid rgba(255,255,255,0.06)",
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <div style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    position: "relative",
                    border: "2px solid rgba(99,102,241,0.3)",
                  }}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: "600", fontSize: "1rem" }}>{item.name}</h4>
                    <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{item.role}</p>
                  </div>
                </div>
                <p style={{ color: "#cbd5e1", fontSize: "0.95rem", lineHeight: "1.7", fontStyle: "italic" }}>
                  "{item.quote}"
                </p>
                <div style={{ marginTop: "0.5rem", color: "#fbbf24" }}>⭐⭐⭐⭐⭐</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(236,72,153,0.08))",
          borderRadius: "24px",
          padding: "4rem 2rem",
          textAlign: "center",
          border: "1px solid rgba(99,102,241,0.1)",
        }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", marginBottom: "1rem" }}>
            Ready to Join Us?
          </h2>
          <p style={{ color: "#94a3b8", maxWidth: "500px", margin: "0 auto 2rem", fontSize: "1.1rem" }}>
            Be part of our growing community of learners and educators.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              padding: "0.8rem 2.5rem",
              borderRadius: "50px",
              textDecoration: "none",
              fontWeight: "600",
              boxShadow: "0 0 40px rgba(99,102,241,0.3)",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 0 60px rgba(99,102,241,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 0 40px rgba(99,102,241,0.3)";
            }}
            >
              Get Started 🚀
            </Link>
            <Link href="/courses" style={{
              background: "rgba(255,255,255,0.05)",
              color: "white",
              padding: "0.8rem 2.5rem",
              borderRadius: "50px",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.1)",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}
            >
              Explore Courses 📚
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
