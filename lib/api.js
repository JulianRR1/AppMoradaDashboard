import axios from "axios"
const LOGIN_PATH = "/admin";

// Configuración base de axios
const api = axios.create({
  baseURL: "https://nodejs-production-50e7.up.railway.app/api/",
  //baseURL: "http://localhost:3000/api/",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
})

// ✅ Interceptor para agregar el token antes de cada solicitud
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Interceptor para manejar errores globalmente
/*api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error)
    return Promise.reject(error)
  },
)*/

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (typeof window !== "undefined" && (status === 401 || status === 403)) {
      try {
        sessionStorage.removeItem("token");
      } catch {}
      // evita bucle si ya estás en el login
      if (window.location.pathname !== LOGIN_PATH) {
        window.location.replace(LOGIN_PATH);
      }
    }

    // log para depurar y propaga el error a la llamada original
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default api
