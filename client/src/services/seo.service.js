
import apiService from "./api";

const seoService = {
  // Get homepage SEO settings
  getSEO: () => apiService.get("web/seo"),

  // Create or update homepage SEO settings
  updateSEO: (data) => apiService.put("web/seo", data),
};

export default seoService;
