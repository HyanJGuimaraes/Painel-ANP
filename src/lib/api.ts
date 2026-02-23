import axios from "axios";

// Base URL points to the self-hosted FastAPI instance
// Uses Vite ENV variables or falls back to production URL
const BASE_URL = import.meta.env.VITE_API_URL || "https://b2b.app.riobranco.com.br";

export const api = axios.create({
    baseURL: BASE_URL,
});

// Request Interceptor to attach the JWT Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
