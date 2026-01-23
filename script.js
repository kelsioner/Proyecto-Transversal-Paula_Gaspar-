document.addEventListener('DOMContentLoaded', () => {
    
    // 1. GESTIÓN AUTOMÁTICA DE CLASE ACTIVE EN NAVBAR
    // Detecta en qué página estamos y marca el link correspondiente
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

    // 2. VALIDACIÓN Y FEEDBACK DE FORMULARIOS
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const feedback = form.nextElementSibling || document.getElementById('formFeedback');

            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';
            }

            // Simulación de envío
            setTimeout(() => {
                form.style.display = 'none';
                if (feedback) {
                    feedback.classList.remove('d-none');
                    feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 1500);
        });
    });

    // 3. EFECTO DE SCROLL SUAVE PARA ENLACES INTERNOS
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});