const mongoose = require('mongoose');

const promocionSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true 
  },
  descripcion: { 
    type: String, 
    required: true 
  },
  imagen: { 
    type: String, 
    required: true
  } 
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Promocion', promocionSchema);

