// panel.js
document.addEventListener("DOMContentLoaded", () => {
    if (!window.Auth) return;

    const user = Auth.getUser();
    const requiredRole = document.body.dataset.requiredRole; // admin/trabajador/cliente

    // Si no hay sesión -> login
    if (!user) {
        window.location.href = "../pages/login.html";
        return;
    }

    // Si el rol no coincide con el panel -> a su panel correcto
    if (requiredRole && user.role !== requiredRole) {
        window.location.href = Auth.panelUrlByRole(user.role);
        return;
    }

    // Rellenar info básica
    const userEmail = document.getElementById("userEmail");
    const userRole = document.getElementById("userRole");
    const userName = document.getElementById("userName");

    if (userEmail) userEmail.textContent = user.email || "";
    if (userRole) userRole.textContent = user.role || "";
    if (userName) userName.textContent = user.name || "Usuario";

    // Perfil por usuario (se guarda en el navegador)
    const PROFILE_KEY = `profile_${(user.email || "").toLowerCase()}`;

    function loadProfile() {
        try {
        return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
        } catch {
        return {};
        }
    }

    function saveProfile(profile) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        showSaved();
    }

    // Cargar datos guardados
    const profile = loadProfile();
    const form = document.getElementById("profileForm");
    if (form) {
        // Set defaults
        form.querySelectorAll("[data-profile]").forEach((el) => {
        const key = el.dataset.profile;
        if (profile[key] != null) el.value = profile[key];
        });

        // Guardado automático al escribir/cambiar
        const handler = () => {
        const next = {};
        form.querySelectorAll("[data-profile]").forEach((el) => {
            next[el.dataset.profile] = el.value;
        });
        saveProfile(next);
        };

        form.addEventListener("input", debounce(handler, 400));
        form.addEventListener("change", handler);
    }

    // Botón cerrar sesión
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
        Auth.clearUser();
        Auth.updateNavbarAuthLink?.();
        window.location.href = "../pages/login.html";
        });
    }

    // Actualiza navbar (por si tu panel tiene el link Login)
    Auth.updateNavbarAuthLink?.();

    // Utils
    function showSaved() {
        const el = document.getElementById("saveHint");
        if (!el) return;
        el.classList.remove("d-none");
        clearTimeout(el._t);
        el._t = setTimeout(() => el.classList.add("d-none"), 1200);
    }

    function debounce(fn, ms) {
        let t;
        return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
        };
    }
    });