-- 1. Crear y seleccionar la base de datos
CREATE DATABASE IF NOT EXISTS clinica_odontologica 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE clinica_odontologica;

-- 2. Tabla de Pacientes
CREATE TABLE pacientes (
    id_paciente INT AUTO_INCREMENT PRIMARY KEY,
    documento VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Odontólogos
CREATE TABLE odontologos (
    id_odontologo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE
);

-- 4. Tabla de Servicios
CREATE TABLE servicios (
    id_servicio INT AUTO_INCREMENT PRIMARY KEY,
    nombre_servicio VARCHAR(100) NOT NULL,
    descripcion TEXT,
    duracion_minutos INT NOT NULL DEFAULT 30,
    precio DECIMAL(10, 2) NOT NULL
);

-- 5. Tabla de Citas (Une a las 3 tablas anteriores)
CREATE TABLE citas (
    id_cita INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT NOT NULL,
    id_odontologo INT NOT NULL,
    id_servicio INT NOT NULL,
    fecha_hora DATETIME NOT NULL,
    estado ENUM('Pendiente', 'Confirmada', 'Completada', 'Cancelada') DEFAULT 'Pendiente',
    notas TEXT,
    FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente) ON DELETE RESTRICT,
    FOREIGN KEY (id_odontologo) REFERENCES odontologos(id_odontologo) ON DELETE RESTRICT,
    FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio) ON DELETE RESTRICT
);
USE clinica_odontologica;

-- 1. Insertar Pacientes de prueba
INSERT INTO pacientes (documento, nombre, apellido, telefono, correo) VALUES
('1094888111', 'Camila', 'Restrepo', '3104567890', 'camila.restrepo@email.com'),
('1094999222', 'Andrés', 'Gómez', '3209876543', 'andres.gomez@email.com');

-- 2. Insertar Odontólogos de prueba
INSERT INTO odontologos (nombre, apellido, especialidad, telefono) VALUES
('Dra. Mariana', 'Valencia', 'Ortodoncia', '3001112233'),
('Dr. Sebastián', 'Ospina', 'Odontología General', '3004445566');

-- 3. Insertar Servicios de prueba
INSERT INTO servicios (nombre_servicio, descripcion, duracion_minutos, precio) VALUES
('Valoración General', 'Revisión inicial y diagnóstico completo', 30, 50000.00),
('Limpieza Dental', 'Profilaxis y eliminación de placa bacteriana', 45, 85000.00),
('Control Ortodoncia', 'Ajuste mensual de brackets', 30, 70000.00);

-- 4. Insertar Citas de prueba (usando los IDs 1 y 2 creados arriba)
INSERT INTO citas (id_paciente, id_odontologo, id_servicio, fecha_hora, estado, notas) VALUES
(1, 2, 1, '2026-11-26 09:00:00', 'Confirmada', 'Primera consulta de la paciente'),
(2, 1, 3, '2026-11-26 10:30:00', 'Pendiente', 'Traer radiografía panorámica');

USE clinica_odontologica;

-- 1. Agregar una nueva odontóloga (con ella ya tienes 2 mujeres y 1 hombre en total)
INSERT INTO odontologos (nombre, apellido, especialidad, telefono) VALUES
('Dra. Laura', 'Mendoza', 'Endodoncia', '3007778899');

-- 2. Programar las nuevas citas con los estados solicitados (Pendiente, Completada, Cancelada)
-- (Usamos id_odontologo 3 que corresponde a la Dra. Laura recién creada)
INSERT INTO citas (id_paciente, id_odontologo, id_servicio, fecha_hora, estado, notas) VALUES
(1, 3, 2, '2026-11-27 08:30:00', 'Pendiente', 'Cita programada para limpieza dental'),
(2, 3, 1, '2026-11-20 14:00:00', 'Completada', 'Valoración realizada sin novedad'),
(1, 1, 3, '2026-11-25 16:00:00', 'Cancelada', 'Paciente canceló por motivo laboral');
SELECT 
    c.id_cita,
    c.fecha_hora,
    CONCAT(p.nombre, ' ', p.apellido) AS paciente,
    CONCAT(o.nombre, ' ', o.apellido) AS odontologo,
    s.nombre_servicio AS servicio,
    c.estado
FROM citas c
JOIN pacientes p ON c.id_paciente = p.id_paciente
JOIN odontologos o ON c.id_odontologo = o.id_odontologo
JOIN servicios s ON c.id_servicio = s.id_servicio
ORDER BY c.id_cita;
USE clinica_odontologica;

-- 5. Tabla de Usuarios (Para el Login en React y la API)
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('Administrador', 'Recepcionista') NOT NULL DEFAULT 'Recepcionista',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar dos usuarios de prueba (uno Admin y uno que agenda citas)
INSERT INTO usuarios (nombre_completo, correo, password_hash, rol) VALUES
('Administrador Clínica', 'admin@clinica.com', 'Admin123*', 'Administrador'),
('Recepción Citas', 'citas@clinica.com', 'Citas123*', 'Recepcionista');

