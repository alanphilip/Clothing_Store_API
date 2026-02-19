import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface LoginProps {
    onLoginSuccess: (username: string, role: string) => void
    onSignupClick: () => void
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSignupClick }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setLoading(true)
        try {
            const formData = new URLSearchParams()
            formData.append('username', username)
            formData.append('password', password)

            const response = await axios.post('http://localhost:8000/token', formData)
            const token = response.data.access_token
            localStorage.setItem('token', token)

            const userInfo = await axios.get('http://localhost:8000/token/verify', {
                headers: { Authorization: `Bearer ${token}` }
            })
            // ✅ Store user_id for frontend logic like self-deletion prevention
            localStorage.setItem('user_id', userInfo.data.user_id)
            localStorage.setItem('token', token)
            setNotification({ type: 'success', message: '🔓 Login successful!' })
            setTimeout(() => {
                onLoginSuccess(userInfo.data.username, userInfo.data.role)
                setLoading(false)
            }, 2000)
        } catch (err) {
            setNotification({ type: 'error', message: '❌ Invalid credentials. Please try again.' })
            setLoading(false)
        }
    }

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [notification])

    return (
        <div
            style={{
                backgroundColor: '#1e1e1e',
                padding: '2rem',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
                maxWidth: '400px',
                width: '100%',
                margin: '2rem auto',
                textAlign: 'center',
            }}
        >
            <h2 style={{ color: 'orange', marginBottom: '1rem' }}>🔐 Login</h2>

            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
            />
            <br />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
            />
            <br />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                <button
                    onClick={onSignupClick}
                    style={{
                        backgroundColor: '#2196f3',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                    }}
                >
                    Sign Up
                </button>
                <button
                    onClick={handleLogin}
                    disabled={loading}
                    style={{
                        backgroundColor: loading ? '#888' : '#4caf50',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </div>

            {notification && (
                <div
                    style={{
                        position: 'fixed',
                        top: '1rem',
                        right: '1rem',
                        backgroundColor: notification.type === 'success' ? '#4caf50' : '#f44336',
                        color: '#fff',
                        padding: '0.75rem 1.25rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        fontWeight: 'bold',
                        animation: 'fadeInOut 3s ease-in-out',
                        zIndex: 1000,
                    }}
                >
                    {notification.message}
                </div>
            )}
        </div>
    )
}

const inputStyle = {
    padding: '0.5rem',
    width: '80%',
    marginBottom: '1rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.9rem',
}

export default Login
