import { useEffect, useState } from "react";
import api from "../../../services/api";
import homepageService from "../../../services/homepage.service";

const initialHero = {
  title: "",
  subtitle: "",
  description: "",
  image: "",
  buttonText: "",
  buttonUrl: "",
  isActive: true,
};

const getSectionsArray = (response) => {
  const data = response?.data?.data ?? response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.sections)) return data.sections;

  return [];
};

export default function Hero() {
  const [hero, setHero] = useState(initialHero);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState("");

  // Fetch existing hero section
  const fetchHero = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await homepageService.getSections();
      console.log("response of Hero :", response);
      const sections = getSectionsArray(response);

      const existingHero = sections.find(
        (section) => section.sectionType === "HERO",
      );

      if (existingHero) {
        setHero({
          ...initialHero,
          ...existingHero,
          isActive: existingHero.isActive ?? true,
        });

        setPreview(`${api.defaults.baseURL.replace(/\/api\/?$/, "")}/api/uploads${existingHero.image}`);
      }
    } catch (err) {
      console.error("Error fetching hero section:", err);
      setError(err.response?.data?.message || "Unable to load hero section.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHero();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setHero((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSuccess("");
  };

  // Upload hero image
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      // IMPORTANT: Field name must match backend upload middleware
      formData.append("file", file);

      console.log("Selected file:", file);
      console.log("FormData entries:", [...formData.entries()]);

      const response = await api.post("/common/upload-file", formData, {
        headers: {
          "Content-Type": undefined,
        },
      });

      const data = response.data?.data ?? response.data;

      const imageUrl = data?.fileUrl || data?.url || data?.path;

      if (!imageUrl) {
        throw new Error("Image URL was not returned by server.");
      }

      setHero((prev) => ({
        ...prev,
        image: imageUrl,
      }));
      console.log("IMG_URL : ", `${api.defaults.baseURL.replace(/\/api\/?$/, "")}${imageUrl}`);
      setPreview(`${api.defaults.baseURL.replace(/\/api\/?$/, "")}/api/uploads${imageUrl}`);
      setSuccess("Image uploaded successfully.");
    } catch (err) {
      console.error("Upload error:", err);

      setError(
        err.response?.data?.message || err.message || "Image upload failed.",
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setHero((prev) => ({
      ...prev,
      image: "",
    }));

    setPreview("");
  };

  // Save hero section
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        sections: [
          {
            sectionType: "HERO",
            title: hero.title,
            subtitle: hero.subtitle,
            description: hero.description,
            image: hero.image,
            buttonText: hero.buttonText,
            buttonUrl: hero.buttonUrl,
            isActive: hero.isActive,
          },
        ],
      };

      await homepageService.updateSections(payload);

      setSuccess("Homepage hero section updated successfully!");
    } catch (err) {
      console.error("Error updating hero section:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update homepage hero section.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-gray-500">Loading hero settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Homepage Hero Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage the hero section and CTA button displayed on your website
              homepage.
            </p>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
              hero.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                hero.isActive ? "bg-green-600" : "bg-gray-500"
              }`}
            />
            {hero.isActive ? "Hero Active" : "Hero Inactive"}
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Hero Settings */}
            <div className="space-y-6 lg:col-span-2">
              {/* Content Settings */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Hero Content
                </h2>

                <p className="mb-5 mt-1 text-sm text-gray-500">
                  Configure the text that appears on your homepage.
                </p>

                <div className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Main Heading
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={hero.title}
                      onChange={handleChange}
                      placeholder="Enter main hero heading"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#a20000] focus:ring-1 focus:ring-[#a20000]"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Subtitle
                    </label>

                    <input
                      type="text"
                      name="subtitle"
                      value={hero.subtitle}
                      onChange={handleChange}
                      placeholder="Enter hero subtitle"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#a20000] focus:ring-1 focus:ring-[#a20000]"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={hero.description}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Enter hero description"
                      className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#a20000] focus:ring-1 focus:ring-[#a20000]"
                    />
                  </div>
                </div>
              </div>

              {/* Image Settings */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Hero Background Image
                </h2>

                <p className="mb-5 mt-1 text-sm text-gray-500">
                  Upload the image that will appear in your homepage hero.
                </p>

                {preview && (
                  <div className="relative mb-4 overflow-hidden rounded-xl border border-gray-200">
                    <img
                      src={preview}
                      alt="Hero preview"
                      className="h-56 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-3 top-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Remove Image
                    </button>
                  </div>
                )}

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition hover:border-[#a20000]">
                  <span className="text-3xl">📁</span>

                  <span className="mt-3 text-sm font-semibold text-gray-700">
                    {uploading ? "Uploading..." : "Click to upload image"}
                  </span>

                  <span className="mt-1 text-xs text-gray-500">
                    PNG, JPG, WEBP (Maximum 5MB)
                  </span>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>

              {/* CTA Button Settings */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Homepage Action Button
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Configure the button visitors will see on the user homepage.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Button Text */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Button Text
                    </label>

                    <input
                      type="text"
                      name="buttonText"
                      value={hero.buttonText}
                      onChange={handleChange}
                      placeholder="Example: Explore Products"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#a20000] focus:ring-1 focus:ring-[#a20000]"
                    />
                  </div>

                  {/* Button URL */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Button Destination URL
                    </label>

                    <input
                      type="text"
                      name="buttonUrl"
                      value={hero.buttonUrl}
                      onChange={handleChange}
                      placeholder="/products or https://example.com"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#a20000] focus:ring-1 focus:ring-[#a20000]"
                    />
                  </div>
                </div>

                {/* Button Preview */}
                <div className="mt-6 rounded-lg bg-gray-50 p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Button Preview
                  </p>

                  {hero.buttonText ? (
                    <span className="inline-flex rounded-lg bg-[#a20000] px-6 py-3 font-semibold text-white">
                      {hero.buttonText}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">
                      Enter button text to see the preview.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Settings and Preview */}
            <div className="space-y-6">
              {/* Visibility */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-gray-800">Hero Visibility</h2>

                <label className="mt-4 flex cursor-pointer items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Display Hero Section
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Enable or hide the homepage hero section.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    name="isActive"
                    checked={hero.isActive}
                    onChange={handleChange}
                    className="h-5 w-5 accent-[#a20000]"
                  />
                </label>
              </div>

              {/* Live Preview */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 p-4">
                  <h2 className="font-semibold text-gray-800">Hero Preview</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Preview of the content configured in this form.
                  </p>
                </div>

                <div
                  className="relative flex min-h-[320px] items-center bg-gray-800 bg-cover bg-center p-6"
                  style={
                    preview
                      ? {
                          backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url("${preview}")`,
                        }
                      : {}
                  }
                >
                  <div className="relative z-10">
                    {hero.subtitle && (
                      <p className="mb-2 text-sm font-medium text-white">
                        {hero.subtitle}
                      </p>
                    )}

                    <h3 className="text-2xl font-bold text-white">
                      {hero.title || "Your Homepage Heading"}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-gray-200">
                      {hero.description ||
                        "Your homepage hero description will appear here."}
                    </p>

                    {hero.buttonText && (
                      <span className="mt-5 inline-block rounded-lg bg-[#a20000] px-5 py-3 text-sm font-semibold text-white">
                        {hero.buttonText}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-500">Button URL:</p>

                  <p className="mt-1 break-all text-sm font-medium text-gray-700">
                    {hero.buttonUrl || "No destination configured"}
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full rounded-lg bg-[#a20000] px-6 py-3 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving Changes..." : "Save Hero Section"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
