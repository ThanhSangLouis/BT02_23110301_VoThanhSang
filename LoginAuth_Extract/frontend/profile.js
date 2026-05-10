const API_BASE_URL = "http://localhost:5000/api";

const profileCard = document.getElementById("profileCard");
const messageEl = document.getElementById("message");
const logoutBtn = document.getElementById("logoutBtn");

function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.className = isError ? "message error" : "message success";
}

function redirectToLogin() {
  window.location.href = "/index.html";
}

function renderProfile(user) {
  profileCard.innerHTML = `
    <p><strong>ID:</strong> ${user._id || "-"}</p>
    <p><strong>Email:</strong> ${user.email || "-"}</p>
    <p><strong>Username:</strong> ${user.username || "-"}</p>
    <p><strong>Role:</strong> ${user.role || "-"}</p>
  `;
}

async function loadProfile() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = await res.json();

    if (!res.ok || !payload?.success) {
      throw new Error(payload?.error?.message || "Cannot load profile");
    }

    const user = payload.data;
    renderProfile(user);

    const currentPath = window.location.pathname;
    if (user.role === "admin" && !currentPath.includes("/admin/profile")) {
      window.location.href = "/admin/profile.html";
      return;
    }
    if (user.role !== "admin" && !currentPath.includes("/user/profile")) {
      window.location.href = "/user/profile.html";
    }
  } catch (err) {
    showMessage(err.message, true);
    localStorage.clear();
    setTimeout(redirectToLogin, 1000);
  }
}

logoutBtn?.addEventListener("click", () => {
  localStorage.clear();
  redirectToLogin();
});

loadProfile();
