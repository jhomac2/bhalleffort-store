document.addEventListener('DOMContentLoaded', () => {
    // Selecciona el botón de menú y el menú de navegación principal
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    // Añade la funcionalidad al hacer clic
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            // Alterna la clase 'menu-active' en el cuerpo (body)
            // Esta clase es la que el CSS utiliza para mostrar el menú
            document.body.classList.toggle('menu-active');
        });
    }
});
