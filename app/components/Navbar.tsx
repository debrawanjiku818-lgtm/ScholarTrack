"use client";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src="/logo.jpg" alt="Logo" className="logo" />
        <span className="brand-name">ScholerTrack</span>
      </div>
      <ul className="navbar-links">
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/courses">Courses</a></li>
        <li><a href="/login" className="login-btn">Login</a></li>
      </ul>
    </nav>
  );
}
