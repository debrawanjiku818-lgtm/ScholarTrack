"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CourseDetails({ params }: { params: { name: string } }) {
  const [studentName, setStudentName] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const name = localStorage.getItem("studentName");
    if (!name) {
      router.push("/student-login"); 
    } else {
      setStudentName(name);
      const allStudentCourses = localStorage.getItem("studentCourses");
      if (allStudentCourses) {
        const coursesMap = JSON.parse(allStudentCourses);
        setSelectedCourses(coursesMap[name] || []);
      }
    }
  }, [router]);

  const handleEnroll = (courseName: string) => {
    const allStudentCourses = localStorage.getItem("studentCourses");
    const coursesMap = allStudentCourses ? JSON.parse(allStudentCourses) : {};
    const currentCourses = coursesMap[studentName] || [];

    if (!currentCourses.includes(courseName)) {
      coursesMap[studentName] = [...currentCourses, courseName];
      localStorage.setItem("studentCourses", JSON.stringify(coursesMap));
      setSelectedCourses([...currentCourses, courseName]);
      alert(`You have enrolled in ${courseName}!`);
    }
  };

  if (!studentName) {
    return <p>Redirecting to login...</p>;
  }

  return (
    <section className="course-details">
      <h1>{params.name} Course</h1>
      <p>Welcome, {studentName}! Here are the details for {params.name}.</p>

      {selectedCourses.includes(params.name) ? (
        <button disabled className="btn-enroll">Already Enrolled</button>
      ) : (
        <button onClick={() => handleEnroll(params.name)} className="btn-enroll">
          Enroll Now
        </button>
      )}
    </section>
  );
}
