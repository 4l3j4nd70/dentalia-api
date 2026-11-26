import { useState } from 'react';
import Login from './components/login';
import Layout from './components/Layout';
import AgendaCitas from './components/AgendaCitas';
import NuevaCita from './components/NuevaCita';
import Pacientes from './components/Pacientes';
import Catalogos from './components/Catalogos';

export default function App() {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('dentalia_usuario');
    return guardado ? JSON.parse(guardado) : null;
  });
  const [vista, setVista] = useState('agenda');

  const manejarLogin = (datosUsuario) => {
    localStorage.setItem('dentalia_usuario', JSON.stringify(datosUsuario));
    setUsuario(datosUsuario);
    setVista('agenda');
  };

  const manejarLogout = () => {
    localStorage.removeItem('dentalia_usuario');
    setUsuario(null);
  };

  if (!usuario) {
    return <Login onLogin={manejarLogin} />;
  }

  return (
    <Layout vista={vista} setVista={setVista} usuario={usuario} onLogout={manejarLogout}>
      {vista === 'agenda' && <AgendaCitas onNuevaCita={() => setVista('nueva-cita')} />}
      {vista === 'nueva-cita' && <NuevaCita onVolverAgenda={() => setVista('agenda')} />}
      {vista === 'pacientes' && <Pacientes />}
      {vista === 'catalogos' && <Catalogos />}
    </Layout>
  );
}