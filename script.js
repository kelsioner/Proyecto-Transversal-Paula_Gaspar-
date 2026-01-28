document.addEventListener('DOMContentLoaded', () => {

    //GESTIÓN AUTOMÁTICA DE CLASE ACTIVE EN NAVBAR
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

    //ELEMENTOS DEL FORMULARIO DE ENCARGOS
    const orderForm = document.getElementById('orderForm');
    const nameInput = document.getElementById('nameInput');
    const surnameInput = document.getElementById('surnameInput');
    const emailInput = document.getElementById('emailInput');
    const phoneInput = document.getElementById('phoneInput');
    const dateInput = document.getElementById('dateInput');
    const detailsInput = document.getElementById('detailsInput');
    const dateError = document.getElementById('dateError');
    const phoneError = document.getElementById('phoneError');

    // --- VALIDACIONES EN TIEMPO REAL ---

    // Nombre: Al menos una palabra
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            const namePattern = /^[a-zA-ZÀ-ÿ\s]+$/;
            const isValid = namePattern.test(nameInput.value.trim()) && nameInput.value.trim().length > 0;
            nameInput.classList.toggle('is-valid', isValid);
            nameInput.classList.toggle('is-invalid', !isValid && nameInput.value !== "");
        });
    }

    // Apellidos: Al menos una palabra
    if (surnameInput) {
        surnameInput.addEventListener('input', () => {
            const surnamePattern = /^[a-zA-ZÀ-ÿ\s]+$/;
            const isValid = surnamePattern.test(surnameInput.value.trim()) && surnameInput.value.trim().length > 0;
            surnameInput.classList.toggle('is-valid', isValid);
            surnameInput.classList.toggle('is-invalid', !isValid && surnameInput.value !== "");
        });
    }

    // Email: Formato .com o .es (insensible a mayúsculas)
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.(com|es)$/;
            const isValid = emailPattern.test(emailInput.value.toLowerCase());
            emailInput.classList.toggle('is-valid', isValid);
            emailInput.classList.toggle('is-invalid', !isValid && emailInput.value !== "");
        });
    }

    // Teléfono: 9 dígitos
    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            const phonePattern = /^[0-9]{9}$/;
            
            // Bloquear entrada de caracteres no numéricos
            phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '');
            
            const isValid = phonePattern.test(phoneInput.value);

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

    // --- CONFIGURACIÓN DE FECHA ---
    if (dateInput) {
        // Lista de días festivos de Castilla-La Mancha (mes-día)
        const diasFestivos = [
            '01-01', // Año Nuevo
            '01-06', // Reyes
            '04-09', // Día de Castilla-La Mancha
            '05-01', // Día del Trabajo
            '08-15', // Asunción
            '10-12', // Hispanidad
            '11-01', // Todos los Santos
            '12-06', // Constitución
            '12-25'  // Navidad
        ];

        // Función para verificar si es festivo
        const esFestivo = (fecha) => {
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const dia = String(fecha.getDate()).padStart(2, '0');
            return diasFestivos.includes(`${mes}-${dia}`);
        };

        // Función para verificar si es domingo
        const esDomingo = (fecha) => fecha.getDay() === 0;

        // Configurar fechas mínima y máxima
        const hoy = new Date();
        hoy.setDate(hoy.getDate() + 2); // Mínimo 48h
        const fechaMinima = hoy.toISOString().split('T')[0];
        dateInput.setAttribute('min', fechaMinima);
        
        // Establecer máximo al 31 de diciembre del año actual (dinámico)
        const actualizarMax = () => {
            const anioActual = new Date().getFullYear();
            const fechaMaxima = `${anioActual}-12-31`;
            dateInput.setAttribute('max', fechaMaxima);
        };
        actualizarMax();
        
        // Validar fecha seleccionada
        dateInput.addEventListener('input', () => {
            if (!dateInput.value) {
                dateInput.classList.remove('is-valid', 'is-invalid');
                if (dateError) dateError.classList.add('d-none');
                return;
            }

            const fechaSeleccionada = new Date(dateInput.value + 'T00:00:00');
            const anio = fechaSeleccionada.getFullYear();
            const anioActualDinamico = new Date().getFullYear();
            
            // Validar año actual
            if (anio !== anioActualDinamico) {
                dateInput.value = '';
                dateInput.classList.add('is-invalid');
                dateInput.classList.remove('is-valid');
                if (dateError) {
                    dateError.classList.remove('d-none');
                    dateError.textContent = 'Solo se aceptan fechas del año actual.';
                }
                return;
            }

            // Validar domingo
            if (esDomingo(fechaSeleccionada)) {
                dateInput.classList.add('is-invalid');
                dateInput.classList.remove('is-valid');
                if (dateError) {
                    dateError.classList.remove('d-none');
                    dateError.textContent = 'No realizamos pedidos los domingos.';
                }
                return;
            }

            // Validar festivo
            if (esFestivo(fechaSeleccionada)) {
                dateInput.classList.add('is-invalid');
                dateInput.classList.remove('is-valid');
                if (dateError) {
                    dateError.classList.remove('d-none');
                    dateError.textContent = 'No realizamos pedidos en días festivos.';
                }
                return;
            }

            // Comprobación de las 48h
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() + 2);
            fechaLimite.setHours(0, 0, 0, 0);

            if (fechaSeleccionada >= fechaLimite) {
                dateInput.classList.remove('is-invalid');
                dateInput.classList.add('is-valid');
                if (dateError) dateError.classList.add('d-none');
            } else {
                dateInput.classList.add('is-invalid');
                dateInput.classList.remove('is-valid');
                if (dateError) {
                    dateError.classList.remove('d-none');
                    dateError.textContent = 'La fecha debe ser al menos 48 horas después de hoy.';
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

    // ENVÍO DEL FORMULARIO
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
                if (firstError) {
                    firstError.focus();
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
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

    // SCROLL SUAVE
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
});