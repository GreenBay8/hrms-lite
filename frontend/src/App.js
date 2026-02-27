import { useState, useEffect } from "react";
import axios from "axios";

const API = "PASTE_BACKEND_URL_LATER";

function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    emp_id:"",
    name:"",
    email:"",
    department:""
  });

  const fetchEmployees = async () => {
    const res = await axios.get(`${API}/employees`);
    setEmployees(res.data);
  };

  const addEmployee = async () => {
    await axios.post(`${API}/employee`, form);
    fetchEmployees();
  };

  useEffect(()=>{ fetchEmployees(); },[]);

  return (
    <div>
      <h2>Add Employee</h2>
      <input placeholder="ID" onChange={e=>setForm({...form, emp_id:e.target.value})}/>
      <input placeholder="Name" onChange={e=>setForm({...form, name:e.target.value})}/>
      <input placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})}/>
      <input placeholder="Dept" onChange={e=>setForm({...form, department:e.target.value})}/>
      <button onClick={addEmployee}>Add</button>

      <h2>Employees</h2>
      {employees.map(emp=>(
        <div key={emp.emp_id}>
          {emp.name} - {emp.department}
        </div>
      ))}
    </div>
  );
}

export default App;
