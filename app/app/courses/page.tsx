"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Courses() {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [studentName, setStudentName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const courses = [
    { name: "Mathematics", description: "Algebra, geometry, calculus.", image: "/maths.jpg" },
    { name: "Computer Science", description: "Programming, databases, web dev.", image: "/cs.jpg" },
    { name: "Biology", description: "Life sciences and experiments.", image: "/biology.jpg" },
    { name: "History", description: "World history and culture.", image: "/history.jpg" },
    { name: "Physics", description: "Mechanics, thermodynamics, waves.", image: "/physics.jpg" },
    { name: "Chemistry", description: "Organic, inorganic, physical chemistry.", image: "/chemistry.jpg" },
    { name: "Geography", description: "Physical and human geography.", image: "/geography.jpg" },
    { name: "Literature", description: "Poetry, novels, drama analysis.", image: "/literature.jpg" },
  ];

  useEffect(() => {
    const name = localStorage.getItem("studentName");
    if (name) {
      setStudentName(name);
      const allStudentCourses = localStorage.getItem("studentCourses");
      if (allStudentCourses) {
        const coursesMap = JSON.parse(allStudentCourses);
        setSelectedCourses(coursesMap[name] || []);
      }
    }
  }, []);

  useEffect(() => {
    if (studentName) {
      const allStudentCourses = localStorage.getItem("studentCourses");
      const coursesMap = allStudentCourses ? JSON.parse(allStudentCourses) : {};
      coursesMap[studentName] = selectedCourses;
      localStorage.setItem("studentCourses", JSON.stringify(coursesMap));
    }
  }, [selectedCourses, studentName]);

  const handlePick = (courseName: string) => {
    if (!studentName) {
      alert("Please login first to enroll.");
      return;
    }
    if (!selectedCourses.includes(courseName)) {
      setSelectedCourses([...selectedCourses, courseName]);
      setSuccessMessage("You have successfully chosen your course! View your data at the dashboard.");
    }
  };

  const handleRemove = (courseName: string) => {
    if (confirm(`Remove ${courseName}?`)) {
      setSelectedCourses(selectedCourses.filter(c => c !== courseName));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("studentName");
    localStorage.removeItem("studentPassword");
    window.location.href = "/student-login";
  };

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="courses">
      {/* ✅ Success message at the very top */}
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
          <div className="message-actions">
            <button onClick={() => setSuccessMessage("")}>OK</button>
          </div>
        </div>
      )}

      {/* ✅ Selected Courses only visible if logged in */}
      {studentName && (
        <>
          <h2>Your Selected Courses</h2>
          <ul className="selected-courses">
            {selectedCourses.map((course, i) => (
              <li key={i} className="selected-course-item">
                <span>{course}</span>
                <button onClick={() => handleRemove(course)} className="btn-remove">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="courses-header">
        <div>
          <h1>Available Courses</h1>
          {studentName ? <p>Welcome, {studentName}!</p> : <p>Browse courses below. Login to enroll.</p>}
        </div>
        {studentName && (
          <div className="header-buttons">
            <button onClick={() => router.push("/dashboard")} className="btn-dashboard">
              Go to Dashboard
            </button>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        )}
      </div>
      <input
        type="text"
        placeholder="Search courses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="course-list">
        {filteredCourses.map((course, index) => (
          <div key={index} className="course-card">
            <img src={course.image} alt={course.name} className="course-img" />
            <h2>{course.name}</h2>
            <p>{course.description}</p>

            {studentName ? (
              <button onClick={() => handlePick(course.name)} className="btn-enroll">
                {selectedCourses.includes(course.name) ? "Already Enrolled" : "Pick Course"}
              </button>
            ) : (
              <p className="login-hint">Login to enroll in this course.</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
