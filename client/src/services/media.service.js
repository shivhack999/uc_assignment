
import apiService from "./api";

const mediaService = {
  // Upload single image/file
  uploadFile: (file, options = {}) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiService.post("/common/upload-file", formData, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": undefined,
      },
    });
  },
};

export default mediaService;
