# HRMS Lite

## Project Overview
HRMS Lite is a lightweight **Human Resource Management System** built as a web application.  
It allows an admin to:

- **Manage Employees**: Add, view, and delete employees with unique IDs, names, emails, and departments.  
- **Manage Attendance**: Mark attendance (Present/Absent), view records, and filter by date.  
- **Dashboard Summary**: See total attendance and present days per employee.  

The system focuses on essential HR functionalities with a clean, professional, and user-friendly interface.

---

## Tech Stack Used

**Frontend:**  
- React.js  
- Axios (for API calls)  
- CSS (inline styles, tables, cards, badges)  

**Backend:**  
- Python  
- FastAPI  
- SQLAlchemy  
- SQLite (for persistence)  
- Pydantic (data validation)  

**Deployment:**  
- Frontend: Vercel  
- Backend: Render

---

## Steps to Run the Project Locally

### 1. Backend Setup
1. Navigate to the `backend` folder:
```bash
cd backend

2.Create a virtual environment (optional but recommended):
python -m venv venv
# Linux/Mac
source venv/bin/activate
# Windows
venv\Scripts\activate

3. Install dependencies:
pip install -r requirements.txt

4.Start the backend server:
uvicorn main:app --reload

5.The backend API will be available at http://127.0.0.1:8000

### 2. Frontend Setup
1.Navigate to the frontend folder:
cd frontend

2.Install Dependencies:
npm install

3.Update the backend URL in src/App.js:
const API = "http://127.0.0.1:8000";

4.Start the Frontend
npm start

5.The frontend will be available at http://localhost:3000.



Assumptions & Limitations

Single Admin: No authentication implemented.

Database: Using SQLite locally; in production, you can switch to PostgreSQL or MySQL.

Duplicate Handling: Employee ID and email must be unique.

Attendance: Can only be marked once per employee per date.

UI: Simple and professional; not mobile-responsive yet.

Advanced HR Features: Payroll, leave management, etc., are out of scope.
