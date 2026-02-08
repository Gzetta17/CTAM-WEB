// La URL base de la API. En un entorno de producción, esto debería ser una variable de entorno.
const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM y Variables de Estado ---
    const adminToggleBtn = document.getElementById('adminToggleBtn');
    const loginButton = document.querySelector('[data-bs-target="#loginPopup"]'); 
    const logoutButton = document.getElementById('logoutButton');
    const loginForm = document.getElementById('loginForm');
    const statusMessage = document.getElementById('statusMessage');

    // Elementos del Pop-Up (Admin y Público)
    const managePopupButton = document.getElementById('managePopupButton'); 
    const popupImageForm = document.getElementById('popupImageForm'); 
    const popupImageFile = document.getElementById('popupImageFile');
    const showPopupToggle = document.getElementById('showPopupToggle');
    const popupStatus = document.getElementById('popupStatus');
    const publicImage = document.getElementById('publicImage'); 
    
    // Inicialización de Modales de Bootstrap
    const loginPopupElement = document.getElementById('loginPopup');
    const loginPopup = loginPopupElement ? new bootstrap.Modal(loginPopupElement) : null;
    
    const managePopupModalElement = document.getElementById('managePopupModal');
    const managePopupModal = managePopupModalElement ? new bootstrap.Modal(managePopupModalElement) : null;
    
    const publicPopupElement = document.getElementById('publicPopup');
    const publicPopupModal = publicPopupElement ? new bootstrap.Modal(publicPopupElement) : null;

    let token = localStorage.getItem('token');
    let isAuthenticated = !!token;

    // --- Funciones de Utilidad ---

    /** Muestra un mensaje de estado temporal en la UI */
    function showStatusMessage(message, isError = false) {
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.className = `alert mt-3 ${isError ? 'alert-danger' : 'alert-success'}`;
            statusMessage.style.display = 'block';
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 3000);
        }
    }

    /** 🚀 Actualiza la visibilidad de los botones (Login/Logout/Admin) */
    function updateAdminButtons() {
        const loginMenuBtn = document.getElementById('loginMenuBtn');
        const logoutButton = document.getElementById('logoutButton'); 
        const managePopupButton = document.getElementById('managePopupButton');

        // 1. Detección de página para el botón POP-UP
        const path = window.location.pathname.toLowerCase();
        const esPaginaIndex = (path === '/' || path.endsWith('/index.html') || path.endsWith('/ctam/')); 

        if (isAuthenticated) {
            // Usuario autenticado
            if (loginMenuBtn) loginMenuBtn.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'block';
            
            // Muestra el botón POP-UP solo si estamos en el index
            if (managePopupButton) {
                if (esPaginaIndex) {
                    managePopupButton.style.display = 'block';
                } else {
                    managePopupButton.style.display = 'none'; 
                }
            }

        } else {
            // Usuario no autenticado
            if (loginMenuBtn) loginMenuBtn.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
            if (managePopupButton) managePopupButton.style.display = 'none';
        }
    }

    function openLoginModal() {
        if (loginPopup) loginPopup.show();
    }
    
    // --- Lógica de Autenticación (Login/Logout) ---

    if (adminToggleBtn) {
        adminToggleBtn.addEventListener('click', () => {
            const adminDropMenu = document.getElementById('adminDropMenu');
            if (adminDropMenu) adminDropMenu.classList.toggle('visible');
        });
    }

    const loginMenuBtn = document.getElementById('loginMenuBtn');
    if (loginMenuBtn) {
        loginMenuBtn.addEventListener('click', openLoginModal);
    } else if (loginButton) {
        loginButton.addEventListener('click', openLoginModal);
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            isAuthenticated = false;
            token = null; 
            updateAdminButtons();
            showStatusMessage('Sesión cerrada correctamente. Recargando página...');
            setTimeout(() => window.location.reload(), 500); 
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const submitButton = e.submitter;

            try {
                submitButton.disabled = true;
                const res = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('token', data.token);
                    isAuthenticated = true;
                    token = data.token; 
                    
                    if (loginPopup) loginPopup.hide();
                    updateAdminButtons(); 
                    showStatusMessage('¡Login exitoso! Recargando página...');
                    setTimeout(() => window.location.reload(), 500);
                } else {
                    const errorData = await res.json();
                    showStatusMessage(errorData.message || 'Credenciales incorrectas', true);
                }
            } catch (error) {
                console.error('Error de login:', error);
                showStatusMessage('Error de conexión con el servidor.', true);
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function (e) {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? '👁' : '🔒';
        });
    }
    
    // -------------------------------------------------------------------
    // --- LÓGICA POP-UP (ADMIN) ---
    // -------------------------------------------------------------------

    // Listener explícito para abrir el modal de gestión del Pop-Up
    if (managePopupButton && managePopupModal) {
        managePopupButton.addEventListener('click', () => {
            managePopupModal.show();
        });
    }

    // Cargar estado actual (al abrir el modal de gestión)
    if (managePopupModalElement) {
        managePopupModalElement.addEventListener('show.bs.modal', async () => {
            if (!isAuthenticated) return;
            try {
                const res = await fetch(`${API_BASE}/api/popup`);
                if (res.ok) {
                    const data = await res.json();
                    showPopupToggle.checked = data.show;
                }
                popupStatus.style.display = 'none'; 
            } catch (error) {
                console.error('Error al cargar estado del popup:', error);
                popupStatus.textContent = 'Error al cargar estado actual.';
                popupStatus.className = 'alert alert-danger';
                popupStatus.style.display = 'block';
            }
        });
    }

    // Enviar el formulario (Subir imagen y estado)
    if (popupImageForm) {
        popupImageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Asumiendo que la ruta POST /api/popup es pública para simplificar el frontend
            // (Si tuviera autenticación, habría que añadir el token en el header)

            const submitButton = e.submitter;
            submitButton.disabled = true;
            popupStatus.style.display = 'none';

            const formData = new FormData();
            
            if (popupImageFile.files.length > 0) {
                formData.append('popupImage', popupImageFile.files[0]);
            }
            
            // Enviar el estado del toggle (true/false)
            formData.append('show', showPopupToggle.checked);

            try {
                const res = await fetch(`${API_BASE}/api/popup`, {
                    method: 'POST', 
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    popupStatus.textContent = data.message || 'Pop-up actualizado con éxito.';
                    popupStatus.className = 'alert alert-success';
                    popupStatus.style.display = 'block';
                    setTimeout(() => {
                        if (managePopupModal) managePopupModal.hide();
                    }, 2000);
                } else {
                    const errorData = await res.json();
                    popupStatus.textContent = errorData.message || 'Error al actualizar.';
                    popupStatus.className = 'alert alert-danger';
                    popupStatus.style.display = 'block';
                }
            } catch (error) {
                console.error('Error al enviar formulario de popup:', error);
                popupStatus.textContent = 'Error de conexión con el servidor.';
                popupStatus.className = 'alert alert-danger';
                popupStatus.style.display = 'block';
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    // -------------------------------------------------------------------
    // --- LÓGICA POP-UP (VISITANTE Y ADMIN) ---
    // -------------------------------------------------------------------

    /** Comprueba y muestra el pop-up público si está activo (SE MUESTRA A TODOS) */
    async function checkAndShowPublicPopup() {
        if (!publicPopupModal || !publicImage) return; 

        // Se eliminó la restricción 'if (isAuthenticated) return;' para mostrar a todos.

        // Evitar mostrar el pop-up en cada recarga de página (usar sessionStorage)
        if (sessionStorage.getItem('popupShown')) return;

        try {
            // 1. Consultar a la API si el pop-up está activo
            const res = await fetch(`${API_BASE}/api/popup`);
            if (!res.ok) return;

            const data = await res.json();

            // 2. Si está activo (show: true) y tiene una imagen
            if (data.show && data.imageUrl) {
                // Se ajusta la ruta a la URL completa (ej: http://localhost:3000/uploads/popup/...)
                const imageUrl = data.imageUrl.startsWith('/') ? data.imageUrl : `/${data.imageUrl}`;
                // Se usa solo la ruta relativa si el API_BASE está causando problemas
                publicImage.src = imageUrl.startsWith('http') ? imageUrl : `${API_BASE}${imageUrl}`; 
                
                publicPopupModal.show();
                
                // Marcar como visto en esta sesión
                sessionStorage.setItem('popupShown', 'true');
            }
        } catch (error) {
            console.error('Error al cargar el pop-up público:', error);
        }
    }


    // --- Inicialización General ---

    // 1. Configura los botones (Login/Logout/Pop-up)
    updateAdminButtons();

    // 2. Comprueba si debe mostrar el pop-up público (a todos)
    checkAndShowPublicPopup(); 

});