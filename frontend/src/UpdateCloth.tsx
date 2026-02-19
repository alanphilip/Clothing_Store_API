import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from './Navbar'

interface UpdateClothProps {
    username: string
    role: string
    onLogout: () => void
    onUpdateSuccess: (updatedCloth: Cloth) => void // ✅ new prop
    onDelete: (id: number) => Promise<void> // ✅ new prop
}

const UpdateCloth: React.FC<UpdateClothProps> = ({ username, role, onLogout, onUpdateSuccess, onDelete }) => {
    const { cloth_id } = useParams<{ cloth_id: string }>()
    const navigate = useNavigate()

    const [clothName, setClothName] = useState('')
    const [price, setPrice] = useState('')
    const [size, setSize] = useState('')
    const [type, setType] = useState('')
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        axios.get(`http://localhost:8000/cloth/${cloth_id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setClothName(res.data.name)
                setPrice(res.data.price)
                setSize(res.data.size)
                setType(res.data.type)
            })
            .catch(() => setNotification({ type: 'error', message: '❌ Failed to load cloth details.' }))
    }, [cloth_id])

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await axios.put(
                `http://localhost:8000/update-cloth/${cloth_id}`,
                { price: parseFloat(price), size, type },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            console.log("Update response:", res.data) // ✅ debug
            setNotification({ type: 'success', message: '✅ Cloth updated successfully!' })

            // ✅ Pass the updated cloth back to parent
            onUpdateSuccess(res.data)

            // Optional: navigate back after a short delay
            setTimeout(() => navigate('/'), 1500)
        } catch (err) {
            console.error("Update error:", err) // ✅ debug
            setNotification({ type: 'error', message: '❌ Failed to update cloth.' })
        }
    }


    // const handleDelete = async () => {
    //     try {
    //         const token = localStorage.getItem('token')
    //         await axios.delete(`http://localhost:8000/delete-cloth/${cloth_id}`, {
    //             headers: { Authorization: `Bearer ${token}` }
    //         })
    //         setNotification({ type: 'success', message: '🗑️ Cloth deleted successfully!' })
    //         setRefreshFlag(prev => !prev)
    //         setTimeout(() => navigate('/'), 1500)
    //     } catch {
    //         setNotification({ type: 'error', message: '❌ Failed to delete cloth.' })
    //     }
    // }

    const handleDeleteClick = async () => {
        try {
            await onDelete(Number(cloth_id))   // ✅ reuse App’s delete logic
            setTimeout(() => navigate('/'), 1500)
        } catch (err) {
            console.error("Delete failed in UpdateCloth:", err)
            setNotification({ type: 'error', message: '❌ Failed to delete cloth.' })
        }
    }

    return (
        <div style={{ backgroundColor: '#121212', minHeight: '100vh', color: '#fff' }}>
            <Navbar username={username} role={role} onLogout={onLogout} />

            <div style={{ maxWidth: '400px', margin: '2rem auto', backgroundColor: '#1e1e1e', padding: '1.5rem', borderRadius: '10px' }}>
                <h2 style={{ color: '#ff9800', marginBottom: '1rem' }}>✏️ Update {clothName}</h2>

                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" style={inputStyle} />
                <select value={size} onChange={(e) => setSize(e.target.value)} style={inputStyle}>
                    <option value="">Select Size</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                </select>
                <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                    <option value="">Select Type</option>
                    <option value="tops">Tops</option>
                    <option value="bottoms">Bottoms</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="essentials">Essentials</option>
                    <option value="other_garments">Other Garments</option>
                </select>

                {/* Buttons aligned below Size field */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <button
                        onClick={handleUpdate}
                        style={{ ...buttonStyle, backgroundColor: '#ff9800' }}
                    >
                        Update Item
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        style={{ ...buttonStyle, backgroundColor: '#f44336' }}
                    >
                        Delete Item
                    </button>
                </div>

                {notification && (
                    <p style={{ marginTop: '1rem', color: notification.type === 'success' ? 'limegreen' : 'red' }}>
                        {notification.message}
                    </p>
                )}
            </div>
        </div>
    )
}

const inputStyle = {
    padding: '0.5rem',
    width: '100%',
    marginBottom: '1rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.9rem',
}

const buttonStyle = {
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
}

export default UpdateCloth
