// auth-login.js
document.addEventListener("DOMContentLoaded", () => {
    if (!window.Auth) {
        console.error("No se ha cargado Auth (auth-core.js). Revisa la ruta.");
        return;
    }

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.(com|es)$/;

    function setInvalid(input, msg) {
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
        const fb = input.parentElement?.querySelector(".invalid-feedback");
        if (fb && msg) fb.textContent = msg;
    }
    function setValid(input) {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
    }

    function goAfterLogin(defaultUrl) {
        const redirect = sessionStorage.getItem("redirectAfterLogin");
        if (redirect) {
        sessionStorage.removeItem("redirectAfterLogin");
        window.location.href = redirect;
        } else {
        window.location.href = defaultUrl;
        }
    }

    //LOGIN 
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const emailEl = document.getElementById("loginEmail");
        const passEl = document.getElementById("loginPassword");
        const remember = document.getElementById("rememberCheck")?.checked;

        const email = (emailEl.value || "").trim().toLowerCase();
        const pass = (passEl.value || "").trim();

        let ok = true;

        if (!emailPattern.test(email)) {
            setInvalid(emailEl, "Introduce un email válido (.com o .es).");
            ok = false;
        } else setValid(emailEl);

        if (!pass) {
            setInvalid(passEl, "Introduce tu contraseña.");
            ok = false;
        } else setValid(passEl);

        if (!ok) return;

        const role = Auth.roleFromEmail(email);

        // (modo demo) No validamos contraseña real
        Auth.setUser(
            { name: role === "admin" ? "Admin" : "Usuario", email, role },
            !!remember
        );

        Auth.updateNavbarAuthLink();

        goAfterLogin(Auth.panelUrlByRole(role));
        });
    }

    //REGISTRO
    if (registerForm) {
        const regName = document.getElementById("regName");
        const regEmail = document.getElementById("regEmail");
        const regPass = document.getElementById("regPass");
        const regPassConfirm = document.getElementById("regPassConfirm");

        const nameValid = (v) =>
        /^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s+[a-zA-ZÀ-ÿ\u00f1\u00d1]+)+$/.test(v.trim());

        registerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = (regName.value || "").trim();
        const email = (regEmail.value || "").trim().toLowerCase();
        const pass = regPass.value || "";
        const pass2 = regPassConfirm.value || "";

        let ok = true;

        if (!nameValid(name)) {
            setInvalid(regName, "Mínimo 2 palabras.");
            ok = false;
        } else setValid(regName);

        if (!emailPattern.test(email)) {
            setInvalid(regEmail, "Email inválido (.com o .es).");
            ok = false;
        } else if (email.startsWith("admin@")) {
            setInvalid(regEmail, "No puedes crear una cuenta de admin. Solo iniciar sesión.");
            ok = false;
        } else setValid(regEmail);

        if (pass.length < 6) {
            setInvalid(regPass, "Contraseña muy corta.");
            ok = false;
        } else setValid(regPass);

        if (pass !== pass2) {
            setInvalid(regPassConfirm, "Las contraseñas no coinciden.");
            ok = false;
        } else setValid(regPassConfirm);

        if (!ok) return;

        const role = Auth.roleFromEmail(email); // admin bloqueado arriba

        Auth.setUser({ name, email, role }, true);
        Auth.updateNavbarAuthLink();

        goAfterLogin(Auth.panelUrlByRole(role));
        });
    }
});
