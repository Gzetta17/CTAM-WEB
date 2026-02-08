const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Configuración de Destino y Nombre de Archivo ---

const storage = multer.diskStorage({
    // Define la carpeta de destino basada en el tipo de archivo
    destination: (req, file, cb) => {
        let folder = '';
        // Esta lógica usa la URL de la petición para determinar la subcarpeta
        // de destino (comercios, noticias o promociones) dentro de 'uploads'.
        if (req.originalUrl.includes('/comercios')) {
            folder = 'comercios';
        } else if (req.originalUrl.includes('/noticias')) {
            folder = 'noticias';
        } else if (req.originalUrl.includes('/promociones')) {
            // DIRECTORIO PARA PROMOCIONES 
            folder = 'promociones';
        }

        // --- RUTA CORREGIDA ---
        // Apunta a la carpeta 'uploads' que está DENTRO del mismo directorio 'backend'
        // donde se encuentra el middleware y las rutas.
        const uploadPath = path.join(__dirname, '..', 'uploads', folder);
        
        // Crea la carpeta si no existe (importante para que no falle la subida)
        fs.mkdirSync(uploadPath, { recursive: true });
        
        cb(null, uploadPath);
    },
    
    // Define el nombre del archivo: timestamp + extensión original
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// --- Configuración del Middleware Multer ---
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Límite de 5MB
    fileFilter: (req, file, cb) => {
        // Acepta sólo archivos de imagen
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no soportado. Sólo se permiten imágenes (jpeg, jpg, png, gif).'));
        }
    }
});

module.exports = upload;