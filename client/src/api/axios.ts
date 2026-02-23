import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://scopeserver.onrender.com/api/system",
  timeout: 10000,
});

//coloca Authorization header automaticamente
API.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
  
  }
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default API;
