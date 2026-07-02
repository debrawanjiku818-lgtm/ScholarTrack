"use client";

import { useState } from 'react';

export default function Navbar() {
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

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
        <li className="login-dropdown">
          <button 
            className="login-btn"
            onClick={() => setShowLoginDropdown(!showLoginDropdown)}
          >
            Login
          </button>
          {showLoginDropdown && (
            <div className="dropdown-menu">
              <a href="/student-login">Student Login</a>
              <a href="/admin-login">Admin Login</a>
              <a href="/staff-login">Staff Login</a>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}
