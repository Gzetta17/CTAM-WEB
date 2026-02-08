const mongoose = require('mongoose');

const popupSchema = new mongoose.Schema({
    // Estado para saber si el pop-up debe mostrarse al público
    show: {
        type: Boolean,
        default: false
    },
    // URL/Ruta de la imagen que se mostrará
    imageUrl: {
        type: String,
        default: '' // Cadena vacía si no hay imagen
    },
    // Timestamp de la última actualización
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Usamos findOneAndUpdate en el controlador, por lo que solo necesitamos un documento.
// Exportamos como un modelo simple
module.exports = mongoose.model('Popup', popupSchema);