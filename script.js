document.addEventListener('DOMContentLoaded', () => {

    // 1. GESTIÓN AUTOMÁTICA DE CLASE ACTIVE EN NAVBAR
    const currentPath = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const href = link.getAttribute('href').split("/").pop();
        if (currentPath === href) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 2. ELEMENTOS DEL FORMULARIO DE ENCARGOS
    const orderForm = document.getElementById('orderForm');
    const nameInput = document.getElementById('nameInput');
    const emailInput = document.getElementById('emailInput');
    const dateInput = document.getElementById('dateInput');
    const detailsInput = document.getElementById('detailsInput');
    const dateError = document.getElementById('dateError');

    // --- CONFIGURACIÓN DE FECHA MÍNIMA ---
    if (dateInput) {
        const hoy = new Date();
        hoy.setDate(hoy.getDate() + 2); // Mínimo 48h
        const fechaMinima = hoy.toISOString().split('T')[0];
        dateInput.setAttribute('min', fechaMinima);
    }

    // --- VALIDACIONES EN TIEMPO REAL ---

    // Nombre: Al menos dos palabras
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            const namePattern = /^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s[a-zA-ZÀ-ÿ\u00f1\u00d1]+)+$/;
            const isValid = namePattern.test(nameInput.value.trim());
            nameInput.classList.toggle('is-valid', isValid);
            nameInput.classList.toggle('is-invalid', !isValid && nameInput.value !== "");
        });
    }

    // Email: Formato .com o .es
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.(com|es)$/;
            const isValid = emailPattern.test(emailInput.value);
            emailInput.classList.toggle('is-valid', isValid);
            emailInput.classList.toggle('is-invalid', !isValid && emailInput.value !== "");
        });
    }

    if (dateInput) {
        // 1. Configurar fecha mínima (Hoy + 2 días)
        const hoy = new Date();
        hoy.setDate(hoy.getDate() + 2);
        const fechaMinima = hoy.toISOString().split('T')[0];
        dateInput.setAttribute('min', fechaMinima);

        dateInput.addEventListener('input', () => {
            const fechaSeleccionada = new Date(dateInput.value);
            const anio = fechaSeleccionada.getFullYear();

            // VALIDACIÓN: El año debe tener 4 dígitos y estar dentro de un rango lógico
            // Si el año es mayor a 9999 o menor a 1000, es inválido
            const anioValido = anio > 1000 && anio <= 9999;

            // Comprobación de las 48h
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() + 2);
            fechaLimite.setHours(0, 0, 0, 0);
            fechaSeleccionada.setHours(0, 0, 0, 0);

            if (dateInput.value !== "" && anioValido && fechaSeleccionada >= fechaLimite) {
                dateInput.classList.remove('is-invalid');
                dateInput.classList.add('is-valid');
                if (dateError) dateError.classList.add('d-none');
            } else {
                dateInput.classList.remove('is-valid');
                if (dateInput.value !== "") {
                    dateInput.classList.add('is-invalid');
                    if (dateError) dateError.classList.remove('d-none');
                }
            }
        });
    }

    const phoneInput = document.getElementById('phoneInput');
    const phoneError = document.getElementById('phoneError');

    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            // Expresión regular: solo números, exactamente 9 dígitos
            const phonePattern = /^[0-9]{9}$/;
            const isValid = phonePattern.test(phoneInput.value);

            // Bloquear entrada de caracteres no numéricos
            phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '');

            if (isValid) {
                phoneInput.classList.remove('is-invalid');
                phoneInput.classList.add('is-valid');
                if (phoneError) phoneError.classList.add('d-none');
            } else {
                phoneInput.classList.remove('is-valid');
                if (phoneInput.value !== "") {
                    phoneInput.classList.add('is-invalid');
                    if (phoneError) phoneError.classList.remove('d-none');
                }
            }
        });
    }
    // Detalles: Mínimo 20 caracteres
    if (detailsInput) {
        detailsInput.addEventListener('input', () => {
            const isValid = detailsInput.value.trim().length >= 20;
            detailsInput.classList.toggle('is-valid', isValid);
            detailsInput.classList.toggle('is-invalid', !isValid && detailsInput.value !== "");
        });
    }

    // 3. ENVÍO DEL FORMULARIO
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validar todos los campos requeridos antes de procesar
            const inputs = orderForm.querySelectorAll('[required]');
            let formValido = true;

            inputs.forEach(input => {
                if (!input.classList.contains('is-valid')) {
                    input.classList.add('is-invalid');
                    formValido = false;
                }
            });

            if (!formValido) {
                const firstError = orderForm.querySelector('.is-invalid');
                if (firstError) firstError.focus();
                return;
            }

            // Si es válido, ejecutar animación de envío
            const btn = orderForm.querySelector('button[type="submit"]');
            const feedback = document.getElementById('formFeedback');

            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Procesando...';

            setTimeout(() => {
                orderForm.style.display = 'none';
                feedback.classList.remove('d-none');
                feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 1500);
        });
    }

    // 4. SCROLL SUAVE
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
});