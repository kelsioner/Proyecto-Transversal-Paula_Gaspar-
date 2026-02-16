// auth-core.js (RAÍZ DEL PROYECTO)
(() => {
    const STORAGE_KEY = "auth";
    const LOGIN_URL = "/pages/login.html";

    // Paneles por rol
    const ROLE_PANEL = {
        cliente: "/pages/panel-cliente.html",
        trabajador: "/pages/panel-trabajador.html",
        admin: "/pages/panel-admin.html",
    };

    const safeJSONParse = (str) => {
        try { return JSON.parse(str); } catch { return null; }
    };

    // ---------- Sesión ----------
    // Soporta "Recordarme": localStorage; si no, sessionStorage
    const getUser = () => {
        const fromLocal = safeJSONParse(localStorage.getItem(STORAGE_KEY) || "null");
        if (fromLocal && typeof fromLocal === "object" && fromLocal.role) return fromLocal;

        const fromSession = safeJSONParse(sessionStorage.getItem(STORAGE_KEY) || "null");
        if (fromSession && typeof fromSession === "object" && fromSession.role) return fromSession;

        return null;
    };

    const setUser = (user, remember = true) => {
        const data = { ...user, ts: Date.now() };
        if (remember) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        sessionStorage.removeItem(STORAGE_KEY);
        } else {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.removeItem(STORAGE_KEY);
        }
    };

    const clearUser = () => {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
    };

    // ---------- Roles / URLs ----------
    // IMPORTANTE: aquí defines cómo detectas trabajador/admin por email.
    // Si tus correos de trabajador no empiezan por "trabajador@" o "empleado@",
    // cámbialo aquí.
    const roleFromEmail = (email) => {
        const e = (email || "").toLowerCase().trim();
        if (e.startsWith("admin@")) return "admin";
        if (e.startsWith("trabajador@") || e.startsWith("empleado@")) return "trabajador";
        return "cliente";
    };

    const panelUrlByRole = (role) => ROLE_PANEL[role] || LOGIN_URL;

    // ---------- Navbar ----------
    const updateNavbarAuthLink = () => {
        const link = document.getElementById("navAuthLink");
        if (!link) return;

        const user = getUser();
        if (!user) {
        link.textContent = "Login";
        link.href = LOGIN_URL;
        return;
        }
        link.textContent = "Mi cuenta";
        link.href = panelUrlByRole(user.role);
    };

    // ---------- Guard de páginas privadas ----------
    const enforceRoleGuard = () => {
        const required = document.body?.dataset?.requiredRole;
        if (!required) return;

        const allowRolesRaw = document.body?.dataset?.allowRoles;
        const allowRoles = allowRolesRaw
        ? allowRolesRaw.split(",").map(s => s.trim()).filter(Boolean)
        : null;

        const user = getUser();
        const role = user?.role;

        const allowed = (r) => {
        if (allowRoles && allowRoles.length) return allowRoles.includes(r);
        return r === required;
        };

        if (!role || !allowed(role)) {
        try {
            sessionStorage.setItem(
            "redirectAfterLogin",
            window.location.pathname + window.location.search + window.location.hash
            );
        } catch {}
        window.location.href = LOGIN_URL;
        }
    };

    // ---------- Logout ----------
    const bindLogoutButton = () => {
        const btn = document.getElementById("logoutBtn");
        if (!btn) return;
        btn.addEventListener("click", () => {
        clearUser();
        window.location.href = LOGIN_URL;
        });
    };

    // Exponer API compatible con tu auth-login.js
    window.Auth = {
        // Compat
        roleFromEmail,
        setUser,
        panelUrlByRole,
        updateNavbarAuthLink,

        // Helpers extra (por si los usas)
        getUser,
        clearUser,
        logout: () => { clearUser(); window.location.href = LOGIN_URL; },
    };

    document.addEventListener("DOMContentLoaded", () => {
        enforceRoleGuard();
        updateNavbarAuthLink();
        bindLogoutButton();
    });
})();
