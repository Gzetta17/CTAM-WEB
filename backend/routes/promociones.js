const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

 
// la importación debe ser:
const Promocion = require('../models/promociones'); 
// -----------------------------

// Si el modelo se llama 'promocion.js' (en singular), usa: 
// const Promocion = require('../models/promocion'); 


// Directorio de subidas (se crea si no existe)
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configuración de Multer para guardar la imagen con un nombre único
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `promocion-${Date.now()}${ext}`); // Nombre específico para promociones
    }
});
const upload = multer({ storage });

// =======================================================================
// RUTAS CRUD DE GESTIÓN (POST, PUT, DELETE) - Asumimos que son protegidas por auth
// =======================================================================

/** POST /promociones - Crear una nueva promoción */
router.post('/', upload.single('imagen'), async (req, res) => {
    try {
        // Validación de campos del formulario
        if (!req.file) return res.status(400).json({ error: 'No se recibió la imagen de la promoción' });
        
        if (!req.body.nombre || !req.body.descripcion) {
            // Eliminar el archivo si falla la validación del cuerpo
            fs.unlink(req.file.path, () => {}); 
            return res.status(400).json({ error: 'Faltan campos obligatorios (nombre o descripcion).' });
        }

        const nuevaPromocion = await Promocion.create({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion, 
            imagen: `/uploads/${req.file.filename}` // Guardamos la ruta pública
        });

        res.status(201).json(nuevaPromocion);
    } catch (err) {
        console.error('❌ Error al crear promoción:', err);
        // Si hay un error de DB después de subir el archivo, también lo eliminamos
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
        res.status(500).json({ error: 'Error en el servidor al crear promoción' });
    }
});

/** PUT /promociones/:id - Actualizar (opcionalmente la imagen) */
router.put('/:id', upload.single('imagen'), async (req, res) => {
    try {
        const { id } = req.params;

        const toUpdate = {
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
        };

        if (req.file) {
            // Si se sube una nueva imagen:
            const anterior = await Promocion.findById(id);
            if (anterior?.imagen) {
                // 1. Eliminar la imagen anterior del disco
                const oldPath = path.join(uploadDir, anterior.imagen.replace('/uploads/', ''));
                fs.unlink(oldPath, () => {});
            }
            // 2. Actualizar la ruta de la imagen
            toUpdate.imagen = `/uploads/${req.file.filename}`;
        }

        const actualizado = await Promocion.findByIdAndUpdate(id, toUpdate, { new: true, runValidators: true });
        
        if (!actualizado) {
             // Si se subió un nuevo archivo pero no se encontró la promoción, eliminar el nuevo archivo
            if (req.file) fs.unlink(req.file.path, () => {});
            return res.status(404).json({ error: 'Promoción no encontrada para actualizar' });
        }

        res.json(actualizado);
    } catch (err) {
        console.error('❌ Error al actualizar promoción:', err);
        // Manejo de errores de Multer o DB
        if (req.file) fs.unlink(req.file.path, () => {});
        res.status(500).json({ error: 'Error en el servidor al actualizar promoción' });
    }
});

/** DELETE /promociones/:id - Eliminar promoción + imagen */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const borrada = await Promocion.findByIdAndDelete(id);
        if (!borrada) return res.status(404).json({ error: 'Promoción no encontrada para eliminar' });

        // Eliminar el archivo de imagen asociado
        if (borrada.imagen) {
            const imgPath = path.join(uploadDir, borrada.imagen.replace('/uploads/', ''));
            // Usamos una función de callback vacía para que no lance un error si el archivo ya no existe
            fs.unlink(imgPath, () => {}); 
        }

        res.json({ message: 'Promoción e imagen eliminadas con éxito' });
    } catch (err) {
        console.error('❌ Error al eliminar promoción:', err);
        res.status(500).json({ error: 'Error en el servidor al eliminar promoción' });
    }
});


// =======================================================================
// RUTAS GET (PÚBLICAS - LECTURA)
// NOTA: Se eliminó la duplicidad de router.get('/')
// =======================================================================

/** GET /promociones - Listar todas las promociones */
router.get('/', async (req, res) => {
    try {
        const promociones = await Promocion.find().sort({ createdAt: -1 });
        res.json(promociones);
    } catch (err) {
        console.error('❌ Error al obtener promociones:', err);
        res.status(500).json({ error: 'Error en el servidor al obtener promociones' });
    }
});

/** GET /promociones/:id - Obtener una promoción por ID */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const promocion = await Promocion.findById(id);
        
        if (!promocion) {
            return res.status(404).json({ error: 'Promoción no encontrada' });
        }

        res.json(promocion);
    } catch (err) {
        console.error('❌ Error al obtener promoción por ID:', err);
        res.status(500).json({ error: 'Error en el servidor al obtener promoción por ID' });
    }
});

module.exports = router;
