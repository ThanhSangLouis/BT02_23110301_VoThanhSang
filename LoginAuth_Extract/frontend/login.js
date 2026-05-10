const API_BASE_URL = "http://localhost:5000/api";

const loginForm = document.getElementById("loginForm");
const messageEl = document.getElementById("message");

function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.className = isError ? "message error" : "message success";
}

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  showMessage("Logging in...");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const payload = await res.json();
    if (!res.ok || !payload?.success) {
      throw new Error(payload?.error?.message || "Login failed");
    }

    const data = payload.data;
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));

    showMessage("Login successful");

    // Existing backend roles are admin/student/teacher.
    // Map non-admin roles to user profile page for assignment requirement.
    if (data.user?.role === "admin") {
      window.location.href = "/admin/profile.html";
    } else {
      window.location.href = "/user/profile.html";
    }
  } catch (err) {
    showMessage(err.message, true);
  }
});
