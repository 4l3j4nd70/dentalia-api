import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('az');
  const [modalForm, setModalForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({ documento: '', nombre: '', apellido: '', telefono: '', correo: '' });
  const [historialPaciente, setHistorialPaciente] = useState(null);
  const [citasPaciente, setCitasPaciente] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const cargarPacientes = async () => {
    try {
      const lista = await api.getPacientes();
      setPacientes(lista);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  const abrirNuevo = () => {
    setEditandoId(null);
    setForm({ documento: '', nombre: '', apellido: '', telefono: '', correo: '' });
    setError('');
    setModalForm(true);
  };

  const abrirEditar = (p) => {
    setEditandoId(p.id_paciente);
    setForm({
      documento: p.documento,
      nombre: p.nombre,
      apellido: p.apellido,
      telefono: p.telefono || '',
      correo: p.correo || '',
    });
    setError('');
    setModalForm(true);
  };

  const guardarPaciente = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    try {
      if (editandoId) {
        const res = await api.actualizarPaciente(editandoId, form);
        setMensaje(res.mensaje);
      } else {
        const res = await api.crearPaciente(form);
        setMensaje(res.mensaje);
      }
      setModalForm(false);
      cargarPacientes();
    } catch (err) {
      setError(err.message);
    }
  };

  const verHistorial = async (paciente) => {
    setHistorialPaciente(paciente);
    try {
      const todas = await api.getCitas();
      setCitasPaciente(todas.filter((c) => c.id_paciente === paciente.id_paciente));
    } catch {
      setCitasPaciente([]);
    }
  };

  const filtrados = pacientes
    .filter((p) => {
      const q = busqueda.toLowerCase();
      return (
        p.documento.toLowerCase().includes(q) ||
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (orden === 'az') return a.nombre.localeCompare(b.nombre);
      if (orden === 'za') return b.nombre.localeCompare(a.nombre);
      return b.id_paciente - a.id_paciente;
    });

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Directorio de Pacientes</h2>
          <p className="page-subtitle">La información de tus pacientes, en un solo lugar.</p>
        </div>
        <button className="btn btn-primary" onClick={abrirNuevo}>+ Registrar Paciente</button>
      </div>

      {mensaje && <div className="alert alert-success">{mensaje}</div>}

      <div className="panel-card">
        <div className="filter-bar" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <div className="field">
            <label>Búsqueda rápida</label>
            <input
              type="text"
              placeholder="🔍 Busca por cédula o nombre del paciente"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Ordenar por</label>
            <select value={orden} onChange={(e) => setOrden(e.target.value)}>
              <option value="az">Nombre: A–Z</option>
              <option value="za">Nombre: Z–A</option>
              <option value="reciente">Más recientes</option>
            </select>
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="table-header-row">
          <div>
            <strong style={{ fontSize: '1rem' }}>Pacientes registrados</strong>
            <span className="pill-count">{filtrados.length}</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {filtrados.length} pacientes mostrados
          </span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Documento</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Teléfono</th>
                <th>Correo Electrónico</th>
                <th>Fecha de registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id_paciente}>
                  <td style={{ color: 'var(--text-muted)' }}>{p.documento}</td>
                  <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                  <td>{p.apellido}</td>
                  <td>{p.telefono || '—'}</td>
                  <td>{p.correo || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {p.fecha_registro ? new Date(p.fecha_registro).toLocaleDateString('es-CO') : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-sm btn-outline" onClick={() => abrirEditar(p)}>Editar</button>
                      <button className="btn btn-sm btn-soft-blue" onClick={() => verHistorial(p)}>🕒 Ver Historial</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer-note">
          <span>Mostrando {filtrados.length} de {pacientes.length} pacientes</span>
          <span>🔒 Los datos de tus pacientes son confidenciales y de uso exclusivo de la clínica.</span>
        </div>
      </div>

      {modalForm && (
        <div className="modal-backdrop" onClick={() => setModalForm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem' }}>
              {editandoId ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
            </h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={guardarPaciente}>
              <div className="form-grid-2">
                <div className="field">
                  <label>Documento *</label>
                  <input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} required />
                </div>
                <div className="field">
                  <label>Teléfono</label>
                  <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                </div>
                <div className="field">
                  <label>Nombre *</label>
                  <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
                </div>
                <div className="field">
                  <label>Apellido *</label>
                  <input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
                </div>
              </div>
              <div className="field" style={{ marginTop: '1rem' }}>
                <label>Correo Electrónico</label>
                <input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.35rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setModalForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historialPaciente && (
        <div className="modal-backdrop" onClick={() => setHistorialPaciente(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '0.75rem' }}>
              Historial de {historialPaciente.nombre} {historialPaciente.apellido}
            </h3>
            {citasPaciente.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Este paciente aún no tiene citas registradas.</p>
            ) : (
              <ul style={{ paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {citasPaciente.map((c) => (
                  <li key={c.id_cita}>
                    <strong>{new Date(c.fecha_hora).toLocaleDateString('es-CO')}</strong> — {c.servicio} con {c.odontologo} (<em>{c.estado}</em>)
                  </li>
                ))}
              </ul>
            )}
            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setHistorialPaciente(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}