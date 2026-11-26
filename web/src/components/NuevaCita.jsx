import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function NuevaCita({ onVolverAgenda }) {
  const [pacientes, setPacientes] = useState([]);
  const [odontologos, setOdontologos] = useState([]);
  const [servicios, setServicios] = useState([]);

  const [idPaciente, setIdPaciente] = useState('');
  const [idOdontologo, setIdOdontologo] = useState('');
  const [idServicio, setIdServicio] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [hora, setHora] = useState('');
  const [notas, setNotas] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getPacientes(), api.getOdontologos(), api.getServicios()])
      .then(([pacs, docs, servs]) => {
        setPacientes(pacs);
        setOdontologos(docs.filter((d) => d.activo === 1 || d.activo === true));
        setServicios(servs);
        if (servs.length > 0) setIdServicio(String(servs[0].id_servicio));
      })
      .catch((err) => setError(err.message));
  }, []);

  const servicioSeleccionado = servicios.find((s) => String(s.id_servicio) === idServicio);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.crearCita({
        id_paciente: Number(idPaciente),
        id_odontologo: Number(idOdontologo),
        id_servicio: Number(idServicio),
        fecha_hora: `${fecha} ${hora}:00`,
        notas,
      });
      onVolverAgenda();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Nueva Cita</h2>
          <p className="page-subtitle">Programa una nueva atención para tu paciente.</p>
        </div>
        <button className="btn btn-outline" onClick={onVolverAgenda}>‹ Volver a la agenda</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="panel-card" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="kpi-icon-box" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>📅</div>
            <div>
              <strong style={{ fontSize: '1rem' }}>Información de la cita</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completa los datos para reservar un horario.</p>
            </div>
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-light)' }}>* Campos obligatorios</span>
        </div>

        <div className="form-grid-2">
          <div className="field">
            <label>Paciente *</label>
            <select value={idPaciente} onChange={(e) => setIdPaciente(e.target.value)} required>
              <option value="">Selecciona un paciente</option>
              {pacientes.map((p) => (
                <option key={p.id_paciente} value={p.id_paciente}>
                  {p.nombre} {p.apellido} — Doc: {p.documento}
                </option>
              ))}
            </select>
            <span className="field-hint">Busca un paciente registrado en el directorio.</span>
          </div>

          <div className="field">
            <label>Odontólogo *</label>
            <select value={idOdontologo} onChange={(e) => setIdOdontologo(e.target.value)} required>
              <option value="">Selecciona un odontólogo</option>
              {odontologos.map((d) => (
                <option key={d.id_odontologo} value={d.id_odontologo}>
                  {d.nombre} {d.apellido} ({d.especialidad})
                </option>
              ))}
            </select>
            <span className="field-hint">Selecciona el profesional que realizará la atención.</span>
          </div>

          <div className="field">
            <label>Servicio *</label>
            <select value={idServicio} onChange={(e) => setIdServicio(e.target.value)} required>
              {servicios.map((s) => (
                <option key={s.id_servicio} value={s.id_servicio}>{s.nombre_servicio}</option>
              ))}
            </select>
          </div>

          <div className="form-grid-2">
            <div className="field">
              <label>Duración estimada</label>
              <div style={{ padding: '0.62rem 0', fontWeight: 600, color: 'var(--text-muted)' }}>
                🕒 {servicioSeleccionado ? `${servicioSeleccionado.duracion_minutos} minutos` : '—'}
              </div>
            </div>
            <div className="field">
              <label>Descripción / Notas</label>
              <input
                type="text"
                placeholder={servicioSeleccionado?.descripcion || 'Observación opcional'}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Fecha *</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
            <span className="field-hint">Formato: YYYY-MM-DD</span>
          </div>

          <div className="field">
            <label>Hora *</label>
            <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
            <span className="field-hint">Selecciona un horario disponible.</span>
          </div>
        </div>

        <div className="info-banner">
          ⓘ Los horarios disponibles dependen del odontólogo, el servicio y la fecha seleccionados.
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.35rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Revisa los datos antes de guardar la cita.</span>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button type="button" className="btn btn-outline" onClick={onVolverAgenda}>Cancelar</button>
            <button type="submit" className="btn btn-primary">✓ Guardar Cita</button>
          </div>
        </div>
      </form>

      <p style={{ fontSize: '0.76rem', color: 'var(--text-light)' }}>
        ⓘ La cita se registrará con estado Pendiente y aparecerá en la agenda de la clínica.
      </p>
    </div>
  );
}