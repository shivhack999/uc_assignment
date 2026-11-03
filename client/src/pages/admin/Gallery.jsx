
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Plus,
  Search,
  Upload,
  Trash2,
  Pencil,
  X,
  Loader2,
  RefreshCw,
  Images,
  AlertCircle,
} from "lucide-react";

import homepageService from "../../services/homepage.service";
import api from "../../services/api";

const getGalleryArray = (response) => {
  const data = response?.data?.data ?? response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.gallery)) return data.gallery;
  if (Array.isArray(data?.images)) return data.images;

  return [];
};

const getImageUrl = (item) =>
  item?.imageUrl ||
  item?.image ||
  item?.url ||
  item?.fileUrl ||
  "";

export default function Gallery() {
  const [gallery, setGallery] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [altText, setAltText] = useState("");

  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Fetch gallery images
  const fetchGallery = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await homepageService.getGallery();
      setGallery(getGalleryArray(response));
    } catch (err) {
      console.error("Gallery fetch error:", err);
      setError(
        err?.response?.data?.message || "Failed to load gallery images."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Search gallery images
  const filteredGallery = useMemo(() => {
    return gallery.filter((item) => {
      const text = `${item.altText || ""} ${item.name || ""}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [gallery, search]);

  const resetForm = () => {
    setEditingImage(null);
    setSelectedFile(null);
    setPreview("");
    setAltText("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingImage(item);
    setSelectedFile(null);
    setPreview(getImageUrl(item));
    setAltText(item.altText || "");
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving || uploading) return;

    setShowModal(false);
    resetForm();
  };

  // Handle image selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  // Upload image using existing Axios instance
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      "/common/upload-file",
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      }
    );

    const data = response?.data?.data ?? response?.data;

    const imageUrl =
      data?.fileUrl ||
      data?.url ||
      data?.path;

    if (!imageUrl) {
      throw new Error("Image uploaded, but the server did not return its URL.");
    }

    return imageUrl;
  };

  // Add or update gallery image
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingImage && !selectedFile) {
      setError("Please select an image to upload.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      let imageUrl = getImageUrl(editingImage);

      if (selectedFile) {
        setUploading(true);
        imageUrl = await uploadImage(selectedFile);
        setUploading(false);
      }

      if (editingImage) {
        // Update existing image alt text
        await homepageService.updateGalleryAlt(
          editingImage.id,
          altText.trim()
        );

        // If a new image was selected, update the image record too.
        // This requires your backend to support image updates.
        if (selectedFile) {
          await homepageService.updateGalleryImage(
            editingImage.id,
            {
              image: imageUrl,
              altText: altText.trim(),
            }
          );
        }
      } else {
        await homepageService.createGalleryImage({
          image: imageUrl,
          altText: altText.trim(),
          sortOrder: gallery.length,
        });
      }

      setShowModal(false);
      resetForm();
      await fetchGallery();
    } catch (err) {
      console.error("Gallery save error:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to save gallery image."
      );
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  // Delete gallery image
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this gallery image?"
    );

    if (!confirmed) return;

    try {
      await homepageService.deleteGalleryImage(id);
      setGallery((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Gallery delete error:", err);
      alert(
        err?.response?.data?.message || "Failed to delete gallery image."
      );
    }
  };

  // Move image left or right
  const handleReorder = async (index, direction) => {
    const newGallery = [...gallery];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= newGallery.length) return;

    [newGallery[index], newGallery[targetIndex]] = [
      newGallery[targetIndex],
      newGallery[index],
    ];

    setGallery(newGallery);

    try {
      const items = newGallery.map((item, i) => ({
        id: item.id,
        sortOrder: i,
      }));

      await homepageService.reorderGallery(items);
    } catch (err) {
      console.error("Gallery reorder error:", err);
      alert("Failed to reorder gallery images.");
      fetchGallery();
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gallery Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Upload and manage images displayed in your website gallery.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-800"
        >
          <Plus size={18} />
          Add Image
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Images</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {gallery.length}
              </h2>
            </div>
            <div className="rounded-lg bg-red-50 p-3 text-red-700">
              <Images size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Search Results</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                {filteredGallery.length}
              </h2>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-blue-700">
              <Image size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
            <Search size={18} className="text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gallery..."
              className="w-full text-sm outline-none"
            />
          </div>

          <button
            type="button"
            onClick={fetchGallery}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && !showModal && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-red-700" size={32} />
          </div>
        ) : filteredGallery.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Image size={42} className="mb-3 text-gray-400" />

            <h2 className="font-semibold text-gray-800">
              {search ? "No matching images found" : "No gallery images loaded"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {search
                ? "Try searching with a different keyword."
                : "Upload your first image to get started."}
            </p>

            {!search && (
              <button
                onClick={openAddModal}
                className="mt-4 flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm text-white hover:bg-red-800"
              >
                <Plus size={16} />
                Add First Image
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredGallery.map((item) => {
              const imageUrl = getImageUrl(item);
              const index = gallery.findIndex(
                (image) => image.id === item.id
              );

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <div className="relative aspect-[4/3] bg-gray-100">
                    {imageUrl ? (
                      <img
                        src={`${api.defaults.baseURL.replace(/\/api\/?$/, "")}/api/uploads${imageUrl}`}
                        alt={item.altText || "Gallery image"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <Image size={40} />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {item.altText || "No alt text"}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleReorder(index, -1)}
                          className="rounded border px-2 py-1 text-xs text-gray-600 disabled:opacity-30"
                        >
                          ←
                        </button>

                        <button
                          type="button"
                          disabled={index === gallery.length - 1}
                          onClick={() => handleReorder(index, 1)}
                          className="rounded border px-2 py-1 text-xs text-gray-600 disabled:opacity-30"
                        >
                          →
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          title="Edit image"
                          className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          title="Delete image"
                          className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingImage ? "Edit Gallery Image" : "Add Gallery Image"}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Select Image
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-4 text-center transition hover:border-red-500"
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="mx-auto max-h-56 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="py-8">
                      <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload an image
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, WEBP (Maximum 5 MB)
                      </p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile && (
                  <p className="mt-2 text-xs text-gray-500">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Image Alt Text
                </label>

                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Enter image description..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-600"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex items-center gap-2 rounded-lg bg-red-700 px-5 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
                >
                  {(saving || uploading) && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {uploading
                    ? "Uploading..."
                    : saving
                      ? "Saving..."
                      : editingImage
                        ? "Update Image"
                        : "Upload Image"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
