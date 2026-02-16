document.addEventListener("DOMContentLoaded", () => {
  // ==============================
  // 0) NAVBAR ACTIVE AUTOMÁTICO
  // ==============================
    const currentPath = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
        const href = link.getAttribute("href")?.split("/").pop();
        if (currentPath === href) link.classList.add("active");
        else link.classList.remove("active");
    });

    // ==============================
    // 1) FORMULARIO ENCARGOS (VALIDACIONES)
    // ==============================
    const orderForm = document.getElementById("orderForm");
    const nameInput = document.getElementById("nameInput");
    const surnameInput = document.getElementById("surnameInput");
    const emailInput = document.getElementById("emailInput");
    const phoneInput = document.getElementById("phoneInput");
    const dateInput = document.getElementById("dateInput");
    const detailsInput = document.getElementById("detailsInput");
    const dateError = document.getElementById("dateError");
    const phoneError = document.getElementById("phoneError");

    // Nombre: letras + espacios
    if (nameInput) {
        nameInput.addEventListener("input", () => {
        const namePattern = /^[a-zA-ZÀ-ÿ\s]+$/;
        const isValid =
            namePattern.test(nameInput.value.trim()) &&
            nameInput.value.trim().length > 0;
        nameInput.classList.toggle("is-valid", isValid);
        nameInput.classList.toggle(
            "is-invalid",
            !isValid && nameInput.value !== ""
        );
        });
    }

    // Apellidos: letras + espacios
    if (surnameInput) {
        surnameInput.addEventListener("input", () => {
        const surnamePattern = /^[a-zA-ZÀ-ÿ\s]+$/;
        const isValid =
            surnamePattern.test(surnameInput.value.trim()) &&
            surnameInput.value.trim().length > 0;
        surnameInput.classList.toggle("is-valid", isValid);
        surnameInput.classList.toggle(
            "is-invalid",
            !isValid && surnameInput.value !== ""
        );
        });
    }

    // Email: .com o .es
    if (emailInput) {
        emailInput.addEventListener("input", () => {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.(com|es)$/;
        const isValid = emailPattern.test(emailInput.value.toLowerCase());
        emailInput.classList.toggle("is-valid", isValid);
        emailInput.classList.toggle(
            "is-invalid",
            !isValid && emailInput.value !== ""
        );
        });
    }

    // Teléfono: 9 dígitos
    if (phoneInput) {
        phoneInput.addEventListener("input", () => {
        const phonePattern = /^[0-9]{9}$/;

        phoneInput.value = phoneInput.value.replace(/[^0-9]/g, "");
        const isValid = phonePattern.test(phoneInput.value);

        if (isValid) {
            phoneInput.classList.remove("is-invalid");
            phoneInput.classList.add("is-valid");
            if (phoneError) phoneError.classList.add("d-none");
        } else {
            phoneInput.classList.remove("is-valid");
            if (phoneInput.value !== "") {
            phoneInput.classList.add("is-invalid");
            if (phoneError) phoneError.classList.remove("d-none");
            }
        }
        });
    }

    // Fecha (48h + no domingos + no festivos CLM + año actual)
    if (dateInput) {
        const diasFestivos = [
        "01-01",
        "01-06",
        "04-09",
        "05-01",
        "08-15",
        "10-12",
        "11-01",
        "12-06",
        "12-25",
        ];

        const esFestivo = (fecha) => {
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");
        return diasFestivos.includes(`${mes}-${dia}`);
        };

        const esDomingo = (fecha) => fecha.getDay() === 0;

        const hoy = new Date();
        hoy.setDate(hoy.getDate() + 2);
        const fechaMinima = hoy.toISOString().split("T")[0];
        dateInput.setAttribute("min", fechaMinima);

        const actualizarMax = () => {
        const anioActual = new Date().getFullYear();
        const fechaMaxima = `${anioActual}-12-31`;
        dateInput.setAttribute("max", fechaMaxima);
        };
        actualizarMax();

        dateInput.addEventListener("input", () => {
        if (!dateInput.value) {
            dateInput.classList.remove("is-valid", "is-invalid");
            if (dateError) dateError.classList.add("d-none");
            return;
        }

        const fechaSeleccionada = new Date(dateInput.value + "T00:00:00");
        const anio = fechaSeleccionada.getFullYear();
        const anioActualDinamico = new Date().getFullYear();

        if (anio !== anioActualDinamico) {
            dateInput.value = "";
            dateInput.classList.add("is-invalid");
            dateInput.classList.remove("is-valid");
            if (dateError) {
            dateError.classList.remove("d-none");
            dateError.textContent = "Solo se aceptan fechas del año actual.";
            }
            return;
        }

        if (esDomingo(fechaSeleccionada)) {
            dateInput.classList.add("is-invalid");
            dateInput.classList.remove("is-valid");
            if (dateError) {
            dateError.classList.remove("d-none");
            dateError.textContent = "No realizamos pedidos los domingos.";
            }
            return;
        }

        if (esFestivo(fechaSeleccionada)) {
            dateInput.classList.add("is-invalid");
            dateInput.classList.remove("is-valid");
            if (dateError) {
            dateError.classList.remove("d-none");
            dateError.textContent = "No realizamos pedidos en días festivos.";
            }
            return;
        }

        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + 2);
        fechaLimite.setHours(0, 0, 0, 0);

        if (fechaSeleccionada >= fechaLimite) {
            dateInput.classList.remove("is-invalid");
            dateInput.classList.add("is-valid");
            if (dateError) dateError.classList.add("d-none");
        } else {
            dateInput.classList.add("is-invalid");
            dateInput.classList.remove("is-valid");
            if (dateError) {
            dateError.classList.remove("d-none");
            dateError.textContent =
                "La fecha debe ser al menos 48 horas después de hoy.";
            }
        }
        });
    }

    // Detalles: mínimo 20 caracteres
    if (detailsInput) {
        detailsInput.addEventListener("input", () => {
        const isValid = detailsInput.value.trim().length >= 20;
        detailsInput.classList.toggle("is-valid", isValid);
        detailsInput.classList.toggle(
            "is-invalid",
            !isValid && detailsInput.value !== ""
        );
        });
    }

    // Envío del formulario (animación)
    if (orderForm) {
        orderForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const inputs = orderForm.querySelectorAll("[required]");
        let formValido = true;

        inputs.forEach((input) => {
            if (!input.classList.contains("is-valid")) {
            input.classList.add("is-invalid");
            formValido = false;
            }
        });

        if (!formValido) {
            const firstError = orderForm.querySelector(".is-invalid");
            if (firstError) {
            firstError.focus();
            firstError.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        const btn = orderForm.querySelector('button[type="submit"]');
        const feedback = document.getElementById("formFeedback");

        if (btn) {
            btn.disabled = true;
            btn.innerHTML =
            '<span class="spinner-border spinner-border-sm"></span> Procesando...';
        }

        setTimeout(() => {
            orderForm.style.display = "none";
            if (feedback) {
            feedback.classList.remove("d-none");
            feedback.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 1500);
        });
    }

    // ==============================
    // 2) SCROLL SUAVE (#anclas)
    // ==============================
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) target.scrollIntoView({ behavior: "smooth" });
        });
    });

    // ==============================
    // 3) AUTH: NAV ICON + LOGIN/REGISTER + LOGOUT
    // ==============================
    if (window.Auth && typeof Auth.updateNavbarAuthLink === "function") {
        Auth.updateNavbarAuthLink();
    }

    function setInvalidWithMessage(input, message) {
        if (!input) return;
        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
        const feedback = input.parentElement?.querySelector(".invalid-feedback");
        if (feedback && message) feedback.textContent = message;
    }

    function setValid(input) {
        if (!input) return;
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
    }

    function resolvePostLoginRedirectOrPanel(role) {
        const redirect = localStorage.getItem("postLoginRedirect");
        if (redirect) {
        localStorage.removeItem("postLoginRedirect");
        return redirect;
        }
        return window.Auth ? Auth.panelUrlByRole(role) : "/index.html";
    }

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    // 3.1 REGISTRO
    if (registerForm) {
        const regName = document.getElementById("regName");
        const regEmail = document.getElementById("regEmail");
        const regPass = document.getElementById("regPass");
        const regPassConfirm = document.getElementById("regPassConfirm");

        if (regName) {
        regName.addEventListener("input", () => {
            const namePattern =
            /^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s[a-zA-ZÀ-ÿ\u00f1\u00d1]+)+$/;
            const ok = namePattern.test(regName.value.trim());
            regName.classList.toggle("is-invalid", !ok && regName.value !== "");
            regName.classList.toggle("is-valid", ok);
        });
        }

        if (regEmail) {
        regEmail.addEventListener("input", () => {
            const emailValue = regEmail.value.trim().toLowerCase();
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.(com|es)$/;

            if (emailValue.startsWith("admin@")) {
            setInvalidWithMessage(
                regEmail,
                "No puedes crear una cuenta de admin. Solo iniciar sesión."
            );
            return;
            }

            const ok = emailPattern.test(emailValue);
            if (ok) {
            setValid(regEmail);
            const feedback = regEmail.parentElement?.querySelector(
                ".invalid-feedback"
            );
            if (feedback) feedback.textContent = "Email inválido.";
            } else {
            regEmail.classList.toggle("is-invalid", regEmail.value !== "");
            regEmail.classList.toggle("is-valid", ok);
            }
        });
        }

        const checkPasswords = () => {
        if (!regPass || !regPassConfirm) return;

        const passOk = regPass.value.length >= 6;
        passOk
            ? setValid(regPass)
            : setInvalidWithMessage(regPass, "Contraseña muy corta.");

        if (regPassConfirm.value !== "") {
            const match = regPass.value === regPassConfirm.value;
            match
            ? setValid(regPassConfirm)
            : setInvalidWithMessage(
                regPassConfirm,
                "Las contraseñas no coinciden."
                );
        }
        };

        if (regPass) regPass.addEventListener("input", checkPasswords);
        if (regPassConfirm) regPassConfirm.addEventListener("input", checkPasswords);

        registerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!window.Auth) return;

        const emailValue = regEmail?.value.trim().toLowerCase() || "";
        const role = Auth.roleFromEmail(emailValue);

        if (role === "admin") {
            setInvalidWithMessage(
            regEmail,
            "No puedes registrar un admin. Solo iniciar sesión."
            );
            regEmail?.focus();
            return;
        }

        const inputs = registerForm.querySelectorAll("input");
        let formValido = true;

        inputs.forEach((input) => {
            if (!input.classList.contains("is-valid")) {
            input.classList.add("is-invalid");
            formValido = false;
            }
        });

        if (!formValido) return;

        Auth.setUser(
            {
            name: regName?.value.trim() || "Usuario",
            email: emailValue,
            role,
            },
            true
        );

        Auth.updateNavbarAuthLink();
        window.location.href = resolvePostLoginRedirectOrPanel(role);
        });
    }

    // 3.2 LOGIN
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!window.Auth) return;

        const loginEmail = document.getElementById("loginEmail");
        const loginPassword = document.getElementById("loginPassword");
        const rememberCheck = document.getElementById("rememberCheck");

        const emailValue = loginEmail?.value.trim().toLowerCase() || "";
        const passValue = loginPassword?.value.trim() || "";

        if (!emailValue) {
            setInvalidWithMessage(loginEmail, "Introduce tu correo.");
            return;
        }
        if (!passValue) {
            setInvalidWithMessage(loginPassword, "Introduce tu contraseña.");
            return;
        }

        const role = Auth.roleFromEmail(emailValue);

        Auth.setUser(
            {
            name: role === "admin" ? "Admin" : "Usuario",
            email: emailValue,
            role,
            },
            !!rememberCheck?.checked
        );

        const btn = loginForm.querySelector('button[type="submit"]');
        if (btn)
            btn.innerHTML =
            '<span class="spinner-border spinner-border-sm"></span> Entrando...';

        setTimeout(() => {
            Auth.updateNavbarAuthLink();
            window.location.href = resolvePostLoginRedirectOrPanel(role);
        }, 600);
        });
    }

    // 3.3 LOGOUT (si existe #logoutBtn)
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn && window.Auth) {
        logoutBtn.addEventListener("click", () => {
        Auth.clearUser();
        Auth.updateNavbarAuthLink();
        window.location.href = "/index.html";
        });
    }

    // ==============================
    // 4) TARJETAS DE PRODUCTO: BOTÓN SEGÚN ROL + FLIP EN MÓVIL
    // ==============================
    initProductCardActions();
    initFlipOnTap();
    });

    function initProductCardActions() {
    const cards = document.querySelectorAll(".product-flip-card");
    if (!cards.length) return;

    const user = window.Auth?.getUser?.() || null;
    const role = user?.role || null;

    cards.forEach((card) => {
        const back = card.querySelector(".product-back");
        if (!back) return;

        const name =
        card.querySelector(".product-front-info h3")?.textContent?.trim() ||
        "Producto";
        const price =
        card.querySelector(".product-front-info .price")?.textContent?.trim() ||
        "";

        let btn = back.querySelector(".js-product-action");

        if (!btn) {
        const actionWrap = document.createElement("div");
        actionWrap.className = "product-action";

        btn = document.createElement("a");
        btn.className = "product-action-btn js-product-action";
        btn.setAttribute("role", "button");

        actionWrap.appendChild(btn);
        back.appendChild(actionWrap);
        }

        btn.classList.remove(
        "product-action-btn--login",
        "product-action-btn--order",
        "product-action-btn--edit"
        );

        if (!role) {
        btn.textContent = "Inicia sesión para pedir";
        btn.classList.add("product-action-btn--login");
        btn.href = "/pages/login.html";

        btn.onclick = () => {
            localStorage.setItem("postLoginRedirect", window.location.href);
            localStorage.setItem(
            "postLoginProduct",
            JSON.stringify({ name, price })
            );
        };
        } else if (role === "admin" || role === "trabajador") {
        btn.textContent = "Modificar";
        btn.classList.add("product-action-btn--edit");

        const panel = window.Auth ? Auth.panelUrlByRole(role) : "/index.html";
        btn.href = `${panel}?producto=${encodeURIComponent(name)}`;
        btn.onclick = null;
        } else {
        btn.textContent = "Encargar";
        btn.classList.add("product-action-btn--order");
        btn.href = `/pages/orders.html?producto=${encodeURIComponent(name)}`;
        btn.onclick = null;
        }
    });
    }

    function initFlipOnTap() {
    const isTouch =
        window.matchMedia("(hover: none)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;

    if (!isTouch) return;

    const cards = document.querySelectorAll(".product-flip-card");
    if (!cards.length) return;

    cards.forEach((card) => {
        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", "Ver información del producto");

        const toggle = (e) => {
        if (e.target.closest("a, button")) return;

        cards.forEach((c) => {
            if (c !== card) c.classList.remove("is-flipped");
        });

        card.classList.toggle("is-flipped");
        };

        card.addEventListener("pointerup", toggle);

        card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            card.classList.toggle("is-flipped");
        }
        });
    });

    document.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".product-flip-card")) return;
        cards.forEach((c) => c.classList.remove("is-flipped"));
    });
}
