import React, { useEffect, useState } from 'react'
import axios from 'axios'

interface User {
    user_id: string
    username: string
    role: string
}

interface UserListProps {
    username: string
    role: string
    onLogout: () => void
}

const UserList: React.FC<UserListProps> = ({ username, role, onLogout }) => {
    const [users, setUsers] = useState<User[]>([])
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [showConfirm, setShowConfirm] = useState(false)
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    useEffect(() => {
        const storedId = localStorage.getItem('user_id')
        setCurrentUserId(storedId)

        const token = localStorage.getItem('token')
        axios
            .get('http://localhost:8000/users', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setUsers(res.data))
            .catch((err) => console.error('Failed to fetch users:', err))
    }, [])

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [notification])

    const handleDeleteClick = (userId: string) => {
        setSelectedUserId(userId)
        setShowConfirm(true)
    }

    const confirmDelete = async () => {
        if (!selectedUserId) return
        const token = localStorage.getItem('token')
        try {
            await axios.delete(`http://localhost:8000/delete-user/${selectedUserId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setUsers((prev) => prev.filter((u) => u.user_id !== selectedUserId))
            setNotification({ type: 'success', message: '✅ User deleted successfully!' })
        } catch {
            setNotification({ type: 'error', message: '❌ Failed to delete user.' })
        } finally {
            setShowConfirm(false)
            setSelectedUserId(null)
        }
    }

    return (
        <div style={{ backgroundColor: '#121212', minHeight: '100vh', color: '#fff' }}>
            {}
            <div style={{ padding: '2rem' }}>
                <h2 style={{ color: '#4caf50' }}>👥 All Registered Users</h2>

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
                            zIndex: 1000,
                        }}
                    >
                        {notification.message}
                    </div>
                )}

                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                    <tr style={{ backgroundColor: '#333' }}>
                        <th style={thStyle}>Role</th>
                        <th style={thStyle}>User Name</th>
                        <th style={thStyle}>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user, index) => {
                        const isSelf = currentUserId === user.user_id
                        return (
                            <tr key={user.user_id} style={{ backgroundColor: index % 2 === 0 ? '#1e1e1e' : '#2c2c2c' }}>
                                <td style={tdStyle}>{user.role}</td>
                                <td style={tdStyle}>{user.username}</td>
                                <td style={tdStyle}>
                                    <button
                                        onClick={() => handleDeleteClick(user.user_id)}
                                        disabled={isSelf}
                                        style={{
                                            backgroundColor: isSelf ? '#555' : '#f44336',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '6px',
                                            cursor: isSelf ? 'not-allowed' : 'pointer',
                                            opacity: isSelf ? 0.6 : 1,
                                        }}
                                        title={isSelf ? 'You cannot delete your own account' : ''}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                    </tbody>
                </table>

                {showConfirm && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 2000,
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: '#1e1e1e',
                                padding: '2rem',
                                borderRadius: '10px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                                textAlign: 'center',
                                maxWidth: '400px',
                            }}
                        >
                            <h3 style={{ color: '#ff9800', marginBottom: '1rem' }}>⚠️ Confirm Deletion</h3>
                            <p>Are you sure you want to permanently delete this user?</p>
                            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                                <button
                                    onClick={confirmDelete}
                                    style={{
                                        backgroundColor: '#4caf50',
                                        color: '#fff',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => {
                                        setShowConfirm(false)
                                        setSelectedUserId(null)
                                    }}
                                    style={{
                                        backgroundColor: '#2196f3',
                                        color: '#fff',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const thStyle = {
    padding: '0.75rem',
    textAlign: 'left',
    borderBottom: '2px solid #555',
    color: '#90caf9',
}

const tdStyle = {
    padding: '0.75rem',
    borderBottom: '1px solid #444',
}

export default UserList
