export default function Layout({ vista, setVista, usuario, onLogout, children }) {
  const menuItems = [
    { id: 'agenda', label: 'Agenda de Citas', icon: '📅' },
    { id: 'nueva-cita', label: 'Nueva Cita', icon: '+' },
    { id: 'pacientes', label: 'Pacientes', icon: '👥' },
    { id: 'catalogos', label: 'Servicios y Odontólogos', icon: '🩺' },
  ];

  const vistaActual = menuItems.find((m) => m.id === vista)?.label || 'Agenda de Citas';
  const fechaHoy = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  const iniciales = usuario.nombre_completo.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-logo">
            <div className="brand-icon">+</div>
            <div className="brand-text">
              <h1>dentalia</h1>
              <span>CLÍNICA ODONTOLÓGICA</span>
            </div>
          </div>

          <div className="sidebar-section-label">ESPACIO DE TRABAJO</div>

          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`sidebar-link ${vista === item.id ? 'active' : ''}`}
                onClick={() => setVista(item.id)}
              >
                <span style={{ width: '18px', textAlign: 'center', fontWeight: 700 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="help-card">
            <div className="help-card-title">❓ ¿Necesitas ayuda?</div>
            <p>Estamos para acompañarte.</p>
            <div className="help-card-link">
              <span>Centro de ayuda</span>
              <span>›</span>
            </div>
          </div>

          <div className="user-box">
            <div className="user-info">
              <div className="user-avatar">{iniciales}</div>
              <div>
                <div className="user-name">{usuario.nombre_completo}</div>
                <div className="user-role">{usuario.rol}</div>
              </div>
            </div>
            <button className="logout-btn" title="Cerrar sesión" onClick={onLogout}>↪</button>
          </div>

          <div className="sidebar-copyright">DENTALIA · GESTIÓN CLÍNICA</div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Gestión de la clínica</span>
            <span>/</span>
            <strong>{vistaActual}</strong>
          </div>
          <div className="topbar-right">
            <span className="clinic-status"><span className="dot dot-green"></span>Clínica abierta</span>
            <span>{fechaHoy}</span>
            <span>🔔</span>
          </div>
        </header>
        <main className="content-wrapper">{children}</main>
      </div>
    </div>
  );
}