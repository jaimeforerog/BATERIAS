import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// Configuración del cliente Axios
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5167',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Aquí se puede añadir autenticación en el futuro
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const status = error.response.status;

      if (status === 404) {
        console.error('Recurso no encontrado');
      } else if (status === 400) {
        console.error('Error de validación:', error.response.data);
      } else if (status >= 500) {
        console.error('Error del servidor');
      }
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      console.error('No se pudo conectar con el servidor');
    } else {
      // Algo sucedió al configurar la petición
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
