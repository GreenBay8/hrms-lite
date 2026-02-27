from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, validator
from sqlalchemy import create_engine, Column, String, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

app = FastAPI(title="HRMS Lite Backend")

# ===== CORS =====
origins = [
    "https://YOUR_FRONTEND_URL.vercel.app",  # Replace with your Vercel frontend URL
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Database Setup =====
engine = create_engine("sqlite:///./hrms.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Employee table
class EmployeeDB(Base):
    __tablename__ = "employees"
    emp_id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    department = Column(String, nullable=False)

# Attendance table
class AttendanceDB(Base):
    __tablename__ = "attendance"
    id = Column(String, primary_key=True)  # emp_id + date
    emp_id = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String, nullable=False)

Base.metadata.create_all(bind=engine)

# ===== Pydantic Models =====
class Employee(BaseModel):
    emp_id: str
    name: str
    email: EmailStr
    department: str

    @validator("emp_id", "name", "department")
    def not_empty(cls, v):
        if not v.strip():
            raise ValueError("Required field")
        return v

class Attendance(BaseModel):
    emp_id: str
    date: datetime.date
    status: str

    @validator("status")
    def status_valid(cls, v):
        if v not in ["Present", "Absent"]:
            raise ValueError("Status must be 'Present' or 'Absent'")
        return v

# ===== Employee APIs =====
@app.post("/employee", status_code=201)
def add_employee(emp: Employee):
    db = SessionLocal()
    if db.query(EmployeeDB).filter(EmployeeDB.emp_id == emp.emp_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    if db.query(EmployeeDB).filter(EmployeeDB.email == emp.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    new_emp = EmployeeDB(**emp.dict())
    db.add(new_emp)
    db.commit()
    return {"message": "Employee added successfully"}

@app.get("/employees")
def get_employees():
    db = SessionLocal()
    return db.query(EmployeeDB).all()

@app.delete("/employee/{emp_id}")
def delete_employee(emp_id: str):
    db = SessionLocal()
    emp = db.query(EmployeeDB).filter(EmployeeDB.emp_id == emp_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(emp)
    db.commit()
    return {"message": "Employee deleted"}

# ===== Attendance APIs =====
@app.post("/attendance", status_code=201)
def mark_attendance(att: Attendance):
    db = SessionLocal()
    if not db.query(EmployeeDB).filter(EmployeeDB.emp_id == att.emp_id).first():
        raise HTTPException(status_code=404, detail="Employee not found")
    record_id = f"{att.emp_id}-{att.date}"
    if db.query(AttendanceDB).filter(AttendanceDB.id == record_id).first():
        raise HTTPException(status_code=400, detail="Attendance already marked for this date")
    new_att = AttendanceDB(id=record_id, emp_id=att.emp_id, date=att.date, status=att.status)
    db.add(new_att)
    db.commit()
    return {"message": "Attendance marked"}

@app.get("/attendance/{emp_id}")
def get_attendance(emp_id: str):
    db = SessionLocal()
    if not db.query(EmployeeDB).filter(EmployeeDB.emp_id == emp_id).first():
        raise HTTPException(status_code=404, detail="Employee not found")
    records = db.query(AttendanceDB).filter(AttendanceDB.emp_id == emp_id).all()
    return records

# ===== Root =====
@app.get("/")
def root():
    return {"message": "HRMS Lite Backend Running"}
