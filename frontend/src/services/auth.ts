import apiClient from "@/services/client";

export const authService = {
  login: async (credentials: any) => {
    const res = await apiClient.post("/users/login", credentials);
    if (res.data.access) {
      localStorage.setItem("token", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("username", res.data.username);
    }
    return res.data;
  },
  register: async (data: any) => {
    const res = await apiClient.post("/users/register", data);
    if (res.data.access) {
      localStorage.setItem("token", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("username", res.data.username);
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem("token");   
    localStorage.removeItem("refresh"); 
    localStorage.removeItem("username");
  },
};
