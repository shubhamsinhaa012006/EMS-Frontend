import { useEffect, useState } from "react";
import "./App.css"; // Ensure App.css styles are loaded

function App() {
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    salary: "",
  });

  // New States
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const API_URL = "https://ems-backend-oh23.onrender.com/employees";

  // FETCH EMPLOYEES
  const getEmployees = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    getEmployees();
  }, []);

  // DARK MODE EFFECT
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  // HANDLE INPUT
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ADD OR UPDATE EMPLOYEE
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (editId) {
      // UPDATE
      await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setEditId(null);
    } else {
      // ADD
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }

    setFormData({ name: "", department: "", salary: "" });
    getEmployees();
  };

  // EDIT EMPLOYEE (Populate Form)
  const handleEditClick = (employee) => {
    setEditId(employee.id);
    setFormData({
      name: employee.name,
      department: employee.department,
      salary: employee.salary,
    });
  };

  // DELETE EMPLOYEE
  const deleteEmployee = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    getEmployees();
  };

  // DERIVED DATA
  const uniqueDepartments = [...new Set((Array.isArray(employees) ? employees : []).map(e => e?.department))].filter(Boolean);

  const filteredEmployees = (Array.isArray(employees) ? employees : []).filter(employee => {
    const name = employee?.name || "";
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment ? employee.department === filterDepartment : true;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="app-wrapper">
      <div className="container">
        
        {/* HEADER */}
        <div className="header-section">
          <h1>Employee Management System</h1>
          <button 
            className="theme-toggle" 
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="controls-section">
          <div className="search-filter">
            <input 
              type="text" 
              className="search-input"
              placeholder="🔍 Search employees by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select 
              className="filter-select"
              value={filterDepartment} 
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="employee-count">
            Total Employees: <strong>{filteredEmployees.length}</strong>
          </div>
        </div>

        {/* ADD/EDIT FORM */}
        <div className="form-card">
          <h2>{editId ? "✏️ Edit Employee" : "➕ Add New Employee"}</h2>
          <form onSubmit={handleFormSubmit} className="form">
            <input
              type="text"
              name="name"
              placeholder="Employee Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="salary"
              placeholder="Salary"
              value={formData.salary}
              onChange={handleChange}
              required
            />
            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {editId ? "Update Employee" : "Add Employee"}
              </button>
              {editId && (
                <button 
                  type="button" 
                  className="secondary-btn" 
                  onClick={() => {
                    setEditId(null);
                    setFormData({ name: "", department: "", salary: "" });
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* EMPLOYEE LIST */}
        <div className="employee-grid">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <div key={employee.id} className="card">
                <div className="card-header">
                  <h3>{employee.name}</h3>
                  <span className="badge">{employee.department}</span>
                </div>
                <div className="card-body">
                  <p>Salary</p>
                  <div className="salary">₹{employee.salary}</div>
                </div>
                <div className="card-actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEditClick(employee)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteEmployee(employee.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              No employees match your filters.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;