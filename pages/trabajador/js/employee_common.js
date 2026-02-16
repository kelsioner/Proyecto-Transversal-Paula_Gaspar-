// /trabajador/js/employee_common.js
(() => {
    // Lee sesión (tu proyecto usa "auth")
    let auth = null;
    try { auth = JSON.parse(localStorage.getItem("auth") || "null"); } catch {}

    // Si auth-core ya valida por data-required-role, esto es solo "cinturón y tirantes"
    const required = document.body.dataset.requiredRole;
    if (required && (!auth || auth.role !== required)) {
        location.href = "/pages/login.html";
        return;
    }

    // Cambiar link de login a "Mi cuenta" si hay sesión
    const navAuthLink = document.getElementById("navAuthLink");
    if (navAuthLink && auth) {
        navAuthLink.textContent = "Mi cuenta";
        // Ajusta si tu panel se llama distinto
        navAuthLink.href = "/pages/panel-trabajador.html";
    }

    // Botón logout (si existe en la página)
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("auth");
        location.href = "/pages/login.html";
        });
    }
})();
