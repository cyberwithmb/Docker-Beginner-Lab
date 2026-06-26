// The frontend runs in the user's browser.
// In that browser context, localhost:3000 means the user's host machine.
// It does not mean "inside the frontend container" if you later containerize this app.
const API_BASE_URL = "http://localhost:3000";

const backendStatus = document.getElementById("backend-status");
const databaseStatus = document.getElementById("database-status");
const employeeList = document.getElementById("employee-list");
const employeeForm = document.getElementById("employee-form");
const message = document.getElementById("message");

function setStatus(element, text, isOk) {
  element.textContent = text;
  element.className = isOk ? "ok" : "error";
}

function showMessage(text, isError) {
  message.textContent = text;
  message.className = isError ? "error" : "ok";
}

async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();

    setStatus(backendStatus, "Connected", response.ok);
    setStatus(databaseStatus, data.database || "Unknown", data.database === "Connected");
  } catch (error) {
    setStatus(backendStatus, "Not connected", false);
    setStatus(databaseStatus, "Unknown", false);
  }
}

async function loadEmployees() {
  try {
    const response = await fetch(`${API_BASE_URL}/employees`);
    const employees = await response.json();

    if (!response.ok) {
      throw new Error(employees.error || "Unable to load employees.");
    }

    employeeList.innerHTML = "";

    if (employees.length === 0) {
      employeeList.innerHTML = '<tr><td colspan="3">No employees found.</td></tr>';
      return;
    }

    employees.forEach((employee) => {
      const row = document.createElement("tr");

      const idCell = document.createElement("td");
      idCell.textContent = employee.id;

      const nameCell = document.createElement("td");
      nameCell.textContent = employee.name;

      const departmentCell = document.createElement("td");
      departmentCell.textContent = employee.department;

      row.appendChild(idCell);
      row.appendChild(nameCell);
      row.appendChild(departmentCell);
      employeeList.appendChild(row);
    });
  } catch (error) {
    employeeList.innerHTML = '<tr><td colspan="3">Could not load employees.</td></tr>';
    showMessage(error.message, true);
  }
}

employeeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(employeeForm);
  const employee = {
    name: formData.get("name").trim(),
    department: formData.get("department").trim(),
  };

  if (!employee.name || !employee.department) {
    showMessage("Name and department are required.", true);
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employee),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to add employee.");
    }

    employeeForm.reset();
    showMessage(`Added ${data.name} to ${data.department}.`, false);
    await loadEmployees();
    await checkHealth();
  } catch (error) {
    showMessage(error.message, true);
  }
});

checkHealth();
loadEmployees();
