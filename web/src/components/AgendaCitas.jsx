import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function AgendaCitas({ onNuevaCita }) {
  const [citas, setCitas] = useState([]);
  const [odontologos, setOdontologos] = useState([]);
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroOdontologo, setFiltroOdontologo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [detalleCita, setDetalleCita] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const cargarDatos = async () => {
    try {
      const [listaCitas, listaDocs] = await Promise.all([api.getCitas(), api.getOdontologos()]);
      setCitas(listaCitas);
      setOdontologos(listaDocs);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const actualizarEstado = async (id, nuevoEstado) => {
    setError('');
    setMensaje('');
    try {
      const res = await api.cambiarEstadoCita(id, nuevoEstado);
      setMensaje(res.mensaje);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const citasFiltradas = citas.filter((c) => {
    const fechaISO = new Date(c.fecha_hora).toISOString().slice(0, 10);
    if (filtroFecha && fechaISO !== filtroFecha) return false;
    if (filtroOdontologo && String(c.id_odontologo) !== filtroOdontologo) return false;
    if (filtroEstado && c.estado !== filtroEstado) return false;
    return true;
  });

  const hoyISO = new Date().toISOString().slice(0, 10);
  const citasHoy = citas.filter((c) => new Date(c.fecha_hora).toISOString().slice(0, 10) === hoyISO).length;
  const pendientes = citas.filter((c) => c.estado === 'Pendiente').length;
  const completadas = citas.filter((c) => c.estado === 'Completada').length;
  const porcentajeCompletadas = citas.length > 0 ? Math.round((completadas / citas.length) * 100) : 0;

  const badgeEstado = (estado) => {
    if (estado === 'Confirmada') return <span className="pill pill-green"><span className="dot dot-green"></span>Confirmada</span>;
    if (estado === 'Pendiente') return <span className="pill pill-amber"><span className="dot dot-amber"></span>Pendiente</span>;
    if (estado === 'Completada') return <span className="pill pill-blue"><span className="dot dot-blue"></span>Completada</span>;
    return <span className="pill pill-red"><span className="dot dot-red"></span>Cancelada</span>;
  };

  const formatearHora = (fechaHora) =>
    new Date(fechaHora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Agenda de Citas</h2>
          <p className="page-subtitle">Organiza tu día y acompaña cada sonrisa.</p>
        </div>
        <button className="btn btn-primary" onClick={onNuevaCita}>+ Nueva Cita</button>
      </div>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="kpi-grid">
        <div className="kpi-card">
          <div>
            <div className="kpi-label">Citas de hoy</div>
            <div className="kpi-value-row">
              <span className="kpi-number">{String(citasHoy).padStart(2, '0')}</span>
              <span className="kpi-hint">{citas.length} registradas en total</span>
            </div>
          </div>
          <div className="kpi-icon-box" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>📅</div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Pendientes</div>
            <div className="kpi-value-row">
              <span className="kpi-number">{String(pendientes).padStart(2, '0')}</span>
              <span className="kpi-hint">Por confirmar o atender</span>
            </div>
          </div>
          <div className="kpi-icon-box" style={{ background: 'var(--amber-bg)', color: 'var(--amber-text)' }}>🕒</div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Completadas</div>
            <div className="kpi-value-row">
              <span className="kpi-number">{String(completadas).padStart(2, '0')}</span>
              <span className="kpi-hint">{porcentajeCompletadas}% de la agenda</span>
            </div>
          </div>
          <div className="kpi-icon-box" style={{ background: 'var(--green-bg)', color: 'var(--green-text)' }}>✓</div>
        </div>
      </div>

      <div className="panel-card">
        <div className="filter-bar">
          <div className="field">
            <label>Fecha</label>
            <input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} />
          </div>
          <div className="field">
            <label>Odontólogo</label>
            <select value={filtroOdontologo} onChange={(e) => setFiltroOdontologo(e.target.value)}>
              <option value="">Todos los odontólogos</option>
              {odontologos.map((d) => (
                <option key={d.id_odontologo} value={d.id_odontologo}>
                  {d.nombre} {d.apellido}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Estado</label>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Confirmada">Confirmada</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
          <button
            className="btn btn-outline"
            onClick={() => { setFiltroFecha(''); setFiltroOdontologo(''); setFiltroEstado(''); }}
          >
            Restablecer
          </button>
        </div>
      </div>

      <div className="panel-card">
        <div className="table-header-row">
          <div>
            <strong style={{ fontSize: '1rem' }}>Citas programadas</strong>
            <span className="pill-count">{citasFiltradas.length}</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID Cita</th>
                <th>Hora</th>
                <th>Paciente</th>
                <th>Odontólogo</th>
                <th>Servicio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citasFiltradas.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay citas para los filtros seleccionados.</td></tr>
              ) : (
                citasFiltradas.map((c) => (
                  <tr key={c.id_cita}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#C-{1000 + c.id_cita}</td>
                    <td style={{ fontWeight: 600 }}>{formatearHora(c.fecha_hora)}</td>
                    <td style={{ fontWeight: 600 }}>{c.paciente}</td>
                    <td>{c.odontologo}</td>
                    <td>{c.servicio}</td>
                    <td>{badgeEstado(c.estado)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {c.estado === 'Pendiente' && (
                          <>
                            <button className="btn btn-sm btn-soft-blue" onClick={() => actualizarEstado(c.id_cita, 'Confirmada')}>Confirmar</button>
                            <button className="btn btn-sm btn-soft-red" onClick={() => actualizarEstado(c.id_cita, 'Cancelada')}>Cancelar</button>
                          </>
                        )}
                        {c.estado === 'Confirmada' && (
                          <>
                            <button className="btn btn-sm btn-soft-green" onClick={() => actualizarEstado(c.id_cita, 'Completada')}>✓ Completar</button>
                            <button className="btn btn-sm btn-soft-red" onClick={() => actualizarEstado(c.id_cita, 'Cancelada')}>Cancelar</button>
                          </>
                        )}
                        <button className="btn btn-sm btn-outline" onClick={() => setDetalleCita(c)}>Ver detalle</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer-note">
          <span>Mostrando {citasFiltradas.length} de {citas.length} citas</span>
          <span>Todos los horarios se muestran en la hora local de la clínica.</span>
        </div>
      </div>

      {detalleCita && (
        <div className="modal-backdrop" onClick={() => setDetalleCita(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem' }}>Detalle de Cita #C-{1000 + detalleCita.id_cita}</h3>
            <p><strong>Paciente:</strong> {detalleCita.paciente} (Doc: {detalleCita.documento_paciente})</p>
            <p><strong>Odontólogo:</strong> {detalleCita.odontologo} — {detalleCita.especialidad}</p>
            <p><strong>Servicio:</strong> {detalleCita.servicio} ({detalleCita.duracion_minutos} min)</p>
            <p><strong>Fecha y Hora:</strong> {new Date(detalleCita.fecha_hora).toLocaleString('es-CO')}</p>
            <p><strong>Estado:</strong> {detalleCita.estado}</p>
            <p style={{ marginTop: '0.5rem' }}><strong>Notas:</strong> {detalleCita.notas || 'Sin observaciones registradas.'}</p>
            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setDetalleCita(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}