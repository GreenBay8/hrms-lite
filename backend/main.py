from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, validator
from sqlalchemy import create_engine, Column, String, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

app = FastAPI()

# Replace with your frontend URL from Vercel
origins = ["https://hrms-lite-alpha-lake.vercel.app/", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

engine = create_engine("sqlite:///./hrms.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class EmployeeDB(Base):
    __tablename__ = "employees"
    emp_id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    department = Column(String, nullable=False)

class AttendanceDB(Base):
    __tablename__ = "attendance"
    id = Column(String, primary_key=True)
    emp_id = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String, nullable=False)

Base.metadata.create_all(bind=engine)

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

@app.post("/employee", status_code=201)
def add_employee(emp: Employee):
    db = SessionLocal()
    if db.query(EmployeeDB).filter(EmployeeDB.emp_id == emp.emp_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    if db.query(EmployeeDB).filter(EmployeeDB.email == emp.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    db.add(EmployeeDB(**emp.dict()))
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

@app.post("/attendance", status_code=201)
def mark_attendance(att: Attendance):
    db = SessionLocal()
    if not db.query(EmployeeDB).filter(EmployeeDB.emp_id == att.emp_id).first():
        raise HTTPException(status_code=404, detail="Employee not found")
    record_id = f"{att.emp_id}-{att.date}"
    if db.query(AttendanceDB).filter(AttendanceDB.id == record_id).first():
        raise HTTPException(status_code=400, detail="Attendance already marked for this date")
    db.add(AttendanceDB(id=record_id, emp_id=att.emp_id, date=att.date, status=att.status))
    db.commit()
    return {"message": "Attendance marked"}

@app.get("/attendance/{emp_id}")
def get_attendance(emp_id: str):
    db = SessionLocal()
    if not db.query(EmployeeDB).filter(EmployeeDB.emp_id == emp_id).first():
        raise HTTPException(status_code=404, detail="Employee not found")
    return db.query(AttendanceDB).filter(AttendanceDB.emp_id == emp_id).all()

@app.get("/")
def root():
    return {"message": "HRMS Lite Backend Running"}
