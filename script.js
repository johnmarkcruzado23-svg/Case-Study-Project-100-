js


"use strict";

// Demo prototype only. Data is stored in this browser, not a server.
const STUDENTS_KEY = "khs_sims_students_v1";
const USERS_KEY = "khs_sims_users_v1";
const SESSION_KEY = "khs_sims_logged_in";

const $ = (id) => document.getElementById(id);

const defaultStudents = [
  {
    id: "KHS-2026-0001",
    name: "Juan Dela Cruz",
    grade: "Grade 11",
    strand: "STEM",
    contact: "0917-123-4567",
    email: "",
    dob: "",
    gender: "Male",
    address: "",
    status: "Active",
    dateAdded: "2026-01-05"
  },
  {
    id: "KHS-2026-0002",
    name: "Maria Santos",
    grade: "Grade 12",
    strand: "ABM",
    contact: "0918-222-3344",
    email: "",
    dob: "",
    gender: "Female",
    address: "",
    status: "Active",
    dateAdded: "2026-01-06"
  },
  {
    id: "KHS-2026-0003",
    name: "Carlos Reyes",
    grade: "Grade 11",
    strand: "HUMSS",
    contact: "0919-555-6677",
    email: "",
    dob: "",
    gender: "Male",
    address: "",
    status: "Active",
    dateAdded: "2026-01-07"
  }
];

const defaultUsers = [
  {
    username: "admin",
    name: "System Administrator",
    role: "Administrator",
    status: "Active"
  },
  {
    username: "registrar",
    name: "School Registrar",
    role: "Registrar",
    status: "Active"
  }
];

function loadData(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.error("Could not load saved data:", error);
    return fallback;
  }
}

let students = loadData(STUDENTS_KEY, defaultStudents);
let users = loadData(USERS_KEY, defaultUsers);

function saveStudents() {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

function saveUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function statusBadge(status) {
  const className = String(status).toLowerCase();
  return `<span class="status ${escapeHTML(className)}">${escapeHTML(status)}</span>`;
}

function showEmpty(columns, message = "No records found.") {
  return `<tr><td colspan="${columns}" class="empty">${escapeHTML(message)}</td></tr>`;
}

// LOGIN
$("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const username = $("username").value.trim();
  const password = $("password").value;
  const error = $("loginError");

  // Demo credentials only; replace with server-side authentication
  // before using this system with real student records.
  if (username === "admin" && password === "admin123") {
    sessionStorage.setItem(SESSION_KEY, "true");
    error.textContent = "";
    $("loginPage").classList.add("hidden");
    $("app").classList.remove("hidden");
    renderAll();
    navigate("dashboard");
  } else {
    error.textContent = "Invalid username or password.";
  }
});

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  $("app").classList.add("hidden");
  $("loginPage").classList.remove("hidden");
  $("loginForm").reset();
  $("loginError").textContent = "";
}

$("logoutBtn").addEventListener("click", logout);

// NAVIGATION
const pageTitles = {
  dashboard: "Dashboard",
  students: "Student Management",
  add: "Add Student",
  search: "Search / Filter",
  reports: "Reports",
  users: "User Management"
};

function navigate(page) {
  if (!pageTitles[page]) return;

  document.querySelectorAll(".page").forEach((section) => {
    section.classList.toggle("hidden", section.id !== page);
  });

  document.querySelectorAll(".nav-link").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === page);
  });

  $("pageTitle").textContent = pageTitles[page];

  if (page === "dashboard") renderDashboard();
  if (page === "students") renderStudents();
  if (page === "search") renderSearch();
  if (page === "reports") renderReports();
  if (page === "users") renderUsers();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-page]").forEach((button) => {
  button.addEventListener("click", () => navigate(button.dataset.page));
});

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.go === "add") resetStudentForm();
    navigate(button.dataset.go);
  });
});

// DASHBOARD
function renderDashboard() {
  $("totalStudents").textContent = students.length;
  $("activeStudents").textContent =
    students.filter((s) => s.status === "Active").length;
  $("grade11").textContent =
    students.filter((s) => s.grade === "Grade 11").length;
  $("grade12").textContent =
    students.filter((s) => s.grade === "Grade 12").length;

  const recent = [...students].slice(-5).reverse();

  $("recentStudents").innerHTML = recent.length
    ? recent.map((s) => `
      <tr>
        <td>${escapeHTML(s.id)}</td>
        <td>${escapeHTML(s.name)}</td>
        <td>${escapeHTML(s.grade)}</td>
        <td>${escapeHTML(s.strand)}</td>
        <td>${statusBadge(s.status)}</td>
      </tr>`).join("")
    : showEmpty(5);
}

// STUDENT MANAGEMENT
function renderStudents(query = $("studentQuickSearch").value) {
  const term = query.trim().toLowerCase();

  const filtered = students.filter((s) =>
    `${s.id} ${s.name}`.toLowerCase().includes(term)
  );

  $("studentsTable").innerHTML = filtered.length
    ? filtered.map((s) => `
      <tr>
        <td>${escapeHTML(s.id)}</td>
        <td>${escapeHTML(s.name)}</td>
        <td>${escapeHTML(s.grade)}</td>
        <td>${escapeHTML(s.strand)}</td>
        <td>${escapeHTML(s.contact || "—")}</td>
        <td>${statusBadge(s.status)}</td>
        <td>
          <div class="action-buttons">
            <button class="edit-btn" data-edit-student="${escapeHTML(s.id)}">Edit</button>
            <button class="delete-btn" data-delete-student="${escapeHTML(s.id)}">Delete</button>
          </div>
        </td>
      </tr>`).join("")
    : showEmpty(7);

  $("studentsTable").querySelectorAll("[data-edit-student]").forEach((button) => {
    button.addEventListener("click", () => editStudent(button.dataset.editStudent));
  });

  $("studentsTable").querySelectorAll("[data-delete-student]").forEach((button) => {
    button.addEventListener("click", () => deleteStudent(button.dataset.deleteStudent));
  });
}

$("studentQuickSearch").addEventListener("input", () => {
  renderStudents($("studentQuickSearch").value);
});

function resetStudentForm() {
  $("studentForm").reset();
  $("editOriginalId").value = "";
  $("studentFormTitle").textContent = "Add New Student";
  $("dateAdded").value = new Date().toISOString().slice(0, 10);
}

function editStudent(id) {
  const student = students.find((s) => s.id === id);
  if (!student) return;

  $("studentForm").reset();
  $("editOriginalId").value = student.id;
  $("studentId").value = student.id;
  $("fullName").value = student.name;
  $("grade").value = student.grade;
  $("strand").value = student.strand;
  $("contact").value = student.contact || "";
  $("email").value = student.email || "";
  $("dob").value = student.dob || "";
  $("gender").value = student.gender || "";
  $("address").value = student.address || "";
  $("status").value = student.status || "Active";
  $("dateAdded").value = student.dateAdded || "";
  $("studentFormTitle").textContent = "Edit Student";

  navigate("add");
}

function deleteStudent(id) {
  const student = students.find((s) => s.id === id);
  if (!student) return;

  if (!confirm(`Delete student "${student.name}" (${student.id})?`)) return;

  students = students.filter((s) => s.id !== id);
  saveStudents();
  renderAll();
}

$("studentForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const originalId = $("editOriginalId").value.trim();
  const id = $("studentId").value.trim();
  const name = $("fullName").value.trim();

  if (!id || !name) {
    alert("Please enter the student ID and full name.");
    return;
  }

  const duplicate = students.some((s) =>
    s.id.toLowerCase() === id.toLowerCase() && s.id !== originalId
  );

  if (duplicate) {
    alert("That student ID already exists. Please use a unique ID.");
    $("studentId").focus();
    return;
  }

  const student = {
    id,
    name,
    grade: $("grade").value,
    strand: $("strand").value,
    contact: $("contact").value.trim(),
    email: $("email").value.trim(),
    dob: $("dob").value,
    gender: $("gender").value,
    address: $("address").value.trim(),
    status: $("status").value,
    dateAdded: $("dateAdded").value || new Date().toISOString().slice(0, 10)
  };

  if (originalId) {
    const index = students.findIndex((s) => s.id === originalId);
    if (index !== -1) students[index] = student;
  } else {
    students.push(student);
  }

  saveStudents();
  resetStudentForm();
  renderAll();
  navigate("students");
});

$("cancelStudent").addEventListener("click", () => {
  resetStudentForm();
  navigate("students");
});

// CSV EXPORT
function exportCSV(rows, filename) {
  if (!rows.length) {
    alert("There are no records to export.");
    return;
  }

  const headers = [
    "Student ID", "Full Name", "Grade", "Strand", "Contact",
    "Email", "Date of Birth", "Gender", "Address", "Status", "Date Added"
  ];

  const values = rows.map((s) => [
    s.id, s.name, s.grade, s.strand, s.contact, s.email,
    s.dob, s.gender, s.address, s.status, s.dateAdded
  ]);

  const escapeCell = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csv = [headers, ...values]
    .map((row) => row.map(escapeCell).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

$("exportBtn").addEventListener("click", () => {
  const term = $("studentQuickSearch").value.trim().toLowerCase();
  const filtered = students.filter((s) =>
    `${s.id} ${s.name}`.toLowerCase().includes(term)
  );
  exportCSV(filtered, "KHS-Students.csv");
});

// SEARCH / FILTER
function getSearchResults() {
  const term = $("searchText").value.trim().toLowerCase();
  const grade = $("filterGrade").value;
  const strand = $("filterStrand").value;
  const status = $("filterStatus").value;

  return students.filter((s) =>
    `${s.id} ${s.name}`.toLowerCase().includes(term) &&
    (!grade || s.grade === grade) &&
    (!strand || s.strand === strand) &&
    (!status || s.status === status)
  );
}

function renderSearch() {
  const results = getSearchResults();

  $("searchResults").innerHTML = results.length
    ? results.map((s) => `
      <tr>
        <td>${escapeHTML(s.id)}</td>
        <td>${escapeHTML(s.name)}</td>
        <td>${escapeHTML(s.grade)}</td>
        <td>${escapeHTML(s.strand)}</td>
        <td>${escapeHTML(s.contact || "—")}</td>
        <td>${statusBadge(s.status)}</td>
      </tr>`).join("")
    : showEmpty(6);

  $("searchCount").textContent =
    `${results.length} student record${results.length === 1 ? "" : "s"} found.`;
}

["searchText", "filterGrade", "filterStrand", "filterStatus"].forEach((id) => {
  $(id).addEventListener("input", renderSearch);
  $(id).addEventListener("change", renderSearch);
});

$("clearFilters").addEventListener("click", () => {
  $("searchText").value = "";
  $("filterGrade").value = "";
  $("filterStrand").value = "";
  $("filterStatus").value = "";
  renderSearch();
});

// REPORTS
function getReportResults() {
  const grade = $("reportGrade").value;
  const strand = $("reportStrand").value;
  const status = $("reportStatus").value;

  return students.filter((s) =>
    (!grade || s.grade === grade) &&
    (!strand || s.strand === strand) &&
    (!status || s.status === status)
  );
}

function renderReports() {
  const results = getReportResults();

  $("reportTotal").textContent = results.length;
  $("reportActive").textContent =
    results.filter((s) => s.status === "Active").length;
  $("report11").textContent =
    results.filter((s) => s.grade === "Grade 11").length;
  $("report12").textContent =
    results.filter((s) => s.grade === "Grade 12").length;

  $("reportTable").innerHTML = results.length
    ? results.map((s) => `
      <tr>
        <td>${escapeHTML(s.id)}</td>
        <td>${escapeHTML(s.name)}</td>
        <td>${escapeHTML(s.grade)}</td>
        <td>${escapeHTML(s.strand)}</td>
        <td>${statusBadge(s.status)}</td>
      </tr>`).join("")
    : showEmpty(5);

  const counts = {};
  results.forEach((s) => {
    counts[s.strand || "Unspecified"] =
      (counts[s.strand || "Unspecified"] || 0) + 1;
  });

  const strands = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(1, ...strands.map((entry) => entry[1]));

  $("strandChart").innerHTML = strands.length
    ? strands.map(([name, count]) => `
      <div class="chart-row">
        <span>${escapeHTML(name)}</span>
        <div class="chart-track">
          <div class="chart-fill" style="width:${(count / maxCount) * 100}%"></div>
        </div>
        <strong>${count}</strong>
      </div>`).join("")
    : '<p class="muted">No data available for the selected filters.</p>';
}

["reportGrade", "reportStrand", "reportStatus"].forEach((id) => {
  $(id).addEventListener("change", renderReports);
});

$("printReport").addEventListener("click", () => {
  navigate("reports");
  window.print();
});

// USER MANAGEMENT
function renderUsers() {
  $("usersTable").innerHTML = users.length
    ? users.map((user) => `
      <tr>
        <td>${escapeHTML(user.username)}</td>
        <td>${escapeHTML(user.name)}</td>
        <td>${escapeHTML(user.role)}</td>
        <td>${statusBadge(user.status)}</td>
        <td>
          <div class="action-buttons">
            <button class="edit-btn" data-edit-user="${escapeHTML(user.username)}">Edit</button>
            <button class="delete-btn" data-delete-user="${escapeHTML(user.username)}">Delete</button>
          </div>
        </td>
      </tr>`).join("")
    : showEmpty(5);

  $("usersTable").querySelectorAll("[data-edit-user]").forEach((button) => {
    button.addEventListener("click", () => editUser(button.dataset.editUser));
  });

  $("usersTable").querySelectorAll("[data-delete-user]").forEach((button) => {
    button.addEventListener("click", () => deleteUser(button.dataset.deleteUser));
  });
}

function openUserDialog(user = null) {
  $("userForm").reset();
  $("userOriginal").value = user ? user.username : "";
  $("userDialogTitle").textContent = user ? "Edit User" : "Add User";
  $("newUsername").disabled = Boolean(user);

  if (user) {
    $("newUsername").value = user.username;
    $("newFullName").value = user.name;
    $("newRole").value = user.role;
    $("newUserStatus").value = user.status;
  } else {
    $("newUserStatus").value = "Active";
  }

  $("userDialog").showModal();
}

function editUser(username) {
  const user = users.find((u) => u.username === username);
  if (user) openUserDialog(user);
}

function deleteUser(username) {
  if (username === "admin") {
    alert("The demo admin profile cannot be deleted.");
    return;
  }

  const user = users.find((u) => u.username === username);
  if (!user) return;

  if (!confirm(`Delete user profile "${username}"?`)) return;

  users = users.filter((u) => u.username !== username);
  saveUsers();
  renderUsers();
}

$("addUserBtn").addEventListener("click", () => openUserDialog());

$("cancelUser").addEventListener("click", () => {
  $("userDialog").close();
});

$("userForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const original = $("userOriginal").value;
  const username = $("newUsername").value.trim();
  const name = $("newFullName").value.trim();

  if (!username || !name) {
    alert("Please enter a username and full name.");
    return;
  }

  if (!original && users.some((u) =>
    u.username.toLowerCase() === username.toLowerCase()
  )) {
    alert("That username already exists.");
    return;
  }

  const user = {
    username: original || username,
    name,
    role: $("newRole").value,
    status: $("newUserStatus").value
  };

  if (original) {
    const index = users.findIndex((u) => u.username === original);
    if (index !== -1) users[index] = user;
  } else {
    users.push(user);
  }

  saveUsers();
  renderUsers();
  $("userDialog").close();
});

// RENDER ALL VIEWS
function renderAll() {
  renderDashboard();
  renderStudents();
  renderSearch();
  renderReports();
  renderUsers();
}

// INITIALIZE
saveStudents();
saveUsers();

if (sessionStorage.getItem(SESSION_KEY) === "true") {
  $("loginPage").classList.add("hidden");
  $("app").classList.remove("hidden");
  renderAll();
  navigate("dashboard");
} else {
  $("loginPage").classList.remove("hidden");
  $("app").classList.add("hidden");
}