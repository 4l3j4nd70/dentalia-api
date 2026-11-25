const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. AUTENTICACIÓN (Tabla: usuarios)
// ==========================================
app.post('/api/login', async (req, res) => {
    try {
        const { correo, password } = req.body;
        const [rows] = await pool.query(
            'SELECT id_usuario, nombre_completo, correo, rol FROM usuarios WHERE correo = ? AND password_hash = ? AND activo = TRUE',
            [correo, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        res.json({ mensaje: 'Bienvenido', usuario: rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 2. CATÁLOGOS (Tablas: servicios y odontologos)
// ==========================================
app.get('/api/servicios', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id_servicio, nombre_servicio, descripcion, duracion_minutos, precio FROM servicios'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/odontologos', async (req, res) => {
    try {
        // Solo trae los odontólogos que tienen activo = TRUE
        const [rows] = await pool.query(
            'SELECT id_odontologo, nombre, apellido, especialidad, telefono FROM odontologos WHERE activo = TRUE'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 3. PACIENTES (Tabla: pacientes)
// ==========================================
app.get('/api/pacientes', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id_paciente, documento, nombre, apellido, telefono, correo, fecha_registro FROM pacientes ORDER BY id_paciente DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/pacientes', async (req, res) => {
    try {
        const { documento, nombre, apellido, telefono, correo } = req.body;
        const [result] = await pool.query(
            'INSERT INTO pacientes (documento, nombre, apellido, telefono, correo) VALUES (?, ?, ?, ?, ?)',
            [documento, nombre, apellido, telefono || null, correo || null]
        );
        res.status(201).json({ id_paciente: result.insertId, mensaje: 'Paciente registrado correctamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya existe un paciente registrado con ese documento.' });
        }
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/pacientes/:id', async (req, res) => {
    try {
        const { documento, nombre, apellido, telefono, correo } = req.body;
        await pool.query(
            'UPDATE pacientes SET documento = ?, nombre = ?, apellido = ?, telefono = ?, correo = ? WHERE id_paciente = ?',
            [documento, nombre, apellido, telefono || null, correo || null, req.params.id]
        );
        res.json({ mensaje: 'Datos del paciente actualizados' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ==========================================
// 4. CITAS (Tabla: citas + JOINs)
// ==========================================
app.get('/api/citas', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                c.id_cita,
                c.fecha_hora,
                c.estado,
                c.notas,
                c.id_paciente,
                p.documento AS documento_paciente,
                CONCAT(p.nombre, ' ', p.apellido) AS paciente,
                c.id_odontologo,
                CONCAT(o.nombre, ' ', o.apellido) AS odontologo,
                o.especialidad,
                c.id_servicio,
                s.nombre_servicio AS servicio,
                s.duracion_minutos,
                s.precio
            FROM citas c
            JOIN pacientes p ON c.id_paciente = p.id_paciente
            JOIN odontologos o ON c.id_odontologo = o.id_odontologo
            JOIN servicios s ON c.id_servicio = s.id_servicio
            ORDER BY c.fecha_hora ASC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/citas', async (req, res) => {
    try {
        const { id_paciente, id_odontologo, id_servicio, fecha_hora, notas } = req.body;

        // Bloquea el horario si el odontólogo ya tiene una cita Pendiente o Confirmada
        const [ocupado] = await pool.query(
            `SELECT COUNT(*) AS total FROM citas 
             WHERE id_odontologo = ? AND fecha_hora = ? AND estado IN ('Pendiente', 'Confirmada')`,
            [id_odontologo, fecha_hora]
        );

        if (ocupado[0].total > 0) {
            return res.status(409).json({ error: 'El odontólogo ya tiene una cita Pendiente o Confirmada en esa fecha y hora.' });
        }

        const [result] = await pool.query(
            `INSERT INTO citas (id_paciente, id_odontologo, id_servicio, fecha_hora, notas) 
             VALUES (?, ?, ?, ?, ?)`,
            [id_paciente, id_odontologo, id_servicio, fecha_hora, notas || null]
        );
        res.status(201).json({ id_cita: result.insertId, mensaje: 'Cita agendada correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/citas/:id/estado', async (req, res) => {
    try {
        const { estado } = req.body;
        const estadosValidos = ['Pendiente', 'Confirmada', 'Completada', 'Cancelada'];

        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({ error: 'Estado no válido' });
        }

        await pool.query('UPDATE citas SET estado = ? WHERE id_cita = ?', [estado, req.params.id]);
        res.json({ mensaje: `Cita marcada como ${estado}` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// ==========================================
// 5. INICIO DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});