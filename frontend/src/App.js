import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://hrms-lite-2-iege.onrender.com"; // replace with your backend

function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ emp_id:"", name:"", email:"", department:"" });
  const [attendance, setAttendance] = useState({ emp_id:"", date:"", status:"Present" });
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API}/employees`);
      setEmployees(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || "Error fetching employees");
    }
  };

  const addEmployee = async () => {
    try {
      await axios.post(`${API}/employee`, form);
      alert("Employee added successfully");
      setForm({ emp_id:"", name:"", email:"", department:"" });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.detail || "Error adding employee");
    }
  };

  const deleteEmployee = async (emp_id) => {
    try {
      await axios.delete(`${API}/employee/${emp_id}`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.detail || "Error deleting employee");
    }
  };

  const markAttendance = async () => {
    try {
      await axios.post(`${API}/attendance`, attendance);
      alert("Attendance marked successfully");
      setAttendance({ emp_id:"", date:"", status:"Present" });
      fetchAttendance(attendance.emp_id);
    } catch (err) {
      alert(err.response?.data?.detail || "Error marking attendance");
    }
  };

  const fetchAttendance = async (emp_id) => {
    if(!emp_id) return;
    try {
      const res = await axios.get(`${API}/attendance/${emp_id}`);
      setAttendanceRecords(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || "Error fetching attendance");
    }
  };

  useEffect(()=>{ fetchEmployees(); }, []);

  const inputStyle = { padding: "8px", margin: "5px 5px 5px 0", borderRadius: "5px", border: "1px solid #ccc" };
  const buttonStyle = { padding: "8px 15px", margin: "5px", borderRadius: "5px", border: "none", cursor: "pointer", backgroundColor: "#4CAF50", color: "white" };
  const cardStyle = { border: "1px solid #ccc", borderRadius: "8px", padding: "15px", margin: "10px 0", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" };

  return (
    <div style={{ padding: "30px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", maxWidth: "900px", margin: "auto" }}>
      <h1 style={{ textAlign: "center", color: "#333" }}>HRMS Lite</h1>

      {/* Add Employee */}
      <div style={{ ...cardStyle, backgroundColor: "#f9f9f9" }}>
        <h2>Add Employee</h2>
        <input style={inputStyle} placeholder="ID" value={form.emp_id} onChange={e=>setForm({...form, emp_id:e.target.value})}/>
        <input style={inputStyle} placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input style={inputStyle} placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <input style={inputStyle} placeholder="Department" value={form.department} onChange={e=>setForm({...form, department:e.target.value})}/>
        <button style={buttonStyle} onClick={addEmployee}>Add Employee</button>
      </div>

      {/* Employee List */}
      <div style={cardStyle}>
        <h2>Employees</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#4CAF50", color: "white" }}>
              <th style={{ padding: "8px" }}>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp=>(
              <tr key={emp.emp_id} style={{ textAlign: "center", borderBottom: "1px solid #ddd" }}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.department}</td>
                <td>
                  <button style={{ ...buttonStyle, backgroundColor: "#f44336" }} onClick={()=>deleteEmployee(emp.emp_id)}>Delete</button>
                  <button style={{ ...buttonStyle, backgroundColor: "#2196F3" }} onClick={()=>fetchAttendance(emp.emp_id)}>Attendance</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mark Attendance */}
      <div style={{ ...cardStyle, backgroundColor: "#f9f9f9" }}>
        <h2>Mark Attendance</h2>
        <select style={inputStyle} value={attendance.emp_id} onChange={e=>setAttendance({...attendance, emp_id:e.target.value})}>
          <option value="">Select Employee</option>
          {employees.map(emp => <option key={emp.emp_id} value={emp.emp_id}>{emp.name}</option>)}
        </select>
        <input style={inputStyle} type="date" value={attendance.date} onChange={e=>setAttendance({...attendance, date:e.target.value})}/>
        <select style={inputStyle} value={attendance.status} onChange={e=>setAttendance({...attendance, status:e.target.value})}>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>
        <button style={buttonStyle} onClick={markAttendance}>Mark Attendance</button>
      </div>

      {/* Attendance Records */}
      <div style={cardStyle}>
        <h2>Attendance Records</h2>
        {attendanceRecords.length === 0 ? <p>No records found</p> :
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#2196F3", color: "white" }}>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map(att => (
                <tr key={att.id} style={{ textAlign: "center", borderBottom: "1px solid #ddd" }}>
                  <td>{att.date}</td>
                  <td>{att.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}

export default App;
