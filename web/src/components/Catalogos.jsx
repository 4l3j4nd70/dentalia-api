import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Catalogos() {
  const [odontologos, setOdontologos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getOdontologos(), api.getServicios()])
      .then(([docs, servs]) => {
        setOdontologos(docs);
        setServicios(servs);
      })
      .catch((err) => setError(err.message));
  }, []);

  const disponibles = odontologos.filter((o) => o.activo === 1 || o.activo === true).length;
  const formatoPrecio = (valor) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Servicios y Odontólogos</h2>
          <p className="page-subtitle">Conoce al equipo y consulta los tratamientos de la clínica.</p>
        </div>
        <span className="pill pill-green"><span className="dot dot-green"></span>{odontologos.length} profesionales activos</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="sub-header">
        <h3>Equipo odontológico</h3>
        <span>{disponibles} disponibles ahora</span>
      </div>

      <div className="doctors-grid">
        {odontologos.map((doc) => {
          const estaActivo = doc.activo === 1 || doc.activo === true;
          const iniciales = `${doc.nombre[0] || ''}${doc.apellido[0] || ''}`.toUpperCase();
          return (
            <div key={doc.id_odontologo} className="doctor-card">
              <div className="doctor-top">
                <div className="doctor-avatar">{iniciales}</div>
                <div>
                  <div className="doctor-name">{doc.nombre} {doc.apellido}</div>
                  <div className="doctor-spec">{doc.especialidad}</div>
                </div>
              </div>
              <div className="doctor-schedule">
                <span>🕒 Tel: {doc.telefono || 'Sin registrar'}</span>
                <strong>08:00 – 17:00</strong>
              </div>
              <div>
                {estaActivo ? (
                  <span className="pill pill-green"><span className="dot dot-green"></span>Disponible</span>
                ) : (
                  <span className="pill pill-amber"><span className="dot dot-amber"></span>No disponible</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sub-header" style={{ marginTop: '2rem' }}>
        <h3>Servicios odontológicos</h3>
        <span>{servicios.length} servicios disponibles</span>
      </div>

      <div className="panel-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre del Servicio</th>
                <th>Descripción</th>
                <th>Duración Estimada (minutos)</th>
                <th style={{ textAlign: 'right' }}>Precio Base</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((s) => (
                <tr key={s.id_servicio}>
                  <td style={{ fontWeight: 600 }}>{s.nombre_servicio}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{s.descripcion || 'Tratamiento clínico general'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>🕒 {s.duracion_minutos} min</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatoPrecio(s.precio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer-note">
          <span>Tarifas de referencia · Moneda: COP</span>
          <span>El valor final depende de la valoración clínica.</span>
        </div>
      </div>
    </div>
  );
}