import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const LayoutBase = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: '220px', backgroundColor: '#2c3e50', color: '#fff', padding: '20px' }}>
        <h2>FuelTrack</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li><Link to="/" style={{ color: '#fff' }}>Home</Link></li>
            <li><Link to="/motoristas" style={{ color: '#fff' }}>Motoristas</Link></li>
            <li><Link to="/caminhoes" style={{ color: '#fff' }}>Caminhões</Link></li>
            <li><Link to="/viagens" style={{ color: '#fff' }}>Viagens</Link></li>
            <li><Link to="/abastecimentos" style={{ color: '#fff' }}>Abastecimentos</Link></li>
            <li><Link to="/relatorios" style={{ color: '#fff' }}>Relatórios</Link></li>
          </ul>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '20px', backgroundColor: '#f5f5f5' }}>
        <header style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutBase;
