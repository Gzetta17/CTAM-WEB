const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin'); // <-- Se asegura de usar el modelo Admin

async function createAdminUser() {
    try {
        // Conecta a tu base de datos MongoDB
        await mongoose.connect('mongodb://localhost:27017/ctam_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const username = 'admin';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10); // <-- Encripta la contraseña

        // Busca y actualiza el usuario si ya existe, si no, lo crea.
        const result = await Admin.findOneAndUpdate(
            { username: username },
            { password: hashedPassword, role: 'admin' },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log('Usuario administrador creado/actualizado con éxito:', result);
        mongoose.connection.close();
    } catch (error) {
        console.error('Error al crear o actualizar el usuario administrador:', error);
    }
}

createAdminUser();