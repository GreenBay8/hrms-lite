from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from sqlalchemy import create_engine, Column, String, Date, func, case
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import re
import os

app = FastAPI(title="HRMS Lite Backend")

# CORS
origins = ["https://hrms-lite-alpha-lake.vercel.app"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Database
DB_PATH = os.path.join(os.path.dirname(__file__), "hrms.db")
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
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

# Pydantic models
class Employee(BaseModel):
    emp_id: str
    name: str
    email: str
    department: str

    @validator("emp_id","name","department")
    def not_empty(cls, v): return v.strip() or ValueError("Required")
    @validator("email")
    def valid_email(cls, v):
        if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", v):
            raise ValueError("Invalid email format")
        return v

class Attendance(BaseModel):
    emp_id: str
    date: datetime.date
    status: str

    @validator("status")
    def status_valid(cls, v):
        if v not in ["Present","Absent"]: raise ValueError("Status must be Present/Absent")
        return v

# Employee APIs
@app.post("/employee")
def add_employee(emp: Employee):
    db = SessionLocal()
    if db.query(EmployeeDB).filter(EmployeeDB.emp_id==emp.emp_id).first():
        raise HTTPException(400, detail="Employee ID already exists")
    if db.query(EmployeeDB).filter(EmployeeDB.email==emp.email).first():
        raise HTTPException(400, detail="Email already exists")
    db.add(EmployeeDB(**emp.dict()))
    db.commit()
    return {"message":"Employee added successfully"}

@app.get("/employees")
def get_employees():
    db = SessionLocal()
    return db.query(EmployeeDB).all()

@app.delete("/employee/{emp_id}")
def delete_employee(emp_id:str):
    db = SessionLocal()
    emp = db.query(EmployeeDB).filter(EmployeeDB.emp_id==emp_id).first()
    if not emp: raise HTTPException(404, detail="Employee not found")
    db.delete(emp)
    db.commit()
    return {"message":"Deleted successfully"}

# Attendance APIs
@app.post("/attendance")
def mark_attendance(att: Attendance):
    db = SessionLocal()
    if not db.query(EmployeeDB).filter(EmployeeDB.emp_id==att.emp_id).first():
        raise HTTPException(404, detail="Employee not found")
    record_id = f"{att.emp_id}-{att.date}"
    if db.query(AttendanceDB).filter(AttendanceDB.id==record_id).first():
        raise HTTPException(400, detail="Attendance already marked")
    db.add(AttendanceDB(id=record_id, emp_id=att.emp_id, date=att.date, status=att.status))
    db.commit()
    return {"message":"Attendance marked successfully"}

@app.get("/attendance/{emp_id}")
def get_attendance(emp_id:str):
    db = SessionLocal()
    if not db.query(EmployeeDB).filter(EmployeeDB.emp_id==emp_id).first():
        raise HTTPException(404, detail="Employee not found")
    return db.query(AttendanceDB).filter(AttendanceDB.emp_id==emp_id).all()

@app.get("/attendance/{emp_id}/filter")
def filter_attendance(emp_id:str, start_date:str=Query(None), end_date:str=Query(None)):
    db = SessionLocal()
    if not db.query(EmployeeDB).filter(EmployeeDB.emp_id==emp_id).first():
        raise HTTPException(404, detail="Employee not found")
    query = db.query(AttendanceDB).filter(AttendanceDB.emp_id==emp_id)
    if start_date: query = query.filter(AttendanceDB.date>=start_date)
    if end_date: query = query.filter(AttendanceDB.date<=end_date)
    return query.all()

@app.get("/attendance/summary")
def attendance_summary():
    db = SessionLocal()
    summary = db.query(
        AttendanceDB.emp_id,
        func.count().label("total_days"),
        func.sum(case([(AttendanceDB.status=="Present",1)], else_=0)).label("present_days")
    ).group_by(AttendanceDB.emp_id).all()
    result=[]
    for row in summary:
        emp = db.query(EmployeeDB).filter(EmployeeDB.emp_id==row.emp_id).first()
        result.append({
            "emp_id": row.emp_id,
            "name": emp.name if emp else "",
            "department": emp.department if emp else "",
            "total_days": row.total_days,
            "present_days": row.present_days
        })
    return result
