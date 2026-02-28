import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://hrms-lite-2-iege.onrender.com"; 

function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ emp_id: "", name: "", email: "", department: "" });
  const [attendance, setAttendance] = useState({ emp_id: "", date: "", status: "Present" });
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filter, setFilter] = useState({ emp_id: "", start_date: "", end_date: "" });
  const [summary, setSummary] = useState([]);

  // Styles
  const inputStyle = { padding: "8px", margin: "5px", borderRadius: "5px", border: "1px solid #ccc" };
  const buttonStyle = { padding: "8px 15px", margin: "5px", borderRadius: "5px", border: "none", cursor: "pointer", backgroundColor: "#4CAF50", color: "white" };
  const cardStyle = { border: "1px solid #ccc", borderRadius: "8px", padding: "20px", margin: "15px 0", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", backgroundColor: "#fdfdfd" };
  const tableStyle = { width: "100%", borderCollapse: "collapse" };
  const thStyle = { backgroundColor: "#4CAF50", color: "white", padding: "8px" };
  const tdStyle = { textAlign: "center", borderBottom: "1px solid #ddd", padding: "8px" };

  useEffect(() => { fetchEmployees(); fetchSummary(); }, []);

  const fetchEmployees = async () => {
    try { const res = await axios.get(`${API}/employees`); setEmployees(res.data); } 
    catch (err) { alert("Error fetching employees"); }
  };

  const fetchSummary = async () => {
    try { const res = await axios.get(`${API}/attendance/summary`); setSummary(res.data); } 
    catch (err) { console.error(err); }
  };

  const addEmployee = async () => {
    if (!form.emp_id || !form.name || !form.email || !form.department) return alert("All fields required");
    try { await axios.post(`${API}/employee`, form); alert("Employee added"); setForm({ emp_id: "", name: "", email: "", department: "" }); fetchEmployees(); fetchSummary(); } 
    catch (err) { alert(err.response?.data?.detail || "Error adding employee"); }
  };

  const deleteEmployee = async (emp_id) => { try { await axios.delete(`${API}/employee/${emp_id}`); fetchEmployees(); fetchSummary(); setAttendanceRecords([]); } catch (err) { alert(err.response?.data?.detail || "Error deleting employee"); } };

  const markAttendance = async () => {
    if (!attendance.emp_id || !attendance.date) return alert("Select employee and date");
    try { await axios.post(`${API}/attendance`, attendance); alert("Attendance marked"); setAttendance({ emp_id: "", date: "", status: "Present" }); fetchAttendance(attendance.emp_id); fetchSummary(); } 
    catch (err) { alert(err.response?.data?.detail || "Error marking attendance"); }
  };

  const fetchAttendance = async (emp_id) => { try { const res = await axios.get(`${API}/attendance/${emp_id}`); setAttendanceRecords(res.data); } catch (err) { alert(err.response?.data?.detail || "Error fetching attendance"); } };

  const filterAttendance = async () => {
    if (!filter.emp_id) return alert("Select an employee");
    try {
      const res = await axios.get(`${API}/attendance/${filter.emp_id}/filter`, { params: { start_date: filter.start_date || undefined, end_date: filter.end_date || undefined }});
      if (res.data.length===0) alert("No records found");
      setAttendanceRecords(res.data);
    } catch (err) { alert(err.response?.data?.detail || "Error filtering attendance"); }
  };

  return (
    <div style={{ padding:"30px", fontFamily:"Arial", maxWidth:"1000px", margin:"auto" }}>
      <h1 style={{ textAlign:"center" }}>HRMS Lite Dashboard</h1>

      {/* Add Employee */}
      <div style={cardStyle}>
        <h2>Add Employee</h2>
        <input style={inputStyle} placeholder="ID" value={form.emp_id} onChange={e=>setForm({...form, emp_id:e.target.value})}/>
        <input style={inputStyle} placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input style={inputStyle} placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <input style={inputStyle} placeholder="Department" value={form.department} onChange={e=>setForm({...form, department:e.target.value})}/>
        <button style={buttonStyle} onClick={addEmployee}>Add Employee</button>
      </div>

      {/* Employees Table */}
      <div style={cardStyle}>
        <h2>Employees</h2>
        <table style={tableStyle}>
          <thead><tr><th style={thStyle}>Name</th><th style={thStyle}>Email</th><th style={thStyle}>Department</th><th style={thStyle}>Actions</th></tr></thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.emp_id}>
                <td style={tdStyle}>{emp.name}</td>
                <td style={tdStyle}>{emp.email}</td>
                <td style={tdStyle}>{emp.department}</td>
                <td style={tdStyle}>
                  <button style={{...buttonStyle,backgroundColor:"#f44336"}} onClick={()=>deleteEmployee(emp.emp_id)}>Delete</button>
                  <button style={{...buttonStyle,backgroundColor:"#2196F3"}} onClick={()=>fetchAttendance(emp.emp_id)}>Attendance</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mark Attendance */}
      <div style={cardStyle}>
        <h2>Mark Attendance</h2>
        <select style={inputStyle} value={attendance.emp_id} onChange={e=>setAttendance({...attendance, emp_id:e.target.value})}>
          <option value="">Select Employee</option>
          {employees.map(emp=><option key={emp.emp_id} value={emp.emp_id}>{emp.name}</option>)}
        </select>
        <input style={inputStyle} type="date" value={attendance.date} onChange={e=>setAttendance({...attendance,date:e.target.value})}/>
        <select style={inputStyle} value={attendance.status} onChange={e=>setAttendance({...attendance,status:e.target.value})}>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>
        <button style={buttonStyle} onClick={markAttendance}>Mark Attendance</button>
      </div>

      {/* Filter Attendance */}
      <div style={cardStyle}>
        <h2>Filter Attendance Records</h2>
        <select style={inputStyle} value={filter.emp_id} onChange={e=>setFilter({...filter, emp_id:e.target.value})}>
          <option value="">Select Employee</option>
          {employees.map(emp=><option key={emp.emp_id} value={emp.emp_id}>{emp.name}</option>)}
        </select>
        <input style={inputStyle} type="date" value={filter.start_date} onChange={e=>setFilter({...filter,start_date:e.target.value})}/>
        <input style={inputStyle} type="date" value={filter.end_date} onChange={e=>setFilter({...filter,end_date:e.target.value})}/>
        <button style={buttonStyle} onClick={filterAttendance}>Filter</button>

        {attendanceRecords.length===0?<p>No records found</p>:
          <table style={tableStyle}>
            <thead><tr><th style={thStyle}>Date</th><th style={thStyle}>Status</th></tr></thead>
            <tbody>
              {attendanceRecords.map(att=>(
                <tr key={att.id}>
                  <td style={tdStyle}>{att.date}</td>
                  <td style={{...tdStyle,color:att.status==="Present"?"green":"red",fontWeight:"bold"}}>{att.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      {/* Dashboard Summary */}
      <div style={cardStyle}>
        <h2>Employee Attendance Summary</h2>
        {summary.length===0?<p>No attendance records yet</p>:
          <table style={tableStyle}>
            <thead><tr><th style={thStyle}>Name</th><th style={thStyle}>Department</th><th style={thStyle}>Total Days</th><th style={thStyle}>Present Days</th></tr></thead>
            <tbody>
              {summary.map(emp=>(
                <tr key={emp.emp_id}>
                  <td style={tdStyle}>{emp.name}</td>
                  <td style={tdStyle}>{emp.department}</td>
                  <td style={tdStyle}>{emp.total_days}</td>
                  <td style={{...tdStyle,color:"green",fontWeight:"bold"}}>{emp.present_days}</td>
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
