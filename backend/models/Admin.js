const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  // El campo `username` es obligatorio y de tipo String
  username: {
    type: String,
    required: true,
    unique: true
  },
  // El campo `password` (o `passwordHash`) es obligatorio
  password: {
    type: String,
    required: true
  },
  // Opcional: puedes incluir otros campos como `role`
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin'
  }
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;