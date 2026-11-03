import api from "./api";

const homepageService = {
    // Hero and About
    getSections: () => api.get("/homepage/sections"),
    updateSections: (sections) =>
        api.put("/homepage/sections", { sections }),

    // Vehicles
    getVehicles: (params = {}) =>
        api.get("/homepage/vehicles", { params }),
    getVehicle: (id) =>
        api.get(`/homepage/vehicles/${id}`),
    createVehicle: (data) =>
        api.post("/homepage/vehicles", data),
    updateVehicle: (id, data) =>
        api.put(`/homepage/vehicles/${id}`, data),
    deleteVehicle: (id) =>
        api.delete(`/homepage/vehicles/${id}`),
    reorderVehicles: (items) =>
        api.patch("/homepage/vehicles/reorder", { items }),

    // Occasions
    getOccasions: (params = {}) =>
        api.get("/homepage/occasions", { params }),
    getOccasion: (id) =>
        api.get(`/homepage/occasions/${id}`),
    createOccasion: (data) =>
        api.post("/homepage/occasions", data),
    updateOccasion: (id, data) =>
        api.put(`/homepage/occasions/${id}`, data),
    deleteOccasion: (id) =>
        api.delete(`/homepage/occasions/${id}`),
    reorderOccasions: (items) =>
        api.patch("/homepage/occasions/reorder", { items }),

    // Testimonials
    getTestimonials: (params = {}) =>
        api.get("/homepage/testimonials", { params }),
    getTestimonial: (id) =>
        api.get(`/homepage/testimonials/${id}`),
    createTestimonial: (data) =>
        api.post("/homepage/testimonials", data),
    updateTestimonial: (id, data) =>
        api.put(`/homepage/testimonials/${id}`, data),
    deleteTestimonial: (id) =>
        api.delete(`/homepage/testimonials/${id}`),

    // Gallery
    getGallery: (params = {}) =>
        api.get("/homepage/gallery", { params }),
    createGalleryImage: (data) =>
        api.post("/homepage/gallery", data),
    updateGalleryAlt: (id, altText) =>
        api.patch(`/homepage/gallery/${id}/alt`, { altText }),
    deleteGalleryImage: (id) =>
        api.delete(`/homepage/gallery/${id}`),
    reorderGallery: (items) =>
        api.patch("/homepage/gallery/reorder", { items }),

    // Contact
    getContact: () =>
        api.get("/homepage/contact"),
    updateContact: (data) =>
        api.put("/homepage/contact", data),
};

export default homepageService;
