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

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API}/employees`);
      setEmployees(res.data);
    } catch (err) { alert("Error fetching employees"); }
  };

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API}/attendance/summary`);
      setSummary(res.data);
    } catch (err) { console.error("Error fetching summary", err); }
  };

  useEffect(() => {
    fetchEmployees();
    fetchSummary();
  }, []);

  const addEmployee = async () => {
    if (!form.emp_id || !form.name || !form.email || !form.department) return alert("All fields required");
    try {
      await axios.post(`${API}/employee`, form);
      setForm({ emp_id: "", name: "", email: "", department: "" });
      fetchEmployees();
      fetchSummary();
    } catch (err) { alert(err.response?.data?.detail || "Error adding employee"); }
  };

  const deleteEmployee = async (emp_id) => {
    if (!window.confirm("Delete employee? All attendance will be removed.")) return;
    try {
      await axios.delete(`${API}/employee/${emp_id}`);
      fetchEmployees();
      fetchSummary();
      setAttendanceRecords([]);
    } catch (err) { alert(err.response?.data?.detail || "Error deleting employee"); }
  };

  const markAttendance = async () => {
    if (!attendance.emp_id || !attendance.date) return alert("Select employee and date");
    try {
      await axios.post(`${API}/attendance`, attendance);
      setAttendance({ emp_id: "", date: "", status: "Present" });
      fetchAttendance(attendance.emp_id);
      fetchSummary();
    } catch (err) { alert(err.response?.data?.detail || "Error marking attendance"); }
  };

  const fetchAttendance = async (emp_id) => {
    try {
      const res = await axios.get(`${API}/attendance/${emp_id}`);
      setAttendanceRecords(res.data);
    } catch (err) { alert(err.response?.data?.detail || "Error fetching attendance"); }
  };

  const filterAttendance = async () => {
    if (!filter.emp_id) return alert("Select an employee");
    try {
      const res = await axios.get(`${API}/attendance/${filter.emp_id}/filter`, {
        params: { start_date: filter.start_date || undefined, end_date: filter.end_date || undefined }
      });
      setAttendanceRecords(res.data);
      if(res.data.length===0) alert("No records found");
    } catch (err) { alert(err.response?.data?.detail || "Error filtering attendance"); }
  };

  return (
    <div style={{ padding:"30px", fontFamily:"Arial", maxWidth:"1000px", margin:"auto" }}>
      <h1 style={{ textAlign:"center" }}>HRMS Lite Dashboard</h1>

      {/* Dashboard Summary */}
      <div style={{marginTop:"20px"}}>
        <h2>Employee Attendance Summary</h2>
        {employees.length===0 ? <p>No employees yet</p> :
          <table style={{width:"100%", borderCollapse:"collapse"}}>
            <thead>
              <tr>
                <th>Name</th><th>Department</th><th>Total Days</th><th>Present Days</th>
              </tr>
            </thead>
            <tbody>
              {summary.map(emp => (
                <tr key={emp.emp_id}>
                  <td>{emp.name}</td>
                  <td>{emp.department}</td>
                  <td>{emp.total_days}</td>
                  <td>{emp.present_days}</td>
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
