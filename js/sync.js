// Este archivo se encarga de la sincronización del pop-up entre diferentes pestañas.
// La lógica de login y logout se maneja en el archivo login.js

// Función para verificar el estado de la imagen del pop-up en el almacenamiento local
function checkPopupState() {
    const storedImage = localStorage.getItem('popupImage');
    const popupNavButton = document.getElementById('popupNavButton');

    if (storedImage) {
        // Si hay una imagen guardada, muestra el botón para abrir el pop-up.
        if (popupNavButton) {
            popupNavButton.style.display = 'block';
        }
    } else {
        // Si no hay imagen, oculta el botón.
        if (popupNavButton) {
            popupNavButton.style.display = 'none';
        }
    }
}

// Escuchar cambios en el almacenamiento para actualizar sin recargar la página.
window.addEventListener('storage', checkPopupState);

// Al cargar la página, ejecutar la función para mostrar u ocultar el pop-up.
document.addEventListener('DOMContentLoaded', () => {
    checkPopupState();
});




 