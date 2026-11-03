
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import seoService from "../../../services/seo.service";
import mediaService from "../../../services/media.service";
import api from "../../../services/api";

const initialFormData = {
  metaTitle: "",
  metaDescription: "",
  focusKeywords: "",
  canonicalUrl: "",
  robotsIndex: true,
  robotsFollow: true,
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  twitterTitle: "",
  twitterDescription: "",
  twitterImage: "",
};

const SEOSettings = () => {
  const [formData, setFormData] = useState(initialFormData);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState({
    ogImage: false,
    twitterImage: false,
  });

  const fetchSEOSettings = useCallback(async () => {
    try {
      setLoading(true);

      const response = await seoService.getSEO();
      const seo = response.data?.data;

      if (!seo) {
        setFormData(initialFormData);
        return;
      }

      setFormData({
        metaTitle: seo.metaTitle ?? "",
        metaDescription: seo.metaDescription ?? "",
        focusKeywords: seo.focusKeywords ?? "",
        canonicalUrl: seo.canonicalUrl ?? "",

        robotsIndex: seo.index ?? seo.robotsIndex ?? true,
        robotsFollow: seo.follow ?? seo.robotsFollow ?? true,

        ogTitle: seo.ogTitle ?? "",
        ogDescription: seo.ogDescription ?? "",
        ogImage: seo.ogImage ?? "",

        twitterTitle: seo.twitterTitle ?? "",
        twitterDescription: seo.twitterDescription ?? "",
        twitterImage: seo.twitterImage ?? "",
      });
    } catch (error) {
      console.error("SEO fetch error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load SEO settings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSEOSettings();
  }, [fetchSEOSettings]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate image type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      e.target.value = "";
      return;
    }

    // Validate image size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    try {
      setUploading((prev) => ({
        ...prev,
        [fieldName]: true,
      }));

      // Upload through media service
      const response = await mediaService.uploadFile(file);

      // Extract returned image URL
      const imageUrl =
        response.data?.data?.fileUrl ||
        response.data?.data?.url ||
        response.data?.data?.path ||
        response.data?.fileUrl ||
        response.data?.url ||
        response.data?.path;

      if (!imageUrl) {
        throw new Error(
          "Image URL was not returned by the upload API."
        );
      }

      // Save image URL in form state
      setFormData((prev) => ({
        ...prev,
        [fieldName]: imageUrl,
      }));

      toast.success("Image uploaded successfully.");
    } catch (error) {
      console.error("Image upload error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Image upload failed."
      );
    } finally {
      setUploading((prev) => ({
        ...prev,
        [fieldName]: false,
      }));

      e.target.value = "";
    }
  };

  const removeImage = (fieldName) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting SEO settings:", formData);
    if (!formData.metaTitle.trim()) {
      toast.error("Meta title is required.");
      return;
    }

    if (formData.metaTitle.trim().length > 60) {
      toast.error("Meta title should not exceed 60 characters.");
      return;
    }

    if (formData.metaDescription.length > 160) {
      toast.error(
        "Meta description should not exceed 160 characters."
      );
      return;
    }

    if (uploading.ogImage || uploading.twitterImage) {
      toast.error("Please wait for image uploads to finish.");
      return;
    }

    const payload = {
      metaTitle: formData.metaTitle.trim(),
      metaDescription: formData.metaDescription.trim(),
      canonicalUrl: formData.canonicalUrl.trim(),
      focusKeywords: formData.focusKeywords.trim(),

      // Backend expects index and follow
      index: formData.robotsIndex,
      follow: formData.robotsFollow,

      ogTitle: formData.ogTitle.trim(),
      ogDescription: formData.ogDescription.trim(),
      ogImage: formData.ogImage,

      twitterTitle: formData.twitterTitle.trim(),
      twitterDescription: formData.twitterDescription.trim(),
      twitterImage: formData.twitterImage,
    };

    try {
      setSaving(true);

      const response = await seoService.updateSEO(payload);

      toast.success(
        response.data?.message ||
          "SEO settings saved successfully."
      );

      // Keep the saved values synchronized with the form.
      const savedSEO = response.data?.data;

      if (savedSEO) {
        setFormData((prev) => ({
          ...prev,
          metaTitle: savedSEO.metaTitle ?? prev.metaTitle,
          metaDescription:
            savedSEO.metaDescription ?? prev.metaDescription,
          canonicalUrl: savedSEO.canonicalUrl ?? prev.canonicalUrl,
          focusKeywords:
            savedSEO.focusKeywords ?? prev.focusKeywords,

          robotsIndex:
            savedSEO.index ??
            savedSEO.robotsIndex ??
            prev.robotsIndex,

          robotsFollow:
            savedSEO.follow ??
            savedSEO.robotsFollow ??
            prev.robotsFollow,

          ogTitle: savedSEO.ogTitle ?? prev.ogTitle,
          ogDescription:
            savedSEO.ogDescription ?? prev.ogDescription,
          ogImage: savedSEO.ogImage ?? prev.ogImage,

          twitterTitle:
            savedSEO.twitterTitle ?? prev.twitterTitle,
          twitterDescription:
            savedSEO.twitterDescription ??
            prev.twitterDescription,
          twitterImage:
            savedSEO.twitterImage ?? prev.twitterImage,
        }));
      }
    } catch (error) {
      console.error("SEO update error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to save SEO settings."
      );
    } finally {
      setSaving(false);
    }
  };
  const InputField = ({
    label,
    name,
    placeholder,
    maxLength,
    type = "text",
  }) => (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-gray-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      {maxLength && (
        <p className="text-right text-xs text-gray-500">
          {formData[name].length}/{maxLength} characters
        </p>
      )}
    </div>
  );

  const TextAreaField = ({
    label,
    name,
    placeholder,
    rows = 3,
    maxLength,
  }) => (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-gray-700"
      >
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      {maxLength && (
        <p className="text-right text-xs text-gray-500">
          {formData[name].length}/{maxLength} characters
        </p>
      )}
    </div>
  );

  const ImageUpload = ({ label, fieldName }) => (
    console.log("Rendering ImageUpload for field:", `${api.defaults.baseURL.replace(/\/api\/?$/, "")}/api/uploads${formData[fieldName]}`),
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>

      {formData[fieldName] && (
        <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <img
            src={`${api.defaults.baseURL.replace(/\/api\/?$/, "")}/api/uploads${formData[fieldName]}`}
            alt={label}
            className="h-44 w-full object-contain"
          />

          <button
            type="button"
            onClick={() => removeImage(fieldName)}
            className="absolute right-2 top-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
          >
            Remove
          </button>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        disabled={uploading[fieldName]}
        onChange={(e) => handleImageUpload(e, fieldName)}
        className="block w-full max-w-sm text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
      />

      {uploading[fieldName] && (
        <p className="text-sm text-blue-600">
          Uploading image...
        </p>
      )}

      <p className="text-xs text-gray-500">
        Maximum file size: 5 MB. Supported image formats depend on your
        upload API.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-gray-500">
            Loading SEO settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          SEO Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage homepage SEO and social sharing information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* GENERAL SEO */}
        <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              General SEO
            </h2>

            <p className="text-sm text-gray-500">
              Configure homepage search engine metadata.
            </p>
          </div>

          <InputField
            label="Meta Title"
            name="metaTitle"
            placeholder="Enter homepage title"
            maxLength={60}
          />

          <TextAreaField
            label="Meta Description"
            name="metaDescription"
            placeholder="Describe your homepage..."
            rows={4}
            maxLength={160}
          />

          <InputField
            label="Focus Keywords"
            name="focusKeywords"
            placeholder="car rental, luxury vehicles, urban cruise"
          />

          <InputField
            label="Canonical URL"
            name="canonicalUrl"
            placeholder="https://example.com/"
          />
        </section>

        <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Search Engine Visibility
            </h2>

            <p className="text-sm text-gray-500">
              Configure indexing and link-following permissions.
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="robotsIndex"
              checked={formData.robotsIndex}
              onChange={handleChange}
              className="mt-1 h-4 w-4 accent-blue-600"
            />

            <span>
              <span className="block text-sm font-semibold text-gray-800">
                Allow search engines to index this page
              </span>

              <span className="text-xs text-gray-500">
                Disable to use noindex.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="robotsFollow"
              checked={formData.robotsFollow}
              onChange={handleChange}
              className="mt-1 h-4 w-4 accent-blue-600"
            />

            <span>
              <span className="block text-sm font-semibold text-gray-800">
                Allow search engines to follow links
              </span>

              <span className="text-xs text-gray-500">
                Disable to use nofollow.
              </span>
            </span>
          </label>
        </section>

        {/* OPEN GRAPH SETTINGS */}
        <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Open Graph Settings
            </h2>

            <p className="text-sm text-gray-500">
              Configure social sharing information for Facebook and
              other Open Graph platforms.
            </p>
          </div>

          <InputField
            label="OG Title"
            name="ogTitle"
            placeholder="Enter Open Graph title"
          />

          <TextAreaField
            label="OG Description"
            name="ogDescription"
            placeholder="Enter Open Graph description"
            rows={3}
          />

          <ImageUpload
            label="OG Image"
            fieldName="ogImage"
          />
        </section>

        {/* TWITTER SETTINGS */}
        <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Twitter Card Settings
            </h2>

            <p className="text-sm text-gray-500">
              Configure X/Twitter sharing information.
            </p>
          </div>

          <InputField
            label="Twitter Title"
            name="twitterTitle"
            placeholder="Enter Twitter title"
          />

          <TextAreaField
            label="Twitter Description"
            name="twitterDescription"
            placeholder="Enter Twitter description"
            rows={3}
          />

          <ImageUpload
            label="Twitter Image"
            fieldName="twitterImage"
          />
        </section>

        {/* FORM ACTIONS */}
        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={fetchSEOSettings}
            disabled={saving || Object.values(uploading).some(Boolean)}
            className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Reload Settings
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              Object.values(uploading).some(Boolean)
            }
            className="flex items-center gap-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save SEO Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SEOSettings;
