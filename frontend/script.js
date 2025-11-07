const API_URL = "https://minicloud-qaf8.onrender.com/api";  // backend base URL

// Toggle between login/register
function toggleForm() {
  document.getElementById("loginBox").classList.toggle("hidden");
  document.getElementById("registerBox").classList.toggle("hidden");
}

// REGISTER
async function registerUser() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  alert(data.message || "Registered");

  // If registration succeeded, automatically log the user in and redirect to dashboard
  if (res.ok) {
    try {
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const loginData = await loginRes.json();
      if (loginRes.ok && loginData.token) {
        localStorage.setItem("token", loginData.token);
        if (loginData.user) {
          localStorage.setItem("userName", loginData.user.name);
          localStorage.setItem("userEmail", loginData.user.email);
        }
        window.location.href = "dashboard.html";
        return;
      } else {
        // fallback: show login form if auto-login failed
        toggleForm();
      }
    } catch (e) {
      // network or other error - show login form
      toggleForm();
    }
  }
}

// LOGIN
async function loginUser() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok && data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userName", data.user.name);
    localStorage.setItem("userEmail", data.user.email);
    window.location.href = "dashboard.html";
  } else {
    alert(data.message || "Login failed");
  }
}

// LOGOUT
function logout() {
  localStorage.removeItem("token");
  // Redirect to the login page after logout
  window.location.href = "login.html";
}

// Confirm and delete account
function confirmDeleteAccount() {
  const ok = confirm('Are you sure you want to delete your account? This will remove all your files and cannot be undone.');
  if (!ok) return;
  deleteAccount();
}

async function deleteAccount() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_URL}/auth/delete`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token }
    });

    if (res.ok) {
      // Clear local data and navigate to login
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      alert('Account deleted successfully');
      window.location.href = 'login.html';
      return;
    }

    // parse error
    let body = {};
    try { body = await res.json(); } catch (e) {}
    alert(body.message || body.error || 'Failed to delete account');
  } catch (err) {
    alert('Network error: ' + err.message);
  }
}

// FILE UPLOAD
async function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) return alert("Select a file");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/files/upload`, {
    method: "POST",
    headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    body: formData
  });

  const data = await res.json();
  alert(data.message);
  listFiles();
}

async function listFiles() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/files/list`, {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();
  const container = document.getElementById("fileList");

  if (!data.files || data.files.length === 0) {
    container.innerHTML = "<p>No files uploaded yet.</p>";
    return;
  }

  container.innerHTML = data.files.map(f => {
    // Convert size from bytes to KB or MB
    const sizeInKB = f.size / 1024;
    const sizeFormatted =
      sizeInKB > 1024
        ? (sizeInKB / 1024).toFixed(2) + " MB"
        : sizeInKB.toFixed(2) + " KB";

    // Format date
    const uploadedDate = new Date(f.uploadedAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

    return `
      <div class="file-item">
        <div>
          <strong>${f.fileName}</strong><br>
          <small>${sizeFormatted} — uploaded on ${uploadedDate}</small>
        </div>
        <div>
          <button onclick="viewFile('${f._id}', '${f.fileName}')">View</button>
          <button onclick="downloadFile('${f._id}', '${f.fileName}')">Download</button>
          <button onclick="deleteFile('${f._id}')">Delete</button>
        </div>
      </div>
    `;
  }).join("");
}



// DOWNLOAD FILE
async function downloadFile(id, name) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/files/download/${id}`, {
    headers: { Authorization: "Bearer " + token }
  });

  if (!res.ok) {
    return alert("Download failed!");
  }

  // Convert the response to a blob (binary large object)
  const blob = await res.blob();

  // Create a temporary link and trigger download
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();

  // Cleanup
  a.remove();
  window.URL.revokeObjectURL(url);
}

// VIEW FILE
async function viewFile(id, name) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/files/download/${id}`, {
    headers: { Authorization: "Bearer " + token }
  });

  if (!res.ok) {
    return alert("Failed to view file!");
  }

  const blob = await res.blob();
  const fileURL = URL.createObjectURL(blob);

  // Open in a new browser tab
  window.open(fileURL, "_blank");
}


// DELETE FILE
async function deleteFile(id) {
  await fetch(`${API_URL}/files/delete/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + localStorage.getItem("token") }
  });
  listFiles();
  showStorageInfo();
}

async function showStorageInfo() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/files/storage`, {
    headers: { Authorization: "Bearer " + token }
  });

  try {
    if (!res.ok) {
      // Try to parse error body, fall back to status text
      let errBody = {};
      try { errBody = await res.json(); } catch (e) { /* ignore */ }
      const msg = errBody.error || errBody.message || res.statusText || 'Failed to load storage';
      document.getElementById("storageInfo").innerText = 'Storage: ' + msg;
      document.getElementById("storageBar").innerHTML = `<p>${msg}</p>`;
      return;
    }

    const data = await res.json();
    // Validate response shape
    if (!data || typeof data.used === 'undefined' || typeof data.total === 'undefined') {
      document.getElementById("storageInfo").innerText = 'Storage: Invalid response';
      document.getElementById("storageBar").innerHTML = `<p>Invalid storage data</p>`;
      return;
    }

    const usedMB = (data.used / (1024 * 1024)).toFixed(2);
    const totalMB = (data.total / (1024 * 1024)).toFixed(2);
    const percent = ((data.used / data.total) * 100).toFixed(1);

    // Update text and set the fill width on the #storageBar element (it's the fill in CSS)
    document.getElementById("storageInfo").innerText = `Storage: ${usedMB} MB of ${totalMB} MB (${percent}% used)`;
    const storageBarEl = document.getElementById("storageBar");
    // Ensure any inner content is cleared and use the element's width for the fill
    storageBarEl.innerHTML = '';
    storageBarEl.style.width = percent + '%';
  } catch (err) {
    // Network or parsing error
    document.getElementById("storageInfo").innerText = 'Storage: Error';
    document.getElementById("storageBar").innerHTML = `<p>Error: ${err.message}</p>`;
  }
}


// CREATE INSTANCE
async function createInstance() {
  const name = document.getElementById("instanceName").value;
  const type = document.getElementById("instanceType").value;

  const res = await fetch(`${API_URL}/instances/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ name, type })
  });
  // Safely parse response and show a helpful message
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }
  const msg = data.message || data.error || (res.statusText ? res.statusText : 'Unexpected response');
  alert(msg);
  listInstances();
}

// LIST INSTANCES
async function listInstances() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/instances/list`, {
    headers: { Authorization: "Bearer " + token }
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = [];
  }

  const container = document.getElementById("instanceList");
  // If the endpoint returned an error object, show a message
  if (!res.ok) {
    container.innerHTML = `<p>Error: ${data.error || res.statusText}</p>`;
    return;
  }

  container.innerHTML = data
    .map(
      i => `<p>${i.name} (${i.status})
      <button onclick="startInstance('${i._id}')">Start</button>
      <button onclick="stopInstance('${i._id}')">Stop</button>
      <button onclick="deleteInstance('${i._id}')">Delete</button></p>`
    ).join('');
}

async function startInstance(id) {
  const token = localStorage.getItem("token");
  await fetch(`${API_URL}/instances/start/${id}`, { method: "PUT", headers: { Authorization: "Bearer " + token } });
  listInstances();
}

async function stopInstance(id) {
  const token = localStorage.getItem("token");
  await fetch(`${API_URL}/instances/stop/${id}`, { method: "PUT", headers: { Authorization: "Bearer " + token } });
  listInstances();
}

async function deleteInstance(id) {
  const token = localStorage.getItem("token");
  await fetch(`${API_URL}/instances/delete/${id}`, { method: "DELETE", headers: { Authorization: "Bearer " + token } });
  listInstances();
}

// Auto-load lists
if (window.location.pathname.includes("dashboard.html")) {
  listFiles();
  listInstances();
  showStorageInfo();
}

// Show username in dashboard
if (window.location.pathname.includes("dashboard.html")) {
  const userName = localStorage.getItem("userName") || "User";
  document.getElementById("welcomeText").textContent = `Hi, ${userName}!`;
}

container.innerHTML = data.files.map(f => {
  const sizeInKB = f.size / 1024;
  const sizeFormatted =
    sizeInKB > 1024
      ? (sizeInKB / 1024).toFixed(2) + " MB"
      : sizeInKB.toFixed(2) + " KB";

  const uploadedDate = new Date(f.uploadedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  return `
    <div class="file-item">
      <div>
        <strong>${f.fileName}</strong><br>
        <small>${sizeFormatted} — uploaded on ${uploadedDate}</small>
      </div>
      <div>
        <button onclick="viewFile('${f._id}', '${f.fileName}')">View</button>
        <button onclick="downloadFile('${f._id}', '${f.fileName}')">Download</button>
        <button onclick="deleteFile('${f._id}')">Delete</button>
      </div>
    </div>
  `;
}).join("");

// On successful login
if (res.ok && data.token) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("userName", data.user.name);
  window.location.href = "dashboard.html";
}

// After registration
if (res.ok) {
  alert("Registration successful! Please log in.");
  window.location.href = "login.html";
}
