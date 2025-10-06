import axios from 'axios'

const api = axios.create({
    baseURL: '/api', // Vite proxy will forward this to FastAPI
})

export const getClothes = async () => {
    const response = await api.get('/clothes')
    return response.data
}
