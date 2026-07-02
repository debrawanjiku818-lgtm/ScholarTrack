# ScholarTrack Backend API

FastAPI backend for the ScholarTrack school management platform.

## Setup Instructions

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   
   On Windows:
   ```bash
   venv\Scripts\activate
   ```
   
   On Mac/Linux:
   ```bash
   source venv/bin/activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the server:**
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

### General
- `GET /` - API welcome message
- `GET /health` - Health check endpoint

### Courses
- `GET /courses` - Get all available courses
- `POST /courses` - Add a new course (admin only)
- `DELETE /courses/{course_name}` - Delete a course (admin only)

### Students
- `GET /students/{student_name}` - Get student information
- `POST /students/{student_name}/enroll` - Enroll a student in a course
- `DELETE /students/{student_name}/enroll/{course_name}` - Remove a student from a course

### Admin
- `POST /admin/login` - Admin login endpoint
- `GET /admin/stats` - Get admin statistics

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Notes

- Currently uses in-memory data storage
- Replace with database integration for production use
- CORS is configured for local development
