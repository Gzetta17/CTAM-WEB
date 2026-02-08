const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs'); // Para manejar archivos (borrar el antiguo)
const multer = require('multer');
const Popup = require('../models/Popup');
// NOTA: Se ha quitado la importación de verifyToken ya que se solicitó evitar middlewares de autenticación

// --- 1. Configuración de Multer (Almacenamiento de Archivos) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'uploads', 'popup');
        // Asegurarse de que la carpeta de destino exista
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generar un nombre único para evitar conflictos
        cb(null, 'popup_main_' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- 2. Rutas de la API ---

// 🎯 GET /api/popup
// Devuelve el estado actual del Pop-Up (para que el cliente lo muestre o el admin lo edite)
router.get('/', async (req, res) => {
    try {
        let popupConfig = await Popup.findOne({});
        
        if (!popupConfig) {
            // Inicializa la configuración si no existe
            popupConfig = await Popup.create({ show: false, imageUrl: '' });
        }

        res.json({
            show: popupConfig.show,
            imageUrl: popupConfig.imageUrl // Ej: /uploads/popup/popup_main_1678888888888.jpg
        });
    } catch (error) {
        console.error('Error al obtener la configuración del Pop-Up:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener la configuración.' });
    }
});


// 🎯 POST /api/popup
// Actualiza el Pop-Up (subida de imagen y cambio de estado)
// **NOTA: Esta ruta NO usa autenticación (verifyToken)**
router.post('/', upload.single('popupImage'), async (req, res) => {
    const { show } = req.body;
    
    // Convertir el string 'true'/'false' del FormData a booleano
    const newShowState = show === 'true';

    try {
        let updateData = { show: newShowState, updatedAt: Date.now() };
        let popupConfig = await Popup.findOne({});

        if (!popupConfig) {
            popupConfig = await Popup.create(updateData);
        }

        // 1. Manejo de la imagen: si se subió un nuevo archivo
        if (req.file) {
            const newImageUrl = `/uploads/popup/${req.file.filename}`;
            
            // Si ya existía una imagen antigua, la borramos del sistema de archivos
            if (popupConfig.imageUrl) {
                const oldImagePath = path.join(__dirname, '..', popupConfig.imageUrl);
                // Asegurarse de que el archivo existe y es la imagen por defecto para no borrar la carpeta
                if (fs.existsSync(oldImagePath) && oldImagePath.includes('/uploads/popup/')) {
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error('Error al borrar imagen antigua:', err);
                    });
                }
            }
            
            updateData.imageUrl = newImageUrl;
        }

        // 2. Actualizar la configuración en la base de datos
        // Utilizamos findOneAndUpdate para asegurar que solo haya un documento de configuración
        await Popup.findOneAndUpdate({}, { $set: updateData }, { new: true, upsert: true });

        return res.json({ message: 'Configuración del Pop-Up actualizada correctamente.', show: newShowState });

    } catch (error) {
        console.error('Error al guardar la configuración del Pop-Up:', error);
        
        // Si hay un error, asegurarnos de borrar el archivo subido si existe
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error al borrar archivo subido tras un fallo:', err);
            });
        }

        res.status(500).json({ message: 'Error interno del servidor al actualizar el Pop-Up.' });
    }
});

module.exports = router;