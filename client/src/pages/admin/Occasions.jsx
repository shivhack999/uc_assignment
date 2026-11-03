
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Upload,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import toast from "react-hot-toast";

import homepageService from "../../services/homepage.service";
import api from "../../services/api";

const initialFormData = {
  title: "",
  slug: "",
  description: "",
  image: "",
  sortOrder: 0,
  isActive: true,
};

const getOccasionArray = (response) => {
  const data = response?.data?.data ?? response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.occasions)) return data.occasions;

  return [];
};

const getImageUrl = (occasion) =>
  occasion?.image || occasion?.imageUrl || occasion?.url || "";

const generateSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function Occasions() {
  const [occasions, setOccasions] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(initialFormData);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Fetch occasions
  const fetchOccasions = async () => {
    try {
      setLoading(true);
      const response = await homepageService.getOccasions();
      setOccasions(getOccasionArray(response));
    } catch (err) {
      console.error("Fetch occasions error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to load occasions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccasions();
  }, []);

  // Search
  const filteredOccasions = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return occasions.filter((occasion) => {
      const searchableText = [
        occasion.title,
        occasion.name,
        occasion.slug,
        occasion.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [occasions, search]);

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setSelectedFile(null);
    setPreview("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Open add modal
  const handleAdd = () => {
    resetForm();
    setFormData({
      ...initialFormData,
      sortOrder: occasions.length,
    });
    setShowModal(true);
  };

  // Open edit modal
  const handleEdit = (occasion) => {
    setEditingId(occasion.id);

    setFormData({
      title: occasion.title || occasion.name || "",
      slug: occasion.slug || "",
      description: occasion.description || "",
      image: getImageUrl(occasion),
      sortOrder: occasion.sortOrder ?? 0,
      isActive: occasion.isActive ?? true,
    });

    setPreview(getImageUrl(occasion));
    setSelectedFile(null);
    setError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (saving || uploading) return;

    setShowModal(false);
    resetForm();
  };

  // Form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "title" && !editingId
        ? { slug: generateSlug(value) }
        : {}),
    }));
  };

  // Image selection
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

  // Upload image using existing upload API
  const uploadImage = async (file) => {
    const data = new FormData();
    data.append("file", file);

    const response = await api.post("/common/upload-file", data, {
      headers: {
        "Content-Type": undefined,
      },
    });

    const result = response?.data?.data ?? response?.data;

    const imageUrl = result?.fileUrl || result?.url || result?.path;

    if (!imageUrl) {
      throw new Error("Image URL was not returned by the server.");
    }

    return imageUrl;
  };

  // Create / Update occasion
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Occasion title is required.");
      return;
    }

    if (!formData.slug.trim()) {
      setError("Occasion slug is required.");
      return;
    }

    if (!editingId && !selectedFile && !formData.image) {
      setError("Please select an occasion image.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      let imageUrl = formData.image;

      if (selectedFile) {
        setUploading(true);
        imageUrl = await uploadImage(selectedFile);
        setUploading(false);
      }

      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        image: imageUrl || null,
        sortOrder: Number(formData.sortOrder),
        isActive: formData.isActive,
      };

      if (editingId) {
        await homepageService.updateOccasion(editingId, payload);
        toast.success("Occasion updated successfully.");
      } else {
        await homepageService.createOccasion(payload);
        toast.success("Occasion created successfully.");
      }

      setShowModal(false);
      resetForm();
      await fetchOccasions();
    } catch (err) {
      console.error("Save occasion error:", err);

      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to save occasion.";

      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  // Delete occasion
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this occasion?"
    );

    if (!confirmed) return;

    try {
      await homepageService.deleteOccasion(id);

      setOccasions((prev) =>
        prev.filter((occasion) => occasion.id !== id)
      );

      toast.success("Occasion deleted successfully.");
    } catch (err) {
      console.error("Delete occasion error:", err);

      toast.error(
        err?.response?.data?.message || "Failed to delete occasion."
      );
    }
  };

  // Toggle active status
  const handleToggleStatus = async (occasion) => {
    try {
      const updatedStatus = !occasion.isActive;

      await homepageService.updateOccasion(occasion.id, {
        isActive: updatedStatus,
      });

      setOccasions((prev) =>
        prev.map((item) =>
          item.id === occasion.id
            ? { ...item, isActive: updatedStatus }
            : item
        )
      );

      toast.success(
        updatedStatus
          ? "Occasion activated."
          : "Occasion deactivated."
      );
    } catch (err) {
      console.error("Toggle occasion error:", err);

      toast.error(
        err?.response?.data?.message ||
          "Failed to update occasion status."
      );
    }
  };

  // Reorder occasions
  const handleReorder = async (index, direction) => {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= occasions.length) return;

    const updatedOccasions = [...occasions];

    [updatedOccasions[index], updatedOccasions[targetIndex]] = [
      updatedOccasions[targetIndex],
      updatedOccasions[index],
    ];

    setOccasions(updatedOccasions);

    try {
      const items = updatedOccasions.map((occasion, i) => ({
        id: occasion.id,
        sortOrder: i,
      }));

      await homepageService.reorderOccasions(items);

      toast.success("Occasion order updated.");
    } catch (err) {
      console.error("Reorder occasions error:", err);

      toast.error("Failed to reorder occasions.");
      fetchOccasions();
    }
  };

  const activeCount = occasions.filter(
    (occasion) => occasion.isActive
  ).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Occasions Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage occasions displayed on your website.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-800"
        >
          <Plus size={18} />
          Add Occasion
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Occasions</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            {occasions.length}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Occasions</p>
          <h2 className="mt-1 text-2xl font-bold text-green-700">
            {activeCount}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inactive Occasions</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-700">
            {occasions.length - activeCount}
          </h2>
        </div>
      </div>

      {/* Occasion List */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
            <Search size={18} className="text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search occasions..."
              className="w-full text-sm outline-none"
            />
          </div>

          <button
            type="button"
            onClick={fetchOccasions}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-red-700" size={32} />
          </div>
        ) : filteredOccasions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarDays size={40} className="mb-3 text-gray-400" />

            <h2 className="font-semibold text-gray-800">
              {search ? "No matching occasions found" : "No occasions loaded"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {search
                ? "Try searching with another keyword."
                : "Add your first occasion to get started."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={handleAdd}
                className="mt-4 flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm text-white hover:bg-red-800"
              >
                <Plus size={16} />
                Add Occasion
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredOccasions.map((occasion) => {
              const imageUrl = getImageUrl(occasion);
              const index = occasions.findIndex(
                (item) => item.id === occasion.id
              );

              return (
                <div
                  key={occasion.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <div className="relative aspect-[4/3] bg-gray-100">
                    {imageUrl ? (
                      <img
                        src={ `${api.defaults.baseURL.replace(/\/api\/?$/, "")}/api/uploads${imageUrl}`}
                        alt={occasion.title || occasion.name || "Occasion"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <ImageIcon size={40} />
                      </div>
                    )}

                    <span
                      className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${
                        occasion.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {occasion.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="p-4">
                    <h3 className="truncate font-semibold text-gray-900">
                      {occasion.title || occasion.name}
                    </h3>

                    <p className="mt-1 line-clamp-2 min-h-10 text-sm text-gray-500">
                      {occasion.description || "No description provided."}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          title="Move up"
                          disabled={index === 0}
                          onClick={() => handleReorder(index, -1)}
                          className="rounded border p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                        >
                          <ArrowUp size={15} />
                        </button>

                        <button
                          type="button"
                          title="Move down"
                          disabled={index === occasions.length - 1}
                          onClick={() => handleReorder(index, 1)}
                          className="rounded border p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                        >
                          <ArrowDown size={15} />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          title="Edit occasion"
                          onClick={() => handleEdit(occasion)}
                          className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          title="Delete occasion"
                          onClick={() => handleDelete(occasion.id)}
                          className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(occasion)}
                      className={`mt-3 w-full rounded-lg py-2 text-xs font-medium ${
                        occasion.isActive
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {occasion.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Occasion" : "Add Occasion"}
              </h2>

              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Occasion Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Wedding, Birthday, Corporate Event"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-600"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Slug *
                </label>

                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="occasion-slug"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-600"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter occasion description..."
                  className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-600"
                />
              </div>

              {/* Image */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Occasion Image *
                </label>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-4 text-center hover:border-red-500"
                >
                  {preview ? (
                    <img
                      src={`${api.defaults.baseURL.replace(/\/api\/?$/, "")}/api/uploads${preview}`}
                      alt="Occasion preview"
                      className="mx-auto max-h-52 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="py-7">
                      <Upload
                        size={30}
                        className="mx-auto mb-2 text-gray-400"
                      />
                      <p className="text-sm font-medium text-gray-700">
                        Click to upload an image
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG or WEBP. Maximum 5 MB.
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

              {/* Sort order */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Display Order
                </label>

                <input
                  type="number"
                  name="sortOrder"
                  min="0"
                  value={formData.sortOrder}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-600"
                />
              </div>

              {/* Active status */}
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 accent-red-700"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active (display on website)
                </span>
              </label>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving || uploading}
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
                      : editingId
                        ? "Update Occasion"
                        : "Create Occasion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
