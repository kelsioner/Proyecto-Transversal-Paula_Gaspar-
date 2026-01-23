document.addEventListener('DOMContentLoaded', () => {
    
    // Filtrado de productos
    const filterButtons = document.querySelectorAll('.filter-btn');
    const products = document.querySelectorAll('.product-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            products.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    item.classList.add('animate-in'); // Podrías añadir animaciones CSS
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Validación y feedback de formularios
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const feedback = form.nextElementSibling || document.getElementById('formFeedback');
            
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Enviando...';

            setTimeout(() => {
                form.classList.add('d-none');
                if(feedback) feedback.classList.remove('hidden', 'd-none');
            }, 1500);
        });
    });
});