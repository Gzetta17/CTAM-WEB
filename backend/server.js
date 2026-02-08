const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para habilitar CORS
app.use(cors());

// Middleware para servir archivos estáticos desde la carpeta 'uploads'
// Esto es VITAL para que las imágenes de comercios, noticias y promociones se vean
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para servir archivos estáticos de la carpeta 'public'
// Todos los archivos HTML (index, about, service, etc.) se sirven desde aquí.
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
// ✅ CORRECCIÓN FINAL: Cambiamos 'localhost' a '127.0.0.1' para solucionar 
// problemas de resolución de nombre que causan el "timed out"
mongoose.connect('mongodb://127.0.0.1:27017/ctam_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err);
    // IMPORTANTE: Un error en la conexión a DB puede hacer que las rutas fallen.
    // Aunque el servidor arranque, las rutas que usan la DB fallarán internamente.
});

// Rutas de la API
// Asegúrate de que estos archivos existan en './routes/' y sus respectivos modelos en './models/':
const authRoutes = require('./routes/auth');
const popupRoutes = require('./routes/popup');
const comercioRoutes = require('./routes/comercio');
const noticiaRoutes = require('./routes/noticia');
const promocionRoutes = require('./routes/promociones'); 

// Mapeo de rutas para APIs
app.use('/api/auth', authRoutes);
// ✅ CORRECCIÓN: Usar '/api/popup' como prefijo para las rutas definidas en popup.js
app.use('/api/popup', popupRoutes); 
app.use('/api/comercios', comercioRoutes); 
app.use('/api/noticias', noticiaRoutes);   
app.use('/api/promociones', promocionRoutes); 

// Ping o Ruta de inicio que redirige al index.html de la carpeta public
app.get('/', (req, res) => {
    // Para sitios estáticos, es mejor redirigir al archivo principal:
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    // Rutas estáticas clave para probar (actualizadas según tu estructura de archivos):
    console.log(`\n--- Vistas Principales ---`);
    console.log(`🏠 Inicio: http://localhost:${PORT}/`);
    console.log(`👤 Sobre Nosotros: http://localhost:${PORT}/about.html`);
    console.log(`📰 Noticias: http://localhost:${PORT}/noticias.html`);
    // Corregido: Ahora apunta a blog.html, que es la página de Promociones
    console.log(`🎁 Promociones: http://localhost:${PORT}/blog.html`); 
    console.log(`✍️ Blog (Alternativa/Antigua): http://localhost:${PORT}/blog.html`);
    console.log(`🛠️ Servicios: http://localhost:${PORT}/service.html`);
    console.log(`📞 Contacto: http://localhost:${PORT}/contact.html`);
    console.log(`\n--- Vistas Detalle/Secundarias ---`);
    console.log(`🔍 Detalle Comercio: http://localhost:${PORT}/comercio_detalle.html`);
    console.log(`🔍 Detalle Noticia: http://localhost:${PORT}/noticia_detalle.html`);
    console.log(`📺 CTAMTV: http://localhost:${PORT}/ctamtv.html`);
    console.log(`🛰️ GPSCAM: http://localhost:${PORT}/gpscam.html`);
    console.log(`🌐 Internet: http://localhost:${PORT}/internet.html`);
    console.log(`💧 Saneamiento: http://localhost:${PORT}/saneamiento.html`);
    console.log(`💳 Tarjeta: http://localhost:${PORT}/tarjeta.html`);
    console.log(`📱 Telefonía: http://localhost:${PORT}/telefonia.html`);
    console.log(`\n--- APIs (Backend) ---`);
    console.log(`🔐 Autenticación API: http://localhost:${PORT}/api/auth`);
    console.log(`📢 Popups API: http://localhost:${PORT}/api/popup`);
    console.log(`🛍️ Comercios API: http://localhost:${PORT}/api/comercios`);
    console.log(`⭐ Noticias API: http://localhost:${PORT}/api/noticias`);
    console.log(`⭐ Promociones API: http://localhost:${PORT}/api/promociones`);
});