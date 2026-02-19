import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getClothes } from './api'
import Login from './Login'
import Signup from './Signup'
import AddClothes from './AddClothes'
import UserList from './UserList'
import UpdateCloth from './UpdateCloth'
import Navbar from './Navbar'

const App: React.FC = () => {
    const [clothes, setClothes] = useState<any[]>([])
    const [filtered, setFiltered] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [showSignup, setShowSignup] = useState(false)
    const [username, setUsername] = useState('')
    const [role, setRole] = useState('')
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [refreshFlag, setRefreshFlag] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (token) {
            axios.get("http://localhost:8000/token/verify", {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    setUsername(res.data.username)
                    setRole(res.data.role)
                    setIsLoggedIn(true)
                })
                .catch(err => {
                    console.error("Token verification failed:", err)
                    // optional: clear token if invalid
                    localStorage.removeItem("token")
                    setIsLoggedIn(false)
                })
        }
    }, [])

    const handleLoginSuccess = (user: string, role: string) => {
        setUsername(user)       // ✅ store username
        setRole(role)       // ✅ store role
        setIsLoggedIn(true)     // ✅ mark user as logged in
    }

    const fetchClothes = () => {
        getClothes()
            .then((data) => {
                setClothes(data)
                setFiltered(data)
                setLoading(false)
            })
            .catch((err) => {
                console.error('Error fetching clothes:', err)
                alert('Failed to fetch clothes')
                setLoading(false)
            })
    }

    useEffect(() => {
        if (isLoggedIn) {
            const token = localStorage.getItem("token")
            axios.get("http://localhost:8000/clothes", {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    console.log("Fetched clothes:", res.data)
                    setClothes(res.data)
                    setLoading(false)   // ✅ stop showing "Loading..."
                })
                .catch(err => {
                    console.error("Failed to fetch clothes:", err)
                    setClothes([])
                    setLoading(false)   // ✅ stop loading even on error
                })
        }
    }, [isLoggedIn, refreshFlag])


    useEffect(() => {
        const query = (search || "").toLowerCase()
        const results = clothes.filter((c) =>
            c.name && c.name.toLowerCase().includes(query)
        )
        setFiltered(results)
    }, [search, clothes])


    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [notification])

    const handleDelete = async (id: number) => {
        try {
            const token = localStorage.getItem('token')
            await axios.delete(`http://localhost:8000/delete-cloth/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setNotification({ type: 'success', message: '🗑️ Cloth deleted successfully!' })
            setRefreshFlag(prev => !prev)
        } catch {
            setNotification({ type: 'error', message: '❌ Failed to delete Cloth.' })
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        setIsLoggedIn(false)
        setUsername('')
        setRole('')
        navigate('/')   // ✅ redirect to homepage/login
    }

    return (
        <>
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

            <Routes>
                <Route
                    path="/"
                    element={
                        <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#121212', minHeight: '100vh', color: '#fff' }}>
                            <h1 style={{ color: 'limegreen', textAlign: 'center' }}>Welcome to Online Clothing Store</h1>

                            {!isLoggedIn ? (
                                !showSignup ? (
                                    <Login
                                        onLoginSuccess={(uname, role) => {
                                            setIsLoggedIn(true)
                                            setUsername(uname)
                                            setRole(role)   // ✅ use setRole here
                                        }}
                                        onSignupClick={() => setShowSignup(true)}
                                    />
                                ) : (
                                    <Signup
                                        onSignupSuccess={(uname, role) => {
                                            setIsLoggedIn(true)
                                            setUsername(uname)
                                            setRole(role)
                                            setShowSignup(false)
                                        }}
                                        onBackToLogin={() => setShowSignup(false)}
                                    />
                                )
                            ) : (
                                <>
                                    <Navbar username={username} role={role} onLogout={handleLogout} />

                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            placeholder="Search clothes by name..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', width: '100%', maxWidth: '400px' }}
                                        />
                                    </div>

                                    <h2>Clothes List</h2>
                                    {loading ? (
                                        <p>Loading...</p>
                                    ) : filtered.length === 0 ? (
                                        <p>No clothes match your search.</p>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                            {filtered.map((c) => (


                                                <div key={c.cloth_id} style={{ backgroundColor: '#1e1e1e', padding: '1rem', borderRadius: '8px' }}>
                                                    <h3 style={{ color: '#90caf9' }}>{c.name}</h3>
                                                    <p>💲 Price: ${c.price}</p>
                                                    <p>🧶 Type: {c.type}</p>
                                                    <p>📏 Size: {c.size}</p>

                                                    {role === 'admin' && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                                                            <button
                                                                onClick={() => navigate(`/update/${c.cloth_id}`)}
                                                                style={{ backgroundColor: '#ff9800', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}
                                                            >
                                                                ✏️ Update
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(c.cloth_id)}
                                                                style={{ backgroundColor: '#f44336', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>



                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    }
                />
                <Route
                    path="/add"
                    element={
                        <>
                            <Navbar username={username} role={role} onLogout={handleLogout} />
                            <AddClothes onAddSuccess={() => setRefreshFlag(prev => !prev) || navigate('/')} username={username} role={role} onLogout={handleLogout} />
                        </>
                    }
                />
                <Route
                    path="/users"
                    element={
                        <>
                            <Navbar username={username} role={role} onLogout={handleLogout} />
                            <UserList username={username} role={role} onLogout={handleLogout} />
                        </>
                    }
                />
                <Route
                    path="/update/:cloth_id"
                    element={
                        <UpdateCloth
                            username={username}
                            role={role}
                            onLogout={handleLogout}
                            onUpdateSuccess={(updatedCloth) => {
                                setClothes(prev =>
                                    prev.map(c => c.cloth_id === updatedCloth.cloth_id ? updatedCloth : c)
                                )
                                setRefreshFlag(flag => !flag) // optional if you want to re‑trigger fetch
                            }}
                            onDelete={handleDelete}
                        />

                    }
                />
            </Routes>
        </>
    )
}

export default App
