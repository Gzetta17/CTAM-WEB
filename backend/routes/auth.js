const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const Admin = require('../models/Admin');

const router = express.Router();

// LOGIN ADMIN
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(400).json({ message: "Credenciales incorrectas" });
        }

        const validPassword = await bcrypt.compare(password, admin.password); 
        if (!validPassword) {
            return res.status(400).json({ message: "Credenciales incorrectas" });
        }

        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET || "clave_secreta",
            { expiresIn: "2h" }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: "Error en login", error: err });
    }
});

module.exports = router;