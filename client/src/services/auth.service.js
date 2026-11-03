
import api from "./api";

const authService = {
    login: async (credentials) => {
        const response = await api.post("/auth/login", credentials);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get("/auth/profile");
        return response.data;
    },

    logout: async () => {
        try {
            await api.post("/auth/logout");
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
    },
};

export default authService;
