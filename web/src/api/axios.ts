import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8081/api",
    withCredentials: true,
});

// Kad access token istekne (401), pokušaj osvježiti preko refresh tokena i ponovi zahtjev.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        const status = error.response?.status;
        const url: string = original?.url ?? "";

        const isAuthCall =
            url.includes("/auth/login") ||
            url.includes("/auth/refresh") ||
            url.includes("/auth/register");

        if (status === 401 && !original._retry && !isAuthCall) {
            original._retry = true;
            try {
                await api.post("/auth/refresh");
                return api(original);
            } catch {
                // Refresh nije uspio — korisnik mora ponovno na login.
            }
        }

        return Promise.reject(error);
    }
);

export default api;
