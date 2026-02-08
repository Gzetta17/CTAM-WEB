// login.js (Versión Final y Completa)

document.addEventListener('DOMContentLoaded', () => {
    // --- Constantes y Configuración Global ---
    const API_BASE = 'http://localhost:3000';

    // --- SECCIÓN DE UTILIDAD: CONSTRUCCIÓN DE LA URL ---
    function buildImageUrl(imagePath) {
        if (!imagePath || imagePath.startsWith('http')) {
            const finalUrl = imagePath || 'https://placehold.co/600x400?text=Imagen+No+Disponible';
            console.log(`[DEBUG IMAGES] Path de DB: ${imagePath} -> URL generada: ${finalUrl} (Es Placeholder o Externa)`);
            return finalUrl;
        }

        // 1. Limpia cualquier barra inicial o final del path guardado en DB
        // Esto convierte '/uploads/file.png' o 'uploads/file.png' en 'uploads/file.png'
        let cleanedPath = imagePath.replace(/^\/|\/$/g, ''); 
        
        // 2. Construye la URL final usando la API_BASE y la ruta limpia.
        // Quedará http://localhost:3000/uploads/file.png
        const finalUrl = `${API_BASE}/${cleanedPath}`;
        
        // Muestra la URL construida para que el usuario pueda probarla
        console.log(`[DEBUG IMAGES] Path de DB: ${imagePath} -> URL generada: ${finalUrl}`);

        return finalUrl;
    }
    // ----------------------------------------------------
    
    // --- Selección de Elementos del DOM ---
    const loginForm = document.getElementById('loginForm');
    const loginMenuBtn = document.getElementById('loginMenuBtn');
    const logoutButton = document.getElementById('logoutButton');
    const statusMessage = document.getElementById('statusMessage');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const adminToggleBtn = document.getElementById('adminToggleBtn'); 
    const adminDropMenu = document.getElementById('adminDropMenu'); 

    const noticiasContainer = document.getElementById('noticiasContainer');
    const agregarNoticiaBtn = document.getElementById('agregarNoticiaBtn');
    const agregarNoticiaForm = document.getElementById('agregarNoticiaForm'); 
    const editarNoticiaForm = document.getElementById('editarNoticiaForm');

    // --- Inicialización de Modales de Bootstrap ---
    const loginPopup = document.getElementById('loginPopup') ? new bootstrap.Modal(document.getElementById('loginPopup')) : null;
    const agregarNoticiaModal = document.getElementById('agregarNoticiaModal') ? new bootstrap.Modal(document.getElementById('agregarNoticiaModal')) : null;
    const editarNoticiaModal = document.getElementById('editarNoticiaModal') ? new bootstrap.Modal(document.getElementById('editarNoticiaModal')) : null;
    const confirmModal = document.getElementById('confirmModal') ? new bootstrap.Modal(document.getElementById('confirmModal')) : null;
    
    // --- Estado de la Aplicación ---
    let token = localStorage.getItem('token');
    let isAuthenticated = !!token;

    // --- Funciones de Utilidad (El resto se mantiene igual) ---

    function showStatusMessage(message, isError = false) {
        if (!statusMessage) return;
        statusMessage.textContent = message;
        statusMessage.className = `alert mt-3 ${isError ? 'alert-danger' : 'alert-success'}`;
        statusMessage.style.display = 'block';
        setTimeout(() => { statusMessage.style.display = 'none'; }, 3000);
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

            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);

            confirmBtn.addEventListener('click', onConfirm, { once: true });
            cancelBtn.addEventListener('click', onCancel, { once: true });
            
            confirmModal.show();
        });
    }

    // --- Lógica de Autenticación (Login/Logout) ---

    function updateUI() {
        if (isAuthenticated) {
            if (loginMenuBtn) loginMenuBtn.style.display = 'none';
            if (logoutButton) logoutButton.style.display = 'block';
            if (agregarNoticiaBtn) agregarNoticiaBtn.style.display = 'block';
        } else {
            if (loginMenuBtn) loginMenuBtn.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
            if (agregarNoticiaBtn) agregarNoticiaBtn.style.display = 'none';
        }
        if (noticiasContainer) loadNoticias();
    }

    async function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = passwordInput.value;
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
    

    // --- Lógica de Gestión de Noticias (CRUD) ---

    async function submitNoticiaForm(url, method, formData, submitBtn) {
        submitBtn.disabled = true;
        
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const fetchOptions = {
                method,
                headers: headers,
                body: formData,
            };

            const res = await fetch(url, fetchOptions);
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message || 'Error al procesar la solicitud.');
            
            showStatusMessage(`Noticia ${method === 'POST' ? 'agregada' : 'editada'} correctamente.`);
            return true;
        } catch (error) {
            showStatusMessage(error.message, true);
            return false;
        } finally {
            submitBtn.disabled = false;
        }
    }

    async function handleCreateNoticia(e) {
        e.preventDefault();
        
        if (!agregarNoticiaForm) {
            return showStatusMessage('Error: El formulario de agregar noticia no se encontró.', true);
        }
        
        const formData = new FormData(agregarNoticiaForm);
        
        if (!formData.get('nombre') || !formData.get('categoria') || !formData.get('contenido') || !formData.get('imagen') || formData.get('imagen').size === 0) {
            return showStatusMessage('Todos los campos, incluida la imagen, son obligatorios.', true);
        }

        const success = await submitNoticiaForm(`${API_BASE}/api/noticias`, 'POST', formData, e.submitter);
        
        if (success) {
            agregarNoticiaForm.reset();
            if (agregarNoticiaModal) {
                agregarNoticiaModal.hide();
            }
            loadNoticias();
        }
    }

    async function handleUpdateNoticia(e) {
        e.preventDefault();
        
        const noticiaId = document.getElementById('editarNoticiaId').value;
        const formData = new FormData(editarNoticiaForm);
        
        if (document.getElementById('editarNoticiaImagen').files.length === 0) {
            formData.delete('imagen');
        }

        const success = await submitNoticiaForm(`${API_BASE}/api/noticias/${noticiaId}`, 'PUT', formData, e.submitter);
        if (success) {
            if (editarNoticiaModal) {
                editarNoticiaModal.hide();
            }
            loadNoticias();
        }
    }

    async function deleteNoticia(id) {
        const confirmed = await showConfirmation('¿Estás seguro de que deseas eliminar esta noticia?');
        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE}/api/noticias/${id}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al eliminar. ¿Falta autenticación?');
            }
            showStatusMessage('Noticia eliminada correctamente.');
            loadNoticias();
        } catch (error) {
            showStatusMessage(error.message, true);
        }
    }
    
    // --- Lógica de Renderizado de Tarjetas ---

    function renderNoticias(items) {
        if (!noticiasContainer) return;
        noticiasContainer.innerHTML = '';

        if (items.length === 0) {
            noticiasContainer.innerHTML = '<p class="col-12 text-center text-white">No hay noticias para mostrar.</p>';
            return;
        }

        // 1. Clonamos el array y lo invertimos para que las más nuevas estén primero
        // Usamos [...items] para no modificar el array original
        const noticiasInvertidas = [...items].reverse();

        // 2. Detectamos si estamos en el index
        const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('');
        
        // 3. Si es el index, tomamos solo las primeras 5 (que ahora son las últimas creadas)
        const noticiasAMostrar = isIndex ? noticiasInvertidas.slice(0, 5) : noticiasInvertidas;

        noticiasAMostrar.forEach(item => {
            const imageUrl = buildImageUrl(item.imagen);
            const detailUrl = `./noticia_detalle.html?id=${item._id}`; 
            
            const adminButtons = isAuthenticated ? `
                <div class="buttons" style="display: flex; gap: 10px; padding: 10px; justify-content: center;">
                    <button class="btn-modificar" data-id="${item._id}" style="background: #6f2486; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Editar</button>
                    <button class="btn-eliminar" data-id="${item._id}" style="background: #d9534f; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Eliminar</button>
                </div>
            ` : '';

            const cardHTML = `
                <div class="noticiaCard" style="margin-bottom: 20px;">
                    <a href="${detailUrl}" class="card-link-wrapper" style="text-decoration: none; color: inherit;">
                        <img src="${imageUrl}" alt="${item.nombre}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 15px 15px 0 0;">
                        <h3 style="padding: 15px; margin: 0; font-size: 1.1rem; color: white; text-align: center;">${item.nombre}</h3>
                    </a>
                    ${adminButtons}
                </div>
            `;
            noticiasContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
    }
    
    
    async function loadNoticias() {
        if (!noticiasContainer) return;
        noticiasContainer.innerHTML = '<p class="col-12 text-center text-white">Cargando noticias...</p>'; 
        try {
            const res = await fetch(`${API_BASE}/api/noticias`); 
            if (!res.ok) throw new Error('No se pudieron cargar las noticias.');
            const noticias = await res.json();
            renderNoticias(noticias);
        } catch (error) {
            noticiasContainer.innerHTML = `<p class="col-12 text-center text-danger">${error.message}. Asegúrese de que el backend esté corriendo en ${API_BASE}</p>`;
        }
    }
    
    async function fillEditForm(id) {
        try {
            const res = await fetch(`${API_BASE}/api/noticias/${id}`);
            if (!res.ok) throw new Error('No se pudo cargar la noticia.');
            const item = await res.json();

            document.getElementById('editarNoticiaId').value = item._id;
            document.getElementById('editarNoticiaNombre').value = item.nombre || '';
            document.getElementById('editarNoticiaCategoria').value = item.categoria || '';
            document.getElementById('editarNoticiaContenido').value = item.contenido || '';
            
            document.getElementById('editarNoticiaImagen').value = ''; 

            if (editarNoticiaModal) editarNoticiaModal.show();
        } catch (error) {
            showStatusMessage(error.message, true);
        }
    }
    
    // --- Asignación de Event Listeners ---
    
    if (adminToggleBtn) {
        adminToggleBtn.addEventListener('click', () => {
            if (adminDropMenu) {
                adminDropMenu.classList.toggle('visible');
            }
        });
    }

    if (loginMenuBtn) loginMenuBtn.addEventListener('click', () => {
        if(loginPopup) loginPopup.show();
    });
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.textContent = type === 'password' ? '👁️' : '🔒';
        });
    }

    if (agregarNoticiaBtn) agregarNoticiaBtn.addEventListener('click', () => {
        if(agregarNoticiaModal) agregarNoticiaModal.show();
        if (adminDropMenu) adminDropMenu.classList.remove('visible');
    });

    if (agregarNoticiaForm) agregarNoticiaForm.addEventListener('submit', handleCreateNoticia);
    if (editarNoticiaForm) editarNoticiaForm.addEventListener('submit', handleUpdateNoticia);
    
    if (noticiasContainer) {
        noticiasContainer.addEventListener('click', (e) => {
            const editButton = e.target.closest('.btn-modificar');
            const deleteButton = e.target.closest('.btn-eliminar');

            if (editButton) {
                const id = editButton.dataset.id;
                fillEditForm(id);
            }
            if (deleteButton) {
                const id = deleteButton.dataset.id;
                deleteNoticia(id);
            }
        });
    }

    // --- Inicialización al Cargar la Página ---
    initializePage();
    
    function initializePage() {
        updateUI();
    }
});
