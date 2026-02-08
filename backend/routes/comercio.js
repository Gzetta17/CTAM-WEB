// routes/comercio.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// --- CORRECCIÓN: SE ELIMINA LA IMPORTACIÓN DE verifyToken que causaba el error ---
// Ya que no existe el archivo verifyToken.js, quitamos esta línea.
// const verifyToken = require('../middleware/verifyToken'); 
const Comercio = require('../models/comercio'); 
// --------------------------------------------------------------------------------

// La ruta ahora se define de manera que coincida con la configuración de server.js
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer para la subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `comercio-${Date.now()}${ext}`);
    }
});
const upload = multer({ storage });

/** POST / - Crear un nuevo comercio */
// Nota: verifyToken ELIMINADO de la lista de middlewares
router.post('/', upload.single('imagen'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen.' });

        const nuevo = await Comercio.create({
            nombre: req.body.nombre,
            categoria: req.body.categoria,
            descripcion: req.body.descripcion, // ✅ CORRECCIÓN AÑADIDA
            // CLAVE DE IMAGEN CORREGIDA: Incluye /uploads/ para que el frontend funcione
            imagen: `/uploads/${req.file.filename}` 
        });

        res.status(201).json(nuevo);
    } catch (err) {
        console.error('❌ Error al crear comercio:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

/** GET / - Obtener todos los comercios */
router.get('/', async (req, res) => {
    try {
        const comercios = await Comercio.find().sort({ createdAt: -1 });
        res.json(comercios);
    } catch (err) {
        console.error('❌ Error al obtener comercios:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

/** GET /:id - Obtener un comercio por ID */
router.get('/:id', async (req, res) => {
    try {
        const comercio = await Comercio.findById(req.params.id);
        if (!comercio) {
            return res.status(404).json({ error: 'Comercio no encontrado.' });
        }
        res.json(comercio);
    } catch (err) {
        console.error('❌ Error al obtener comercio por ID:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

/** PUT /:id - Actualizar un comercio (opcionalmente la imagen) */
// Nota: verifyToken ELIMINADO de la lista de middlewares
router.put('/:id', upload.single('imagen'), async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ CORRECCIÓN: Ahora desestructuramos todos los campos que pueden ser actualizados
        const { nombre, categoria, descripcion } = req.body; 

        const toUpdate = {
            nombre,
            categoria,
            descripcion, // ✅ CORRECCIÓN AÑADIDA
        };

        if (req.file) {
            const anterior = await Comercio.findById(id);
            if (anterior?.imagen) {
                // Elimina solo el nombre del archivo, no toda la ruta /uploads/
                const filename = anterior.imagen.replace('/uploads/', ''); 
                const oldPath = path.join(uploadDir, filename);
                fs.unlink(oldPath, () => {}); // Elimina la imagen anterior
            }
            toUpdate.imagen = `/uploads/${req.file.filename}`; // Guarda la nueva ruta corregida
        }

        const actualizado = await Comercio.findByIdAndUpdate(id, toUpdate, { new: true });
        if (!actualizado) return res.status(404).json({ error: 'Comercio no encontrado.' });

        res.json(actualizado);
    } catch (err) {
        console.error('❌ Error al actualizar comercio:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

/** DELETE /:id - Eliminar un comercio y su imagen */
// Nota: verifyToken ELIMINADO de la lista de middlewares
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const borrado = await Comercio.findByIdAndDelete(id);
        if (!borrado) return res.status(404).json({ error: 'Comercio no encontrado.' });

        if (borrado.imagen) {
            // Elimina solo el nombre del archivo, no toda la ruta /uploads/
            const filename = borrado.imagen.replace('/uploads/', ''); 
            const imgPath = path.join(uploadDir, filename);
            fs.unlink(imgPath, () => {}); // Elimina la imagen de forma asíncrona
        }

        res.json({ message: 'Comercio e imagen eliminados con éxito.' });
    } catch (err) {
        console.error('❌ Error al eliminar comercio:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

module.exports = router;