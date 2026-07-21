"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Course {
  id: number;
  name: string;
  description: string;
  image_url: string;
  is_active: boolean;
}

const categories = ["All", "Mathematics", "Science", "Programming", "Business", "Design"];

const getCategory = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes("math") || lower.includes("mathematics")) return "Mathematics";
  if (lower.includes("physics") || lower.includes("chemistry") || lower.includes("biology") || lower.includes("science")) return "Science";
  if (lower.includes("web") || lower.includes("data") || lower.includes("cloud") || lower.includes("devops") || lower.includes("cyber") || lower.includes("blockchain") || lower.includes("python") || lower.includes("java") || lower.includes("javascript") || lower.includes("sql") || lower.includes("programming")) return "Programming";
  if (lower.includes("mobile") || lower.includes("ui") || lower.includes("ux") || lower.includes("design")) return "Design";
  if (lower.includes("digital") || lower.includes("business") || lower.includes("project") || lower.includes("management")) return "Business";
  return "Programming";
};

const getImage = (name: string): string | null => {
  const lower = name.toLowerCase();
  if (lower.includes("math")) return "/maths.jpg";
  if (lower.includes("physics")) return "/physics.jpg";
  if (lower.includes("chemistry")) return "/chemistry.jpg";
  if (lower.includes("biology")) return "/biology.jpg";
  if (lower.includes("cs") || lower.includes("computer science")) return "/cs.jpg";
  return null;
};

const getGradient = (name: string): string => {
  const gradients = [
    "linear-gradient(135deg, #818cf8, #6366f1)",
    "linear-gradient(135deg, #f472b6, #ec4899)",
    "linear-gradient(135deg, #34d399, #10b981)",
    "linear-gradient(135deg, #fbbf24, #f59e0b)",
    "linear-gradient(135deg, #60a5fa, #3b82f6)",
    "linear-gradient(135deg, #a78bfa, #8b5cf6)",
    "linear-gradient(135deg, #fb923c, #f97316)",
    "linear-gradient(135deg, #2dd4bf, #14b8a6)",
    "linear-gradient(135deg, #f472b6, #db2777)",
    "linear-gradient(135deg, #818cf8, #4f46e5)",
  ];
  const index = name.length % gradients.length;
  return gradients[index];
};

const getIcon = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes("math")) return "📐";
  if (lower.includes("physics")) return "⚛️";
  if (lower.includes("chemistry")) return "🧪";
  if (lower.includes("biology")) return "🧬";
  if (lower.includes("web")) return "🌐";
  if (lower.includes("data")) return "📊";
  if (lower.includes("mobile")) return "📱";
  if (lower.includes("cloud")) return "☁️";
  if (lower.includes("devops")) return "⚙️";
  if (lower.includes("cyber")) return "🔒";
  if (lower.includes("blockchain")) return "⛓️";
  if (lower.includes("design")) return "🎨";
  if (lower.includes("python")) return "🐍";
  if (lower.includes("java")) return "☕";
  if (lower.includes("javascript")) return "🟨";
  if (lower.includes("sql")) return "🗄️";
  if (lower.includes("business")) return "💼";
  if (lower.includes("project")) return "📋";
  if (lower.includes("digital")) return "📈";
  return "📚";
};

const getLevel = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes("beginner") || lower.includes("fundamentals") || lower.includes("101")) return "Beginner";
  if (lower.includes("advanced") || lower.includes("master") || lower.includes("expert")) return "Advanced";
  return "Intermediate";
};

const getDuration = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes("bootcamp") || lower.includes("masterclass")) return "12 weeks";
  if (lower.includes("fundamentals") || lower.includes("101")) return "6 weeks";
  return "8 weeks";
};

const getRating = (id: number): { stars: string; score: number } => {
  const ratings = [4.0, 4.5, 4.8, 3.8, 4.2, 4.9, 4.3, 4.6, 3.9, 4.7];
  const score = ratings[id % ratings.length];
  const fullStars = Math.floor(score);
  const halfStar = score - fullStars >= 0.5;
  let stars = "⭐".repeat(fullStars);
  if (halfStar) stars += "½";
  if (stars.length === 0) stars = "⭐";
  return { stars, score };
};

const isFeatured = (id: number): boolean => {
  return id % 3 === 0;
};

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<any>(null);
  const [myEnrollments, setMyEnrollments] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (userStr && token) {
      setUser(JSON.parse(userStr));
      fetchMyEnrollments(token);
    }
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      let filtered = courses;
      if (selectedCategory !== "All") {
        filtered = filtered.filter(c => getCategory(c.name) === selectedCategory);
      }
      if (searchTerm.trim()) {
        filtered = filtered.filter(c =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (sortBy === "popular") {
        filtered = [...filtered].sort((a, b) => {
          const ratingA = getRating(a.id).score;
          const ratingB = getRating(b.id).score;
          return ratingB - ratingA;
        });
      } else if (sortBy === "alphabetical") {
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      }
      setFilteredCourses(filtered);
    }
  }, [courses, searchTerm, selectedCategory, sortBy]);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/courses`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
        setFilteredCourses(data.courses || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEnrollments = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/enrollments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const enrollments = await res.json();
        setMyEnrollments(enrollments.map((e: any) => e.course_id || e.id));
      }
    } catch {
      // silent
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleEnroll = async (courseId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ course_id: courseId }),
      });
      if (res.ok) {
        showNotification("✅ Successfully enrolled!");
        fetchMyEnrollments(token);
      } else {
        const data = await res.json();
        showNotification(data.message || "❌ Enrollment failed");
      }
    } catch {
      showNotification("❌ Failed to enroll");
    }
  };

  const handleUnenroll = async (courseId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/enrollments/${courseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showNotification("✅ Successfully unenrolled");
        fetchMyEnrollments(token);
      }
    } catch {
      showNotification("❌ Failed to unenroll");
    }
  };

  const canManageCourses = user?.role === "ADMIN" || user?.role === "PRINCIPAL" || user?.role === "DEPUTY_PRINCIPAL";
  const isStudent = user?.role === "STUDENT";

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
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
          Loading courses...
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh" }}>
      <div style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(236,72,153,0.1))",
        padding: "4rem 2rem",
        textAlign: "center",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <h1 style={{
          fontSize: "clamp(2.5rem, 5vw, 4rem)",
          fontWeight: "800",
          marginBottom: "0.5rem",
          background: "linear-gradient(135deg, #f8fafc, #818cf8, #ec4899)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          🎓 Available Courses
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}>
          Discover {filteredCourses.length} courses designed to help you grow and succeed
        </p>
      </div>

      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem 1.5rem 4rem",
      }}>
        {notification && (
          <div style={{
            position: "fixed",
            top: "80px",
            right: "20px",
            background: notification.includes("✅") ? "#10b981" : "#ef4444",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            zIndex: 1000,
            fontWeight: "500",
          }}>
            {notification}
          </div>
        )}

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                color: "#f8fafc",
                fontSize: "0.9rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="default">Sort by: Default</option>
              <option value="popular">⭐ Popular</option>
              <option value="alphabetical">🔤 Alphabetical</option>
            </select>
            {canManageCourses && (
              <button
                onClick={() => router.push("/admin?tab=courses")}
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white",
                  padding: "0.5rem 1.5rem",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                ⚙️ Manage
              </button>
            )}
          </div>
        </div>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
          alignItems: "center",
        }}>
          <input
            type="text"
            placeholder="🔍 Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: "200px",
              padding: "0.7rem 1rem",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: "#f8fafc",
              fontSize: "1rem",
              outline: "none",
              transition: "all 0.3s",
            }}
          />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "0.4rem 1.2rem",
                  borderRadius: "50px",
                  border: selectedCategory === cat
                    ? "1px solid rgba(99,102,241,0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                  background: selectedCategory === cat
                    ? "rgba(99,102,241,0.2)"
                    : "rgba(255,255,255,0.03)",
                  color: selectedCategory === cat ? "#a5b4fc" : "#94a3b8",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  transition: "all 0.3s",
                  fontWeight: "500",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.05)",
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
            <h3 style={{ color: "#f8fafc", marginBottom: "0.5rem" }}>No courses found</h3>
            <p style={{ color: "#94a3b8" }}>Try adjusting your search or filter</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}>
            {filteredCourses.map((course, index) => {
              const isEnrolled = myEnrollments.includes(course.id);
              const category = getCategory(course.name);
              const image = getImage(course.name);
              const icon = getIcon(course.name);
              const gradient = getGradient(course.name);
              const level = getLevel(course.name);
              const duration = getDuration(course.name);
              const rating = getRating(course.id);
              const featured = isFeatured(course.id);

              return (
                <div
                  key={course.id}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.06)",
                    overflow: "hidden",
                    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    backdropFilter: "blur(10px)",
                    cursor: "default",
                    opacity: 0,
                    animation: `fadeInUp 0.6s ease forwards ${index * 0.05}s`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-10px)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
                    e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{
                    height: "160px",
                    position: "relative",
                    overflow: "hidden",
                    background: image ? "transparent" : gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {image ? (
                      <Image
                        src={image}
                        alt={course.name}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontSize: "5rem", opacity: 0.8 }}>{icon}</span>
                    )}
                    
                    <div style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      display: "flex",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}>
                      <span style={{
                        fontSize: "0.6rem",
                        background: "rgba(0,0,0,0.6)",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "50px",
                        color: "#94a3b8",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}>
                        {category}
                      </span>
                      <span style={{
                        fontSize: "0.6rem",
                        background: "rgba(0,0,0,0.6)",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "50px",
                        color: "#fbbf24",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}>
                        {level}
                      </span>
                      {featured && (
                        <span style={{
                          fontSize: "0.6rem",
                          background: "rgba(251,191,36,0.2)",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "50px",
                          color: "#fbbf24",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(251,191,36,0.3)",
                        }}>
                          🔥 Featured
                        </span>
                      )}
                    </div>
                    {isEnrolled && (
                      <div style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        fontSize: "0.6rem",
                        background: "rgba(16,185,129,0.2)",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "50px",
                        color: "#10b981",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(16,185,129,0.3)",
                      }}>
                        ✅ Enrolled
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "1.2rem 1.5rem" }}>
                    <h3 style={{
                      fontSize: "1.05rem",
                      fontWeight: "700",
                      marginBottom: "0.3rem",
                      color: "#f8fafc",
                    }}>
                      {course.name}
                    </h3>
                    <p style={{
                      color: "#94a3b8",
                      fontSize: "0.85rem",
                      lineHeight: "1.5",
                      minHeight: "2.5rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>
                      {course.description || "No description available"}
                    </p>

                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "0.8rem",
                      paddingTop: "0.8rem",
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ color: "#fbbf24", fontSize: "0.85rem" }}>{rating.stars}</span>
                        <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{rating.score.toFixed(1)}</span>
                      </div>
                      <div>
                        <span style={{ color: "#64748b", fontSize: "0.7rem" }}>{duration}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: "0.8rem 1.5rem",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    {user && isStudent ? (
                      isEnrolled ? (
                        <button
                          onClick={() => handleUnenroll(course.id)}
                          style={{
                            padding: "0.4rem 1.2rem",
                            borderRadius: "10px",
                            border: "1px solid rgba(239,68,68,0.3)",
                            background: "rgba(239,68,68,0.1)",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            fontWeight: "500",
                            transition: "all 0.3s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                          }}
                        >
                          Unenroll
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course.id)}
                          style={{
                            padding: "0.4rem 1.5rem",
                            borderRadius: "10px",
                            border: "none",
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            fontWeight: "600",
                            transition: "all 0.3s",
                            boxShadow: "0 0 30px rgba(99,102,241,0.2)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.boxShadow = "0 0 40px rgba(99,102,241,0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "0 0 30px rgba(99,102,241,0.2)";
                          }}
                        >
                          Enroll Now
                        </button>
                      )
                    ) : !user ? (
                      <button
                        onClick={() => router.push("/login")}
                        style={{
                          padding: "0.4rem 1.2rem",
                          borderRadius: "10px",
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.05)",
                          color: "#94a3b8",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          transition: "all 0.3s",
                        }}
                      >
                        Sign In to Enroll
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
