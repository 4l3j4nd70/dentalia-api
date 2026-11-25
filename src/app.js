const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Ruta GET de Servicios
app.get('/api/servicios', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM servicios');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Ruta GET de Odontólogos
app.get('/api/odontologos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM odontologos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Ruta GET de Citas (con nombres reales para Figma/React)
app.get('/api/citas', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                c.id_cita, c.fecha_hora, c.estado, c.notas,
                CONCAT(p.nombre, ' ', p.apellido) AS paciente,
                CONCAT(o.nombre, ' ', o.apellido) AS odontologo,
                s.nombre_servicio AS servicio, s.precio
            FROM citas c
            JOIN pacientes p ON c.id_paciente = p.id_paciente
            JOIN odontologos o ON c.id_odontologo = o.id_odontologo
            JOIN servicios s ON c.id_servicio = s.id_servicio
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
