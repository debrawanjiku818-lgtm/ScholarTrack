from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import uvicorn

app = FastAPI(
    title="ScholarTrack API",
    description="API for ScholarTrack school management platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory data storage (replace with database in production)
courses_db = [
    {"name": "Mathematics", "description": "Algebra, geometry, calculus.", "image": "/maths.jpg"},
    {"name": "Computer Science", "description": "Programming, databases, web dev.", "image": "/cs.jpg"},
    {"name": "Biology", "description": "Life sciences and experiments.", "image": "/biology.jpg"},
    {"name": "History", "description": "World history and culture.", "image": "/history.jpg"},
    {"name": "Physics", "description": "Mechanics, thermodynamics, waves.", "image": "/physics.jpg"},
    {"name": "Chemistry", "description": "Organic, inorganic, physical chemistry.", "image": "/chemistry.jpg"},
    {"name": "Geography", "description": "Physical and human geography.", "image": "/geography.jpg"},
    {"name": "Literature", "description": "Poetry, novels, drama analysis.", "image": "/literature.jpg"},
]

students_db = {}

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to ScholarTrack API",
        "version": "1.0.0",
        "endpoints": {
            "courses": "/courses",
            "students": "/students",
            "admin": "/admin"
        }
    }

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Course endpoints
@app.get("/courses")
async def get_courses():
    """Get all available courses"""
    return courses_db

@app.post("/courses")
async def add_course(course: Dict[str, Any]):
    """Add a new course (admin only)"""
    courses_db.append(course)
    return {"message": "Course added successfully", "course": course}

@app.delete("/courses/{course_name}")
async def delete_course(course_name: str):
    """Delete a course (admin only)"""
    global courses_db
    courses_db = [c for c in courses_db if c["name"] != course_name]
    return {"message": f"Course {course_name} deleted successfully"}

# Student endpoints
@app.get("/students/{student_name}")
async def get_student(student_name: str):
    """Get student information"""
    if student_name in students_db:
        return students_db[student_name]
    return {"error": "Student not found"}

@app.post("/students/{student_name}/enroll")
async def enroll_course(student_name: str, course_name: str):
    """Enroll a student in a course"""
    if student_name not in students_db:
        students_db[student_name] = {"name": student_name, "enrolled_courses": []}
    
    if course_name not in students_db[student_name]["enrolled_courses"]:
        students_db[student_name]["enrolled_courses"].append(course_name)
        return {"message": f"Successfully enrolled in {course_name}"}
    return {"message": "Already enrolled in this course"}

@app.delete("/students/{student_name}/enroll/{course_name}")
async def unenroll_course(student_name: str, course_name: str):
    """Remove a student from a course"""
    if student_name in students_db:
        if course_name in students_db[student_name]["enrolled_courses"]:
            students_db[student_name]["enrolled_courses"].remove(course_name)
            return {"message": f"Successfully unenrolled from {course_name}"}
    return {"error": "Student or course not found"}

# Admin endpoints
@app.post("/admin/login")
async def admin_login(admin: Dict[str, Any]):
    """Admin login endpoint"""
    if admin.get("username") == "Debra" and admin.get("password") == "2005":
        return {"message": "Login successful", "username": admin.get("username")}
    return {"error": "Invalid credentials"}

@app.get("/admin/stats")
async def get_admin_stats():
    """Get admin statistics"""
    return {
        "total_courses": len(courses_db),
        "total_students": len(students_db),
        "total_enrollments": sum(len(s["enrolled_courses"]) for s in students_db.values())
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
