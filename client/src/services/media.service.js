
import api from "./api";

const mediaService = {
    getAll: (params = {}) =>
        api.get("/media", { params }),

    getById: (id) =>
        api.get(`/media/${id}`),

    upload: (file) => {
        const formData = new FormData();
        formData.append("image", file);

        return api.post("/media/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    delete: (id) =>
        api.delete(`/media/${id}`),
};

export default mediaService;
