import { useState } from 'react';
import { api } from '../services/api';

export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const res = await api.login({ correo, password });
      onLogin(res.usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <div className="login-brand">
          <div className="brand-logo">
            <div className="brand-icon">+</div>
            <div className="brand-text">
              <h1>dentalia</h1>
              <span>CLÍNICA ODONTOLÓGICA</span>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom: '1rem' }}>
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="ejemplo@dentalia.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>
          <div className="field" style={{ marginBottom: '1.35rem' }}>
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
            disabled={cargando}
          >
            {cargando ? 'Verificando...' : 'Ingresar al sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}