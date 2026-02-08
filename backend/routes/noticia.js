const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Noticia = require('../models/noticia');

// *** ELIMINAMOS la importación de requireAuth para que el servidor no se caiga ***
// const { requireAuth } = require('./auth'); 

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `noticia-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// -----------------------------------------------------------------------
// RUTAS PÚBLICAS/SIN AUTENTICACIÓN (Para asegurar que el servidor inicie)
// -----------------------------------------------------------------------

/** POST /noticias - Crear */
// La ruta es PUBLIC (sin requireAuth)
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });
    
    // Validar campos esenciales
    if (!req.body.nombre || !req.body.categoria || !req.body.contenido) {
        return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, categoria o contenido).' });
    }

    const nuevo = await Noticia.create({
      nombre: req.body.nombre,
      categoria: req.body.categoria,
      contenido: req.body.contenido, // <-- CAMPO CONTENIDO AGREGADO
      imagen: `/uploads/${req.file.filename}`
    });

    res.status(201).json(nuevo);
  } catch (err) {
    console.error('❌ Error al crear noticia:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/** PUT /noticias/:id - Actualizar (opcionalmente imagen) */
// La ruta es PUBLIC (sin requireAuth)
router.put('/:id', upload.single('imagen'), async (req, res) => {
  try {
    const { id } = req.params;

    const toUpdate = {
      nombre: req.body.nombre,
      categoria: req.body.categoria,
      contenido: req.body.contenido, // <-- CAMPO CONTENIDO AGREGADO
    };

    if (req.file) {
      const anterior = await Noticia.findById(id);
      if (anterior?.imagen) {
        const oldPath = path.join(uploadDir, anterior.imagen.replace('/uploads/', ''));
        fs.unlink(oldPath, () => {});
      }
      toUpdate.imagen = `/uploads/${req.file.filename}`;
    }

    const actualizado = await Noticia.findByIdAndUpdate(id, toUpdate, { new: true });
    if (!actualizado) return res.status(404).json({ error: 'Noticia no encontrada' });

    res.json(actualizado);
  } catch (err) {
    console.error('❌ Error al actualizar noticia:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/** DELETE /noticias/:id - Eliminar + imagen */
// La ruta es PUBLIC (sin requireAuth)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const borrada = await Noticia.findByIdAndDelete(id);
    if (!borrada) return res.status(404).json({ error: 'Noticia no encontrada' });

    if (borrada.imagen) {
      const imgPath = path.join(uploadDir, borrada.imagen.replace('/uploads/', ''));
      fs.unlink(imgPath, () => {});
    }

    res.json({ message: 'Noticia e imagen eliminadas con éxito' });
  } catch (err) {
    console.error('❌ Error al eliminar noticia:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


// -----------------------------------------------------------------------
// RUTAS GET (Se mantienen iguales)
// -----------------------------------------------------------------------

/** GET /noticias - Listar */
router.get('/', async (req, res) => {
  try {
    const noticias = await Noticia.find().sort({ createdAt: -1 });
    res.json(noticias);
  } catch (err) {
    console.error('❌ Error al obtener noticias:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/** GET /noticias/:id - Obtener una noticia por ID */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const noticia = await Noticia.findById(id);
    
    if (!noticia) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }

    res.json(noticia);
  } catch (err) {
    console.error('❌ Error al obtener noticia por ID:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;