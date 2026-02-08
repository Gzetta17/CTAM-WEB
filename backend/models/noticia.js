const mongoose = require('mongoose');

const noticiaSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true 
  },
  categoria: { 
    type: String, 
    required: true 
  },

  contenido: { 
    type: String, 
    required: true // O false si es opcional, pero generalmente es requerido.
  },
  imagen: { 
    type: String, 
    required: true // sólo filename
  } 
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Noticia', noticiaSchema);