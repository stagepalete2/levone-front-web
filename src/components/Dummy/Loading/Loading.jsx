const Loading = () => {
	return <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: 'black'
    }}
    >
      <div style={{
        width: 40,
        height: 40,
        border: '4px solid rgba(255,255,255,0.2)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'levone-spin 0.8s linear infinite',
      }} />
      <style>{`
        @keyframes levone-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
}

export default Loading