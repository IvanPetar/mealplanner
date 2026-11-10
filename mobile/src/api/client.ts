import axios from "axios";
import * as SecureStore from "expo-secure-store";

// IP tvog PC-a na WiFi mreži (isti WiFi kao telefon) + port backenda
export const API_BASE = "http://192.168.1.171:8081/api";

const api = axios.create({ baseURL: API_BASE });

// Uz svaki zahtjev priloži JWT token iz sigurne pohrane (Authorization: Bearer ...)
api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
