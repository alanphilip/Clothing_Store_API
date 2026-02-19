import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface AddClothesProps {
    onAddSuccess: () => void
    username: string
    role: string
    onLogout: () => void
}

const AddClothes: React.FC<AddClothesProps> = ({ onAddSuccess, username, role, onLogout }) => {
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [type, setType] = useState('')
    const [size, setSize] = useState('')
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const handleAdd = async () => {
        setSubmitting(true)
        try {
            const token = localStorage.getItem('token')
            await axios.post(
                'http://localhost:8000/add-clothes',
                { name, price: parseFloat(price), type, size },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            setNotification({ type: 'success', message: '✅ Item added successfully!' })
            setName('')
            setPrice('')
            setType('')
            setSize('')

            setTimeout(() => {
                setSubmitting(false)
                onAddSuccess()
            }, 2000)
        } catch (err) {
            setNotification({ type: 'error', message: '❌ Failed to add item. Please check inputs or try again.' })
            setSubmitting(false)
        }
    }

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [notification])

    return (
        <div style={{ backgroundColor: '#121212', minHeight: '100vh', color: '#fff' }}>
            {}
            <div
                style={{
                    backgroundColor: '#1e1e1e',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
                    maxWidth: '400px',
                    width: '100%',
                    margin: '2rem auto',
                    textAlign: 'center',
                    position: 'relative',
                }}
            >
                <h2 style={{ color: '#4caf50', marginBottom: '1rem' }}>➕ Add Clothes</h2>

                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                />
                <br />
                <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={inputStyle}
                />
                <br />
                <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                    <option value="">Select Type</option>
                    <option value="tops">Tops</option>
                    <option value="bottoms">Bottoms</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="essentials">Essentials</option>
                    <option value="other_garments">Other Garments</option>
                </select>
                <br />
                <select value={size} onChange={(e) => setSize(e.target.value)} style={inputStyle}>
                    <option value="">Select Size</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                </select>
                <br />
                <button
                    onClick={handleAdd}
                    disabled={submitting}
                    style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: submitting ? '#888' : '#2196f3',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                    }}
                >
                    {submitting ? 'Adding...' : 'Add Item'}
                </button>

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

export default AddClothes
