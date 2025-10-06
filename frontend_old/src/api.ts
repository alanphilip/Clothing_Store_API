import axios from "axios";

const API_URL = "http://localhost:8000"; // your FastAPI backend

// Create an axios instance
const api = axios.create({
    baseURL: API_URL,
});

// Attach token automatically if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async (username: string, password: string) => {
    const response = await api.post("/token", {
        username,
        password,
    });
    localStorage.setItem("access_token", response.data.access_token);
    return response.data;
};

export const getClothes = async () => {
    const response = await api.get("/clothes");
    return response.data;
};

export default api;
