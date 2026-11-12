
import { useEffect, useState } from "react";
import seoService from "../services/seo.service";

const useHomepageSEO = () => {
  const [seo, setSeo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSEO = async () => {
      try {
        const response = await seoService.getSEO();

        console.log("SEO API Response:", response);

        // Axios response handling
        const result = response?.data?.data || response?.data;

        setSeo(result);
      } catch (error) {
        console.error(
          "SEO fetch error:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSEO();
  }, []);

  return { seo, loading };
};

export default useHomepageSEO;
