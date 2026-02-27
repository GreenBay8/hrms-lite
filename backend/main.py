from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, String, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

app = FastAPI()

engine = create_engine("sqlite:///./hrms.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class EmployeeDB(Base):
    __tablename__ = "employees"
    emp_id = Column(String, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    department = Column(String)

class AttendanceDB(Base):
    __tablename__ = "attendance"
    id = Column(String, primary_key=True)
    emp_id = Column(String)
    date = Column(Date)
    status = Column(String)

Base.metadata.create_all(bind=engine)

class Employee(BaseModel):
    emp_id: str
    name: str
    email: EmailStr
    department: str

class Attendance(BaseModel):
    emp_id: str
    date: datetime.date
    status: str

@app.post("/employee")
def add_employee(emp: Employee):
    db = SessionLocal()
    existing = db.query(EmployeeDB).filter(EmployeeDB.emp_id == emp.emp_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee ID exists")
    new_emp = EmployeeDB(**emp.dict())
    db.add(new_emp)
    db.commit()
    return {"message": "Employee added"}

@app.get("/employees")
def get_employees():
    db = SessionLocal()
    return db.query(EmployeeDB).all()

@app.delete("/employee/{emp_id}")
def delete_employee(emp_id: str):
    db = SessionLocal()
    emp = db.query(EmployeeDB).filter(EmployeeDB.emp_id == emp_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(emp)
    db.commit()
    return {"message": "Deleted"}

@app.post("/attendance")
def mark_attendance(att: Attendance):
    db = SessionLocal()
    record = AttendanceDB(
        id=str(att.emp_id)+str(att.date),
        emp_id=att.emp_id,
        date=att.date,
        status=att.status
    )
    db.add(record)
    db.commit()
    return {"message": "Attendance marked"}

@app.get("/attendance/{emp_id}")
def get_attendance(emp_id: str):
    db = SessionLocal()
    return db.query(AttendanceDB).filter(AttendanceDB.emp_id == emp_id).all()
