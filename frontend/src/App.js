import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://YOUR_RENDER_BACKEND_URL"; // replace with deployed backend

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

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>HRMS Lite</h1>

      <h2>Add Employee</h2>
      <input placeholder="ID" value={form.emp_id} onChange={e=>setForm({...form, emp_id:e.target.value})}/>
      <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
      <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
      <input placeholder="Department" value={form.department} onChange={e=>setForm({...form, department:e.target.value})}/>
      <button onClick={addEmployee}>Add Employee</button>

      <h2>Employees</h2>
      {employees.map(emp=>(
        <div key={emp.emp_id} style={{ borderBottom: "1px solid #ccc", padding: "5px" }}>
          {emp.name} ({emp.department}) - {emp.email}
          <button onClick={()=>deleteEmployee(emp.emp_id)} style={{ marginLeft: "10px" }}>Delete</button>
          <button onClick={()=>fetchAttendance(emp.emp_id)} style={{ marginLeft: "10px" }}>View Attendance</button>
        </div>
      ))}

      <h2>Mark Attendance</h2>
      <select value={attendance.emp_id} onChange={e=>setAttendance({...attendance, emp_id:e.target.value})}>
        <option value="">Select Employee</option>
        {employees.map(emp => <option key={emp.emp_id} value={emp.emp_id}>{emp.name}</option>)}
      </select>
      <input type="date" value={attendance.date} onChange={e=>setAttendance({...attendance, date:e.target.value})}/>
      <select value={attendance.status} onChange={e=>setAttendance({...attendance, status:e.target.value})}>
        <option value="Present">Present</option>
        <option value="Absent">Absent</option>
      </select>
      <button onClick={markAttendance}>Mark Attendance</button>

      <h2>Attendance Records</h2>
      {attendanceRecords.map(att => (
        <div key={att.id}>
          {att.date} - {att.status}
        </div>
      ))}
    </div>
  );
}

export default App;
