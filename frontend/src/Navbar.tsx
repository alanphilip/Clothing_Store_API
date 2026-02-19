import React from 'react'
import { useNavigate } from 'react-router-dom'

interface NavbarProps {
    username: string
    role: string
    onLogout: () => void
}

const Navbar: React.FC<NavbarProps> = ({ username, role, onLogout }) => {
    const navigate = useNavigate()

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: '#1e1e1e',
                color: '#fff',
                marginBottom: '2rem',
            }}
        >
            <div>
                <strong>Navigation Bar</strong>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span>
          🔒 Logged in as: <strong>{username}</strong> ({role})
        </span>
                <button
                    onClick={() => navigate('/')}
                    style={navButtonStyle}
                >
                    Home
                </button>
                {role === 'admin' && (
                    <>
                        <button
                            onClick={() => navigate('/add')}
                            style={navButtonStyle}
                        >
                            Add Clothes
                        </button>
                        <button
                            onClick={() => navigate('/users')}
                            style={navButtonStyle}
                        >
                            View All Users
                        </button>
                    </>
                )}
                <button
                    onClick={onLogout}
                    style={{
                        ...navButtonStyle,
                        backgroundColor: '#f44336',
                        color: '#fff',
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

const navButtonStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#2196f3',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
}

export default Navbar
