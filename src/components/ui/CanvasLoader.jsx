export default function CanvasLoader() {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, width: '100vw', height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      background: 'var(--color-bg)',
      color: 'var(--text-muted)',
      fontFamily: 'monospace',
      pointerEvents: 'none'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{
          width: '30px',
          height: '30px',
          border: '2px solid rgba(251, 191, 36, 0.2)',
          borderTop: '2px solid #fbbf24',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '20px'
        }} />

        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          Loading...
        </div>
      </div>

      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}