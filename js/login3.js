// login3.js (Lógica para la página de Promociones - blog.html)

document.addEventListener('DOMContentLoaded', () => {
    // --- Constantes y Configuración Global ---
    const API_BASE = 'http://localhost:3000'; // Ajusta esto si usas Ngrok

    // --- Selección de Elementos del DOM ---
    const loginForm = document.getElementById('loginForm');
    const loginMenuBtn = document.getElementById('loginMenuBtn');
    const logoutButton = document.getElementById('logoutButton');
    const statusMessage = document.getElementById('statusMessage');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const adminToggleBtn = document.getElementById('adminToggleBtn'); 
    const adminDropMenu = document.getElementById('adminDropMenu'); 

    // *** ELEMENTOS PARA PROMOCIONES ***
    const promocionesContainer = document.getElementById('promocionesContainer');
    const agregarPromocionBtn = document.getElementById('agregarPromocionBtn');
    const agregarPromocionForm = document.getElementById('agregarPromocionForm'); 
    const editarPromocionForm = document.getElementById('editarPromocionForm');

    // Elementos del modal de edición
    const editarPromocionIdInput = document.getElementById('editarPromocionId');
    const editarPromocionNombreInput = document.getElementById('editarPromocionNombre');
    const editarPromocionDescripcionInput = document.getElementById('editarPromocionDescripcion'); 
    const editarPromocionImagenInput = document.getElementById('editarPromocionImagen');
    const currentImagePreview = document.getElementById('currentImagePreview'); 

    // --- Inicialización de Modales de Bootstrap ---
    const loginPopup = document.getElementById('loginPopup') ? new bootstrap.Modal(document.getElementById('loginPopup')) : null;
    const agregarPromocionModal = document.getElementById('agregarPromocionModal') ? new bootstrap.Modal(document.getElementById('agregarPromocionModal')) : null;
    const editarPromocionModal = document.getElementById('editarPromocionModal') ? new bootstrap.Modal(document.getElementById('editarPromocionModal')) : null;
    const confirmModal = document.getElementById('confirmModal') ? new bootstrap.Modal(document.getElementById('confirmModal')) : null;
    
    // --- Estado de la Aplicación ---
    let token = localStorage.getItem('token');
    let isAuthenticated = !!token;
    let currentEditingPromocion = null; 

    // --- Funciones de Utilidad ---

    function showStatusMessage(message, isError = false) {
        if (!statusMessage) return;
        statusMessage.textContent = message;
        statusMessage.className = `alert mt-3 ${isError ? 'alert-danger' : 'alert-success'}`;
        statusMessage.style.display = 'block';
        setTimeout(() => { statusMessage.style.display = 'none'; }, 3000);
    }

    function buildImageUrl(imagePath) {
        if (!imagePath) return 'https://placehold.co/600x400?text=Imagen+No+Disponible';
        // Asegurarse de que la ruta comience con /uploads/
        let cleanedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        if (!cleanedPath.startsWith('/uploads/')) {
            cleanedPath = `/uploads${cleanedPath}`;
        }
        return `${API_BASE}${cleanedPath}`;
    }

    function showConfirmation(message) {
        return new Promise((resolve) => {
            if (!confirmModal) {
                console.error("El modal de confirmación no existe en el HTML.");
                return resolve(false);
            }
            document.getElementById('confirmMessage').textContent = message;
            const confirmBtn = document.getElementById('confirmBtn');
            const cancelBtn = document.getElementById('cancelBtn');

            const onConfirm = () => { confirmModal.hide(); resolve(true); };
            const onCancel = () => { confirmModal.hide(); resolve(false); };

            confirmBtn.onclick = onConfirm; // Reasignar por si acaso
            cancelBtn.onclick = onCancel;
            
            // Eliminar listeners previos para evitar duplicados
            // Esto es importante si el modal se usa varias veces sin recargar
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            const newCancelBtn = cancelBtn.cloneNode(true);
            cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

            newConfirmBtn.onclick = onConfirm;
            newCancelBtn.onclick = onCancel;
            
            confirmModal.show();
        });
    }

    // --- Lógica de Autenticación (Login/Logout) ---

    function updateUI() {
        if (isAuthenticated) {
            if (loginMenuBtn) loginMenuBtn.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'block';
            if (agregarPromocionBtn) agregarPromocionBtn.style.display = 'block';
        } else {
            if (loginMenuBtn) loginMenuBtn.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
            if (agregarPromocionBtn) agregarPromocionBtn.style.display = 'none';
        }
        if (promocionesContainer) loadPromociones();
    }

    async function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = passwordInput ? passwordInput.value : '';
        const submitButton = e.submitter;
        if (!submitButton) return;
        submitButton.disabled = true;

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Credenciales incorrectas');

            localStorage.setItem('token', data.token);
            token = data.token;
            isAuthenticated = true;

            if (loginPopup) loginPopup.hide();
            showStatusMessage('¡Login exitoso! Recargando...');
            setTimeout(() => window.location.reload(), 500);

        } catch (error) {
            showStatusMessage(error.message, true);
        } finally {
            submitButton.disabled = false;
        }
    }
    
    function handleLogout() {
        localStorage.removeItem('token');
        isAuthenticated = false;
        token = null;
        showStatusMessage('Sesión cerrada. Recargando...');
        if (adminDropMenu) adminDropMenu.classList.remove('visible'); 
        setTimeout(() => window.location.reload(), 500);
    }
    
    // --- Lógica de Gestión de Promociones (CRUD) ---

    async function submitPromocionForm(url, method, formData, submitBtn) {
        submitBtn.disabled = true;
        const headers = {};
        if (token && method !== 'POST') { // No enviar 'Authorization' con FormData en POST si no es necesario para el backend
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        let fetchOptions = {
            method: method,
            body: formData // FormData se envía directamente, los headers Content-Type son automáticos
        };

        if (method !== 'POST') { // Para PUT/DELETE, puede que necesites Content-Type si no es FormData
             fetchOptions.headers = headers;
        } else {
             // Para POST con FormData, no especifiques Content-Type, el navegador lo hará
             // Si tu backend lo espera, asegúrate de que el middleware de multer esté bien configurado
             if (token) { // Si necesitas el token para POST también
                 fetchOptions.headers = { 'Authorization': `Bearer ${token}` };
             }
        }

        try {
            const res = await fetch(url, fetchOptions);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message || 'Error al procesar la solicitud.');
            
            showStatusMessage(`Promoción ${method === 'POST' ? 'agregada' : 'editada'} correctamente.`);
            return true;
        } catch (error) {
            showStatusMessage(error.message, true);
            return false;
        } finally {
            submitBtn.disabled = false;
        }
    }

    async function handleCreatePromocion(e) {
        e.preventDefault();
        if (!agregarPromocionForm) return;
        
        const formData = new FormData(agregarPromocionForm);
        
        // Asumiendo que los campos son nombre, descripcion, imagen
        if (!formData.get('nombre') || !formData.get('descripcion') || !formData.get('imagen') || formData.get('imagen').size === 0) {
            return showStatusMessage('El título, la descripción y la imagen son obligatorios.', true);
        }

        const success = await submitPromocionForm(`${API_BASE}/api/promociones`, 'POST', formData, e.submitter);
        
        if (success) {
            agregarPromocionForm.reset();
            if (agregarPromocionModal) agregarPromocionModal.hide();
            loadPromociones();
        }
    }

    async function handleUpdatePromocion(e) {
        e.preventDefault();
        if (!editarPromocionForm || !currentEditingPromocion) return;

        const submitBtn = e.submitter;
        const promocionId = currentEditingPromocion._id; 
        
        const formData = new FormData();
        formData.append('nombre', editarPromocionNombreInput.value);
        formData.append('descripcion', editarPromocionDescripcionInput.value); 

        const nuevaImagen = editarPromocionImagenInput.files[0];
        if (nuevaImagen) {
            formData.append('imagen', nuevaImagen);
        }
        
        const success = await submitPromocionForm(`${API_BASE}/api/promociones/${promocionId}`, 'PUT', formData, submitBtn);
        if (success) {
            if (editarPromocionModal) editarPromocionModal.hide();
            loadPromociones();
        }
    }

    async function deletePromocion(id) {
        const confirmed = await showConfirmation('¿Estás seguro de que deseas eliminar esta promoción?');
        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE}/api/promociones/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al eliminar.');
            }
            showStatusMessage('Promoción eliminada correctamente.');
            loadPromociones();
        } catch (error) {
            showStatusMessage(error.message, true);
        }
    }
    
    // --- Lógica de Renderizado de Tarjetas de Promociones ---

    function renderPromociones(items) {
        if (!promocionesContainer) return;
        promocionesContainer.innerHTML = '';
        const noContent = document.getElementById('no-content');
        
        if (items.length === 0) {
            if(noContent) noContent.style.display = 'block';
            return;
        }
        if(noContent) noContent.style.display = 'none';


        items.forEach(item => {
            const imageUrl = buildImageUrl(item.imagen);
            
            const adminButtons = isAuthenticated ? `
                <div class="blog-btn">
                    <button class="btn btn-warning btn-sm btn-modificar" data-id="${item._id}">Editar</button>
                    <button class="btn btn-danger btn-sm btn-eliminar" data-id="${item._id}">Eliminar</button>
                </div>
            ` : '';

            // 🎯 MODIFICACIÓN CLAVE AQUÍ: Usamos una estructura de tarjeta de noticia/comercio
            // con clases de Bootstrap y un div adicional para el contenido.
            const cardHTML = `
                <div class="col-lg-4 col-md-6 mb-4 wow fadeInUp" data-wow-delay="0.1s">
                    <div class="blog-item">
                        <div class="blog-img">
                            <img src="${imageUrl}" alt="${item.nombre}" onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Imagen+No+Disponible';" class="img-fluid">
                        </div>
                        <div class="blog-text">
                            <h3>${item.nombre}</h3>
                            <p>${item.descripcion || ''}</p>
                            ${adminButtons}
                        </div>
                    </div>
                </div>
            `;
            promocionesContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
    }
    
    async function loadPromociones() {
        if (!promocionesContainer) return;
        promocionesContainer.innerHTML = '<p class="col-12 text-center text-white">Cargando promociones...</p>'; 
        try {
            const res = await fetch(`${API_BASE}/api/promociones`); 
            if (!res.ok) throw new Error('No se pudieron cargar las promociones.');
            const promociones = await res.json();
            renderPromociones(promociones);
        } catch (error) {
            promocionesContainer.innerHTML = `<p class="col-12 text-center text-danger">${error.message}.</p>`;
        }
    }
    
    async function fillEditForm(id) {
        try {
            const res = await fetch(`${API_BASE}/api/promociones/${id}`);
            if (!res.ok) throw new Error('No se pudo cargar la promoción.');
            const item = await res.json();
            
            currentEditingPromocion = item; 

            editarPromocionIdInput.value = item._id;
            editarPromocionNombreInput.value = item.nombre || '';
            editarPromocionDescripcionInput.value = item.descripcion || ''; 
            editarPromocionImagenInput.value = ''; 

            if (currentImagePreview) {
                 currentImagePreview.src = buildImageUrl(item.imagen);
                 currentImagePreview.style.display = 'block';
            }

            if (editarPromocionModal) editarPromocionModal.show();
        } catch (error) {
            showStatusMessage(error.message, true);
        }
    }
    
    // --- Asignación de Event Listeners ---
    
    if (adminToggleBtn) {
        adminToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (adminDropMenu) {
                adminDropMenu.classList.toggle('visible');
            }
        });

        document.addEventListener('click', (e) => {
            const adminDropContainer = document.querySelector('.admin-drop-container');
            if (adminDropMenu && adminDropMenu.classList.contains('visible') && adminDropContainer && !adminDropContainer.contains(e.target)) {
                adminDropMenu.classList.remove('visible');
            }
        });
    }
    
    if (adminDropMenu) {
        adminDropMenu.querySelectorAll('button[data-bs-toggle="modal"]').forEach(button => {
            button.addEventListener('click', () => {
                adminDropMenu.classList.remove('visible');
            });
        });
    }


    if (loginMenuBtn) loginMenuBtn.addEventListener('click', () => { if(loginPopup) loginPopup.show(); });
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.textContent = type === 'password' ? '👁️' : '🔒';
        });
    }

    if (agregarPromocionBtn) {
        agregarPromocionBtn.addEventListener('click', () => {
            if(agregarPromocionModal) agregarPromocionModal.show();
        });
    }

    if (agregarPromocionForm) agregarPromocionForm.addEventListener('submit', handleCreatePromocion);
    if (editarPromocionForm) editarPromocionForm.addEventListener('submit', handleUpdatePromocion);
    
    if (promocionesContainer) {
        promocionesContainer.addEventListener('click', (e) => {
            const editButton = e.target.closest('.btn-modificar');
            const deleteButton = e.target.closest('.btn-eliminar');

            if (editButton) {
                fillEditForm(editButton.dataset.id); 
            }
            if (deleteButton) {
                deletePromocion(deleteButton.dataset.id);
            }
        });
    }

    // --- Inicialización al Cargar la Página ---
    initializePage();
    
    function initializePage() {
        updateUI();
    }
});

