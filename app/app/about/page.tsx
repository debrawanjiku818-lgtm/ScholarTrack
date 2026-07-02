export default function About() {
  const features = [
    { icon: "🔑", title: "Secure Login", desc: "Students and admins log in safely with encrypted authentication.", gradient: "from-blue-500 to-cyan-400" },
    { icon: "📚", title: "Course Browsing", desc: "View courses with images and detailed descriptions.", gradient: "from-green-500 to-emerald-400" },
    { icon: "🛡️", title: "Protected Enrollment", desc: "Only logged-in students can enroll in courses.", gradient: "from-orange-500 to-amber-400" },
    { icon: "👨‍💼", title: "Admin Tools", desc: "Admins manage courses and student data efficiently.", gradient: "from-purple-500 to-pink-400" },
    { icon: "🔍", title: "Search & Filter", desc: "Quickly find courses by name with instant search.", gradient: "from-red-500 to-rose-400" },
    { icon: "📊", title: "Analytics Dashboard", desc: "Track progress and view detailed statistics.", gradient: "from-indigo-500 to-violet-400" },
  ];

  const stats = [
    { value: "8+", label: "Available Courses" },
    { value: "100%", label: "Secure Platform" },
    { value: "24/7", label: "Access" },
    { value: "∞", label: "Learning Potential" },
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>About ScholarTrack</h1>
          <p className="hero-subtitle">
            A modern school management platform built with cutting-edge technology
            to streamline education and empower learning.
          </p>
          <div className="hero-description">
            <p>
              ScholarTrack is a demo school-style platform built to showcase modern web
              development skills. It includes authentication, dashboards, and course
              management features designed for both students and administrators.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="about-features">
        <div className="section-header">
          <h2>Key Features</h2>
          <p>Everything you need for a modern learning experience</p>
        </div>
        <div className="feature-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card-modern">
              <div className={`feature-icon-modern ${f.gradient}`}>
                <span>{f.icon}</span>
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-mission">
        <div className="mission-card">
          <h2>Our Mission</h2>
          <p>
            To provide a seamless, secure, and intuitive platform that bridges the gap 
            between students and educational resources. We believe in making quality 
            education accessible through technology.
          </p>
          <div className="mission-points">
            <div className="mission-point">
              <span className="point-icon">✨</span>
              <span>Modern Design</span>
            </div>
            <div className="mission-point">
              <span className="point-icon">🔒</span>
              <span>Secure & Private</span>
            </div>
            <div className="mission-point">
              <span className="point-icon">⚡</span>
              <span>Fast & Responsive</span>
            </div>
            <div className="mission-point">
              <span className="point-icon">🎯</span>
              <span>User-Focused</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
