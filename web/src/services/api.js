const API_URL = 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error en la petición al servidor');
  }
  return data;
}

export const api = {
  login: (credenciales) =>
    request('/login', { method: 'POST', body: JSON.stringify(credenciales) }),
  getServicios: () => request('/servicios'),
  getOdontologos: () => request('/odontologos'),
  getPacientes: () => request('/pacientes'),
  crearPaciente: (paciente) =>
    request('/pacientes', { method: 'POST', body: JSON.stringify(paciente) }),
  actualizarPaciente: (id, paciente) =>
    request(`/pacientes/${id}`, { method: 'PUT', body: JSON.stringify(paciente) }),
  getCitas: () => request('/citas'),
  crearCita: (cita) =>
    request('/citas', { method: 'POST', body: JSON.stringify(cita) }),
  cambiarEstadoCita: (id, estado) =>
    request(`/citas/${id}/estado`, { method: 'PUT', body: JSON.stringify({ estado }) }),
};