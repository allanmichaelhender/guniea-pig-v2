import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- ADD THIS SECTION TO FIX THE REFRESH LOGIC ---
apiClient.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh");
        
        // Use a clean axios instance (not apiClient) to avoid interceptor loops
        const res = await axios.post(`${apiClient.defaults.baseURL}/token/refresh`, {
          refresh: refreshToken,
        });

        if (res.status === 200) {
          const newAccessToken = res.data.access;
          localStorage.setItem("token", newAccessToken);
          
          // Update the failed request with the new token and retry
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If the refresh token itself is expired, wipe everything
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        localStorage.removeItem("username");
        window.location.href = "/login"; 
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
