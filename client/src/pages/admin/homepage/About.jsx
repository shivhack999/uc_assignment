
import { useEffect, useState } from "react";
import api from "../../../services/api";
import homepageService from "../../../services/homepage.service";

const initialAbout = {
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

export default function About() {
  const [about, setAbout] = useState(initialAbout);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [preview, setPreview] = useState("");

  // Fetch existing About section
  const fetchAbout = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await homepageService.getSections();
      const sections = getSectionsArray(response);

      const existingAbout = sections.find(
        (section) => section.sectionType === "ABOUT"
      );

      if (existingAbout) {
        setAbout({
          ...initialAbout,
          ...existingAbout,
          isActive: existingAbout.isActive ?? true,
        });

        setPreview(existingAbout.image || "");
      }
    } catch (err) {
      console.error("Error fetching About section:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load About section."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setAbout((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSuccess("");
  };

  // Upload About section image
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

      setAbout((prev) => ({
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

  // Remove About image
  const handleRemoveImage = () => {
    setAbout((prev) => ({
      ...prev,
      image: "",
    }));

    setPreview("");
    setSuccess("");
  };

  // Save About section
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        sections: [
          {
            sectionType: "ABOUT",
            title: about.title,
            subtitle: about.subtitle,
            description: about.description,
            image: about.image,
            buttonText: about.buttonText,
            buttonUrl: about.buttonUrl,
            isActive: about.isActive,
          },
        ],
      };

      await homepageService.updateSections(payload);

      setSuccess(
        "Homepage About section updated successfully!"
      );
    } catch (err) {
      console.error("Error updating About section:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update About section."
      );
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-gray-500">
          Loading About settings...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Homepage About Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage the About section displayed on your website
              homepage.
            </p>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
              about.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                about.isActive
                  ? "bg-green-600"
                  : "bg-gray-500"
              }`}
            />

            {about.isActive ? "About Active" : "About Inactive"}
          </div>
        </div>

        {/* SUCCESS AND ERROR MESSAGES */}
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

            {/* LEFT SIDE */}
            <div className="space-y-6 lg:col-span-2">

              {/* ABOUT CONTENT */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  About Content
                </h2>

                <p className="mb-5 mt-1 text-sm text-gray-500">
                  Configure your homepage About heading and
                  description.
                </p>

                <div className="space-y-5">

                  {/* TITLE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      About Heading
                    </label>

                    <input
                      type="text"
                      name="title"
                      value={about.title}
                      onChange={handleChange}
                      placeholder="Example: About Urban Cruise"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#a20000] focus:ring-1 focus:ring-[#a20000]"
                    />
                  </div>

                  {/* SUBTITLE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      About Subtitle
                    </label>

                    <input
                      type="text"
                      name="subtitle"
                      value={about.subtitle}
                      onChange={handleChange}
                      placeholder="Example: Your Trusted Travel Partner"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#a20000] focus:ring-1 focus:ring-[#a20000]"
                    />
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      About Description
                    </label>

                    <textarea
                      name="description"
                      value={about.description}
                      onChange={handleChange}
                      rows={8}
                      placeholder="Write about your company, services and experience..."
                      className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#a20000] focus:ring-1 focus:ring-[#a20000]"
                    />

                    <p className="mt-2 text-xs text-gray-400">
                      This description will be displayed on the
                      public homepage.
                    </p>
                  </div>

                </div>
              </div>

              {/* ABOUT IMAGE */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  About Section Image
                </h2>

                <p className="mb-5 mt-1 text-sm text-gray-500">
                  Upload an image to represent your company.
                </p>

                {preview && (
                  <div className="relative mb-4 overflow-hidden rounded-xl border border-gray-200">
                    <img
                      src={preview}
                      alt="About section preview"
                      className="h-64 w-full object-cover"
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
                    {uploading
                      ? "Uploading..."
                      : "Click to upload About image"}
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

              {/* CTA BUTTON SETTINGS */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  About Action Button
                </h2>

                <p className="mb-5 mt-1 text-sm text-gray-500">
                  Manage the button displayed in the user-panel
                  About section.
                </p>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* BUTTON TEXT */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Button Text
                    </label>

                    <input
                      type="text"
                      name="buttonText"
                      value={about.buttonText}
                      onChange={handleChange}
                      placeholder="Example: Know More"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#a20000] focus:ring-1 focus:ring-[#a20000]"
                    />
                  </div>

                  {/* BUTTON URL */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Button Destination URL
                    </label>

                    <input
                      type="text"
                      name="buttonUrl"
                      value={about.buttonUrl}
                      onChange={handleChange}
                      placeholder="/about or #contact"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#a20000] focus:ring-1 focus:ring-[#a20000]"
                    />
                  </div>

                </div>

                {/* BUTTON PREVIEW */}
                <div className="mt-6 rounded-lg bg-gray-50 p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Button Preview
                  </p>

                  {about.buttonText ? (
                    <span className="inline-flex rounded-lg bg-[#a20000] px-6 py-3 font-semibold text-white">
                      {about.buttonText}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">
                      Enter button text to see preview.
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT SIDE */}
            <div className="space-y-6">

              {/* VISIBILITY SETTINGS */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-gray-800">
                  About Visibility
                </h2>

                <label className="mt-4 flex cursor-pointer items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Display About Section
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Enable or hide About section on homepage.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    name="isActive"
                    checked={about.isActive}
                    onChange={handleChange}
                    className="h-5 w-5 accent-[#a20000]"
                  />
                </label>
              </div>

              {/* LIVE PREVIEW */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="border-b border-gray-200 p-4">
                  <h2 className="font-semibold text-gray-800">
                    About Section Preview
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Preview your About section before publishing.
                  </p>
                </div>

                <div className="p-5">

                  {preview ? (
                    <img
                      src={preview}
                      alt="About preview"
                      className="mb-5 h-48 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="mb-5 flex h-48 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                      No image selected
                    </div>
                  )}

                  {about.subtitle && (
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#a20000]">
                      {about.subtitle}
                    </p>
                  )}

                  <h3 className="text-2xl font-bold text-gray-900">
                    {about.title || "About Your Company"}
                  </h3>

                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600">
                    {about.description ||
                      "Your About section description will appear here."}
                  </p>

                  {about.buttonText && (
                    <span className="mt-5 inline-flex rounded-lg bg-[#a20000] px-5 py-3 text-sm font-semibold text-white">
                      {about.buttonText}
                    </span>
                  )}

                </div>
              </div>

              {/* SAVE BUTTON */}
              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full rounded-lg bg-[#a20000] px-6 py-3 font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving Changes..."
                  : "Save About Section"}
              </button>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
