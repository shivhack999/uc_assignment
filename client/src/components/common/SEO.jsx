
import { Helmet } from "react-helmet-async";

const SEO = ({ seo }) => {
  if (!seo) return null;

  const baseURL = import.meta.env.VITE_API_URL?.replace("/api", "") || window.location.origin;

  // Convert relative image paths into absolute URLs
  const getImageURL = (image) => {
    if (!image) return "";

    if (image.startsWith("http")) return image;

    return `${baseURL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  const robots = [
    seo.robotsIndex ? "index" : "noindex",
    seo.robotsFollow ? "follow" : "nofollow",
  ].join(", ");

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{seo.metaTitle || "Urban Cruise"}</title>

      <meta
        name="description"
        content={seo.metaDescription || ""}
      />

      <meta
        name="keywords"
        content={seo.focusKeywords || ""}
      />

      <meta name="robots" content={robots} />

      {/* Canonical URL */}
      {seo.canonicalUrl && (
        <link rel="canonical" href={seo.canonicalUrl} />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={seo.ogTitle || seo.metaTitle || ""} />

      <meta
        property="og:description"
        content={seo.ogDescription || seo.metaDescription || ""}
      />

      <meta property="og:type" content="website" />

      <meta
        property="og:url"
        content={seo.canonicalUrl || window.location.href}
      />

      {seo.ogImage && (
        <meta property="og:image" content={getImageURL(seo.ogImage)} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />

      <meta
        name="twitter:title"
        content={seo.twitterTitle || seo.metaTitle || ""}
      />

      <meta
        name="twitter:description"
        content={seo.twitterDescription || seo.metaDescription || ""}
      />

      {seo.twitterImage && (
        <meta
          name="twitter:image"
          content={getImageURL(seo.twitterImage)}
        />
      )}
    </Helmet>
  );
};

export default SEO;
