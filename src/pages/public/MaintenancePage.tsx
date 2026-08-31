const MaintenancePage = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f5f5f5',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '50px',
        borderRadius: '10px',
        maxWidth: '500px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🔧</h1>
        <h2>Site en Maintenance</h2>
        <p style={{ color: '#666' }}>Nous revenons très bientôt !</p>
        <p style={{ color: '#999', fontSize: '14px' }}>Merci de votre patience</p>
      </div>
    </div>
  );
};

export default MaintenancePage;