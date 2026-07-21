"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Hero() {
  const [stats, setStats] = useState({ students: 0, schools: 0, courses: 0 });
  const [typedText, setTypedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  
  const fullText = "Empowering Education Through Technology";

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
      }
    }, 80);

    const animateStats = () => {
      const targets = { students: 2000000, schools: 800, courses: 1200 };
      const duration = 2500;
      const steps = 80;
      const increment = {
        students: targets.students / steps,
        schools: targets.schools / steps,
        courses: targets.courses / steps,
      };
      let current = { students: 0, schools: 0, courses: 0 };
      let step = 0;

      const statsInterval = setInterval(() => {
        step++;
        current.students = Math.min(current.students + increment.students, targets.students);
        current.schools = Math.min(current.schools + increment.schools, targets.schools);
        current.courses = Math.min(current.courses + increment.courses, targets.courses);
        setStats({ ...current });
        if (step >= steps) clearInterval(statsInterval);
      }, duration / steps);
    };
    animateStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return Math.round(num);
  };

  const featuredCourses = [
    { icon: "/cs.jpg", name: "Computer Science" },
    { icon: "/maths.jpg", name: "Mathematics" },
    { icon: "/physics.jpg", name: "Physics" },
    { icon: "/chemistry.jpg", name: "Chemistry" },
    { icon: "/biology.jpg", name: "Biology" },
    { icon: "/history.jpg", name: "History" },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      quote: "This platform transformed how I learn. The AI tutoring is amazing!",
      image: "/cs lec.jpg",
    },
    {
      name: "David Lee",
      role: "Mathematics Teacher",
      quote: "I've been teaching for 15 years and this is the best platform I've ever used.",
      image: "/maths lec.jpg",
    },
    {
      name: "Maria Garcia",
      role: "School Principal",
      quote: "Student engagement increased by 40% since we started using this platform.",
      image: "/bio lec.jpg",
    },
  ];

  return (
    <main style={{ minHeight: "100vh", background: "#0f172a", color: "#f8fafc", overflow: "hidden" }}>
      
      {/* Hero Section */}
      <section style={{
        padding: "4rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "4rem",
        alignItems: "center",
        minHeight: "80vh",
      }}>
        {/* Left Side */}
        <div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}>
            <div style={{
              width: "50px",
              height: "50px",
              borderRadius: "12px",
              overflow: "hidden",
              position: "relative",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              <Image
                src="/logo.jpg"
                alt="ScholarTrack Logo"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div style={{
              display: "inline-block",
              padding: "0.5rem 1.5rem",
              borderRadius: "50px",
              background: "rgba(99,102,241,0.2)",
              color: "#a5b4fc",
              fontSize: "0.8rem",
              fontWeight: "600",
              border: "1px solid rgba(99,102,241,0.2)",
            }}>
              ⚡ Next-Gen Education Platform
            </div>
          </div>

          <h1 style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: "800",
            lineHeight: "1.1",
            marginBottom: "1.5rem",
          }}>
            <span style={{
              background: "linear-gradient(135deg, #f8fafc, #818cf8, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {typedText}
              {!isTypingComplete && (
                <span style={{
                  display: "inline-block",
                  width: "3px",
                  height: "1em",
                  background: "#818cf8",
                  animation: "blink 1s step-end infinite",
                  marginLeft: "2px",
                }} />
              )}
            </span>
          </h1>

          <p style={{
            fontSize: "1.2rem",
            color: "#94a3b8",
            lineHeight: "1.8",
            marginBottom: "2rem",
          }}>
            Transform your learning journey with our innovative platform designed for modern education.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/register" style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "white",
              padding: "0.8rem 2rem",
              borderRadius: "50px",
              textDecoration: "none",
              fontWeight: "600",
              boxShadow: "0 0 40px rgba(99,102,241,0.3)",
              transition: "all 0.3s",
            }}>
              🚀 Get Started
            </Link>
            <Link href="/courses" style={{
              background: "rgba(255,255,255,0.05)",
              color: "white",
              padding: "0.8rem 2rem",
              borderRadius: "50px",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              📚 Browse Courses
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex",
            gap: "3rem",
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: "700", background: "linear-gradient(135deg, #818cf8, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {formatNumber(stats.students)}+
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Students</div>
            </div>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: "700", background: "linear-gradient(135deg, #f472b6, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {formatNumber(stats.schools)}+
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Schools</div>
            </div>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: "700", background: "linear-gradient(135deg, #34d399, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {formatNumber(stats.courses)}+
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Courses</div>
            </div>
          </div>
        </div>

        {/* Right Side - Images */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}>
          <div style={{
            borderRadius: "16px",
            overflow: "hidden",
            position: "relative",
            height: "200px",
          }}>
            <Image
              src="/cs.jpg"
              alt="Computer Science"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <div style={{
            borderRadius: "16px",
            overflow: "hidden",
            position: "relative",
            height: "200px",
          }}>
            <Image
              src="/maths.jpg"
              alt="Mathematics"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <div style={{
            borderRadius: "16px",
            overflow: "hidden",
            position: "relative",
            height: "200px",
          }}>
            <Image
              src="/physics.jpg"
              alt="Physics"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
          <div style={{
            borderRadius: "16px",
            overflow: "hidden",
            position: "relative",
            height: "200px",
          }}>
            <Image
              src="/chemistry.jpg"
              alt="Chemistry"
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section style={{
        padding: "4rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <h2 style={{
          fontSize: "2rem",
          fontWeight: "700",
          textAlign: "center",
          marginBottom: "2.5rem",
          background: "linear-gradient(135deg, #f8fafc, #94a3b8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          📚 Featured Courses
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1.5rem",
        }}>
          {featuredCourses.map((course, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: "16px",
              padding: "1rem",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.06)",
              transition: "all 0.3s",
              cursor: "pointer",
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
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "12px",
                overflow: "hidden",
                margin: "0 auto 0.5rem",
                position: "relative",
              }}>
                <Image
                  src={course.icon}
                  alt={course.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <h4 style={{ color: "#f8fafc", fontSize: "0.85rem" }}>{course.name}</h4>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/courses" style={{
            color: "#818cf8",
            textDecoration: "none",
            fontSize: "1.05rem",
            fontWeight: "500",
          }}>
            View All Courses →
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{
        padding: "4rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <h2 style={{
          fontSize: "2rem",
          fontWeight: "700",
          textAlign: "center",
          marginBottom: "0.5rem",
          background: "linear-gradient(135deg, #f8fafc, #94a3b8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Meet Our Expert Educators
        </h2>
        <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: "2.5rem" }}>
          Learn from the best in the industry
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
        }}>
          {testimonials.map((item, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: "16px",
              padding: "2rem",
              border: "1px solid rgba(255,255,255,0.06)",
              textAlign: "center",
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
              <div style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                overflow: "hidden",
                margin: "0 auto 1rem",
                position: "relative",
                border: "3px solid rgba(99,102,241,0.3)",
              }}>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <h4 style={{ color: "#f8fafc", fontSize: "1.1rem" }}>{item.name}</h4>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.5rem" }}>{item.role}</p>
              <p style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: "1.6", fontStyle: "italic" }}>
                "{item.quote}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        padding: "4rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.1))",
          borderRadius: "24px",
          padding: "4rem 2rem",
          textAlign: "center",
          border: "1px solid rgba(99,102,241,0.1)",
        }}>
          <h2 style={{
            fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
            marginBottom: "1rem",
          }}>
            Ready to Transform Your Learning Journey?
          </h2>
          <p style={{ color: "#94a3b8", maxWidth: "500px", margin: "0 auto 2rem", fontSize: "1.1rem" }}>
            Join thousands of students already using ScholarTrack.
          </p>
          <Link href="/register" style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "white",
            padding: "1rem 3rem",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: "600",
            display: "inline-block",
            boxShadow: "0 0 60px rgba(99,102,241,0.3)",
            transition: "all 0.3s",
          }}>
            Get Started Now 🚀
          </Link>
        </div>
      </section>

      {/* Footer with Logo */}
      <footer style={{
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "3rem 2rem 1.5rem",
        marginTop: "4rem",
        width: "100%",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2.5rem",
            marginBottom: "2rem",
          }}>
            {/* Brand with Logo */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <div style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "10px",
                  overflow: "hidden",
                  position: "relative",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}>
                  <Image
                    src="/logo.jpg"
                    alt="ScholarTrack Logo"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <h3 style={{
                  fontSize: "1.5rem",
                  background: "linear-gradient(135deg, #6366f1, #ec4899)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  ScholarTrack
                </h3>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: "1.6" }}>
                Empowering Education Through Technology
              </p>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <span style={{ fontSize: "1.3rem", cursor: "pointer", opacity: 0.7 }}>🐦</span>
                <span style={{ fontSize: "1.3rem", cursor: "pointer", opacity: 0.7 }}>📘</span>
                <span style={{ fontSize: "1.3rem", cursor: "pointer", opacity: 0.7 }}>📷</span>
                <span style={{ fontSize: "1.3rem", cursor: "pointer", opacity: 0.7 }}>💼</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{ color: "#f8fafc", marginBottom: "1rem", fontSize: "1rem" }}>Quick Links</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <Link href="/" style={{ color: "#94a3b8", textDecoration: "none", transition: "color 0.3s" }}>Home</Link>
                <Link href="/about" style={{ color: "#94a3b8", textDecoration: "none", transition: "color 0.3s" }}>About</Link>
                <Link href="/courses" style={{ color: "#94a3b8", textDecoration: "none", transition: "color 0.3s" }}>Courses</Link>
                <Link href="/contact" style={{ color: "#94a3b8", textDecoration: "none", transition: "color 0.3s" }}>Contact</Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ color: "#f8fafc", marginBottom: "1rem", fontSize: "1rem" }}>Contact Us</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", color: "#94a3b8" }}>
                <span>📞 0142480452</span>
                <span>📧 contact@scholartrack.com</span>
                <span>📍 Virtual Campus</span>
              </div>
            </div>
          </div>

          <div style={{
            textAlign: "center",
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            color: "#64748b",
            fontSize: "0.85rem",
          }}>
            <p>&copy; {new Date().getFullYear()} ScholarTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </main>
  );
}
