import React, { useEffect, useState } from 'react'
import { getClothes } from './api'

const getTypeEmoji = (type: string) => {
    switch (type.toLowerCase()) {
        // Tops
        case 'shirt':
            return '👔'
        case 't-shirt':
            return '👕'
        case 'blouse':
            return '👚'

        // Bottoms
        case 'jeans':
        case 'pants':
            return '👖'
        case 'skirt':
            return '👗'
        case 'shorts':
            return '🩳'

        // Outerwear
        case 'hoodie':
        case 'jacket':
            return '🧥'

        // Essentials
        case 'socks':
            return '🧦'
        case 'scarf':
            return '🧣'
        case 'belt':
            return '🪢'
        case 'cap':
            return '🧢'

        default:
            return '👕👖👗'
    }
}

const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
        case 'tops':
            return '#90caf9' // blue
        case 'bottoms':
            return '#a5d6a7' // green
        case 'outerwear':
            return '#ffcc80' // orange
        case 'essentials':
            return '#f48fb1' // pink
        default:
            return '#e0e0e0' // gray
    }
}

const App: React.FC = () => {
    const [clothes, setClothes] = useState<any[]>([])
    const [filtered, setFiltered] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
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
    }, [])

    useEffect(() => {
        const query = search.toLowerCase()
        const results = clothes.filter((c) =>
            c.name.toLowerCase().includes(query)
        )
        setFiltered(results)
    }, [search, clothes])

    return (
        <div
            style={{
                padding: '2rem',
                fontFamily: 'sans-serif',
                backgroundColor: '#121212',
                minHeight: '100vh',
                margin: 0,
                color: '#fff',
            }}
        >
            <h1 style={{ color: 'limegreen', marginBottom: '1rem' }}>
                Welcome to Online Clothing Store
            </h1>

            <input
                type="text"
                placeholder="Search clothes by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    marginBottom: '2rem',
                    width: '100%',
                    maxWidth: '400px',
                    fontSize: '1rem',
                }}
            />

            <h2 style={{ marginBottom: '1rem' }}>Clothes List</h2>

            {loading ? (
                <p>Loading...</p>
            ) : filtered.length === 0 ? (
                <p>No clothes match your search.</p>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '1rem',
                    }}
                >
                    {filtered.map((c) => (
                        <div
                            key={c.cloth_id}
                            style={{
                                backgroundColor: '#1e1e1e',
                                padding: '1rem',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            }}
                        >
                            <h3 style={{ marginBottom: '0.5rem', color: '#90caf9' }}>
                                {getTypeEmoji(c.name)} {c.name}
                            </h3>
                            <p style={{ margin: '0.25rem 0' }}>💲 Price: ${c.price}</p>
                            <p
                                style={{
                                    margin: '0.25rem 0',
                                    color: getTypeColor(c.type),
                                }}
                            >
                                🧶 Type: {c.type}
                            </p>
                            <p style={{ margin: '0.25rem 0' }}>📏 Size: {c.size}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default App
