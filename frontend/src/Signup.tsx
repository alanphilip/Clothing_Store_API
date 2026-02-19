import React, { useState } from 'react'
import axios from 'axios'

interface SignupProps {
    onSignupSuccess: (username: string, role: string) => void
    onBackToLogin: () => void
}

// Match backend enum values
type UserRole = 'user' | 'admin'

const Signup: React.FC<SignupProps> = ({ onSignupSuccess, onBackToLogin }) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<UserRole>('user')
    const [error, setError] = useState('')
    const [passwordStrength, setPasswordStrength] = useState<'good' | 'bad' | null>(null)
    const [usernameValid, setUsernameValid] = useState<'good' | 'bad' | null>(null)

    const validatePassword = (pwd: string) => {
        const hasNumber = /\d/.test(pwd)
        const hasSpecial = /[^A-Za-z0-9]/.test(pwd)
        if (pwd.length >= 6 && hasNumber && hasSpecial) {
            setPasswordStrength('good')
        } else {
            setPasswordStrength('bad')
        }
    }

    const validateUsername = (uname: string) => {
        const startsWithLetter = /^[A-Za-z]/.test(uname)
        if (uname.length >= 3 && startsWithLetter) {
            setUsernameValid('good')
        } else {
            setUsernameValid('bad')
        }
    }

    const handleSignup = async () => {
        try {
            await axios.post('http://localhost:8000/signup', {
                username,
                password,
                role,
            })

            const formData = new URLSearchParams()
            formData.append('username', username)
            formData.append('password', password)

            const res = await axios.post('http://localhost:8000/token', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            })

            const token = res.data.access_token
            localStorage.setItem('token', token)

            const userRes = await axios.get('http://localhost:8000/users/me', {
                headers: { Authorization: `Bearer ${token}` },
            })

            const { username: fetchedUsername, role: fetchedRole } = userRes.data
            alert('Signup & login successful!')
            onSignupSuccess(fetchedUsername, fetchedRole)
        } catch (err: any) {
            const detail = err.response?.data?.detail
            if (detail === 'Username already taken') {
                setError('Username already exists. Please choose another.')
            } else if (detail === 'Password required') {
                setError('Password is required.')
            } else if (detail?.includes('Password must')) {
                setError(detail)
            } else if (detail?.includes('Username must')) {
                setError(detail)
            } else {
                setError('Signup failed')
            }
        }
    }

    const isFormValid = usernameValid === 'good' && passwordStrength === 'good'

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
            }}
        >
            <div
                style={{
                    backgroundColor: '#1e1e1e',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
                    maxWidth: '400px',
                    width: '100%',
                    textAlign: 'center',
                }}
            >
                <h2 style={{ color: '#2196f3', marginBottom: '1rem' }}>🆕 Sign Up</h2>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value)
                        validateUsername(e.target.value)
                    }}
                    style={inputStyle}
                />
                <br />

                {usernameValid && (
                    <div
                        style={{
                            marginTop: '0.5rem',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            backgroundColor: usernameValid === 'good' ? 'limegreen' : 'red',
                            color: '#fff',
                            fontWeight: 'bold',
                        }}
                    >
                        {usernameValid === 'good'
                            ? '✅ Username is valid'
                            : '❌ Username must be at least 3 characters and start with a letter'}
                    </div>
                )}

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                        validatePassword(e.target.value)
                    }}
                    style={inputStyle}
                />
                <br />

                {passwordStrength && (
                    <div
                        style={{
                            marginTop: '0.5rem',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            backgroundColor: passwordStrength === 'good' ? 'limegreen' : 'red',
                            color: '#fff',
                            fontWeight: 'bold',
                        }}
                    >
                        {passwordStrength === 'good'
                            ? '✅ Password strength is good'
                            : '❌ Password must be at least 6 characters, include a number and a special character'}
                    </div>
                )}

                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    style={inputStyle}
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <br />

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        onClick={onBackToLogin}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#f44336',
                            color: '#fff',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        }}
                    >
                        Back to Login
                    </button>

                    <button
                        onClick={handleSignup}
                        disabled={!isFormValid}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: isFormValid ? '#4caf50' : '#9e9e9e',
                            color: '#fff',
                            fontWeight: 'bold',
                            cursor: isFormValid ? 'pointer' : 'not-allowed',
                        }}
                    >
                        Sign Up
                    </button>
                </div>

                {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
            </div>
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

export default Signup
