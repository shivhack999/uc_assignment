
import { useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Star,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  ImagePlus,
  Upload,
} from "lucide-react";

import homepageService from "../../services/homepage.service";
import api from "../../services/api";

const initialForm = {
  customerName: "",
  review: "",
  rating: 5,
  customerImage: "",
  sortOrder: 0,
  isActive: true,
};

const getTestimonialsArray = (response) => {
  const data = response?.data?.data ?? response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.testimonials)) return data.testimonials;

  return [];
};

const getImageUrl = (image) => {
  if (!image) return "";
  return typeof image === "string" ? image : "";
};

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(initialForm);

  // Fetch testimonials
  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await homepageService.getTestimonials();

      setTestimonials(getTestimonialsArray(response));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load testimonials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Search testimonials
  const filteredTestimonials = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) return testimonials;

    return testimonials.filter((item) => {
      const searchableText = [
        item.customerName,
        item.review,
        item.rating,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchValue);
    });
  }, [testimonials, search]);

  const activeCount = testimonials.filter(
    (item) => item.isActive
  ).length;

  // Open add modal
  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...initialForm,
      sortOrder: testimonials.length,
    });
    setError("");
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = async (testimonial) => {
    try {
      setError("");

      const response = await homepageService.getTestimonial(
        testimonial.id
      );

      const item =
        response?.data?.data ??
        response?.data ??
        testimonial;

      setEditingId(testimonial.id);

      setForm({
        customerName: item.customerName ?? "",
        review: item.review ?? "",
        rating: Number(item.rating ?? 5),
        customerImage: getImageUrl(item.customerImage),
        sortOrder: Number(item.sortOrder ?? 0),
        isActive: item.isActive ?? true,
      });

      setIsModalOpen(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load testimonial details."
      );
    }
  };

  // Close modal
  const closeModal = () => {
    if (saving || uploading) return;

    setIsModalOpen(false);
    setEditingId(null);
    setForm(initialForm);
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Upload customer image
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setError("");

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

      const uploadedFile =
        response?.data?.data ?? response?.data;

      const imageUrl =
        uploadedFile?.fileUrl ??
        uploadedFile?.url ??
        uploadedFile?.path;

      if (!imageUrl) {
        throw new Error("Image URL was not returned by the server.");
      }

      setForm((previous) => ({
        ...previous,
        customerImage: imageUrl,
      }));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Image upload failed."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Save testimonial
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.customerName.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (!form.review.trim()) {
      setError("Customer review is required.");
      return;
    }

    const rating = Number(form.rating);
    const sortOrder = Number(form.sortOrder);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    if (!Number.isFinite(sortOrder) || sortOrder < 0) {
      setError("Sort order must be a valid non-negative number.");
      return;
    }

    const payload = {
      customerName: form.customerName.trim(),
      review: form.review.trim(),
      rating,
      customerImage: form.customerImage || null,
      sortOrder,
      isActive: form.isActive,
    };

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId) {
        await homepageService.updateTestimonial(
          editingId,
          payload
        );
        setSuccess("Testimonial updated successfully.");
      } else {
        await homepageService.createTestimonial(payload);
        setSuccess("Testimonial created successfully.");
      }

      setIsModalOpen(false);
      setEditingId(null);
      setForm(initialForm);

      await fetchTestimonials();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to save testimonial. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete testimonial
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this testimonial?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await homepageService.deleteTestimonial(id);

      setTestimonials((previous) =>
        previous.filter((item) => item.id !== id)
      );

      setSuccess("Testimonial deleted successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to delete testimonial."
      );
    }
  };

  // Toggle active status
  const toggleStatus = async (testimonial) => {
    const updatedStatus = !testimonial.isActive;

    try {
      setError("");
      setSuccess("");

      await homepageService.updateTestimonial(testimonial.id, {
        isActive: updatedStatus,
      });

      setTestimonials((previous) =>
        previous.map((item) =>
          item.id === testimonial.id
            ? { ...item, isActive: updatedStatus }
            : item
        )
      );

      setSuccess("Testimonial status updated successfully.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to update testimonial status."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Testimonials Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer reviews and testimonials.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-800"
        >
          <Plus size={18} />
          Add Testimonial
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>{success}</span>
          <button onClick={() => setSuccess("")}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Testimonials
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {testimonials.length}
              </h2>
            </div>
            <div className="rounded-lg bg-red-50 p-3 text-red-700">
              <MessageSquare size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Active Testimonials
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {activeCount}
              </h2>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-green-700">
              <Eye size={23} />
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer or review..."
              className="w-full text-sm outline-none"
            />
          </div>

          <button
            type="button"
            onClick={fetchTestimonials}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Loader2 size={32} className="mb-3 animate-spin" />
            <p className="text-sm">Loading testimonials...</p>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare size={42} className="mb-3 text-gray-400" />

            <h2 className="font-semibold text-gray-800">
              {search
                ? "No matching testimonials"
                : "No testimonials found"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {search
                ? "Try searching with another keyword."
                : "Add your first customer testimonial to get started."}
            </p>

            {!search && (
              <button
                onClick={openAddModal}
                className="mt-4 flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
              >
                <Plus size={17} />
                Add Testimonial
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Review</th>
                  <th className="px-4 py-3 font-semibold">Rating</th>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {[...filteredTestimonials]
                  .sort(
                    (a, b) =>
                      Number(a.sortOrder ?? 0) -
                      Number(b.sortOrder ?? 0)
                  )
                  .map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {item.customerImage ? (
                            <img
                              src={`${api.defaults.baseURL.replace(/\/api\/?$/, "")}/api/uploads${item.customerImage}`}
                              alt={item.customerName}
                              className="h-11 w-11 rounded-full border border-gray-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-700">
                              <MessageSquare size={18} />
                            </div>
                          )}

                          <p className="font-semibold text-gray-900">
                            {item.customerName}
                          </p>
                        </div>
                      </td>

                      <td className="max-w-sm px-4 py-4">
                        <p className="line-clamp-2 text-sm text-gray-600">
                          {item.review}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-yellow-500">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              size={15}
                              fill={
                                index < Number(item.rating || 0)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          ))}
                          <span className="ml-1 text-xs text-gray-500">
                            ({item.rating || 0})
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-gray-600">
                        {item.sortOrder ?? 0}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            item.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => toggleStatus(item)}
                            title={
                              item.isActive
                                ? "Deactivate"
                                : "Activate"
                            }
                            className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                          >
                            {item.isActive ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            title="Edit testimonial"
                            className="rounded-lg border border-gray-200 p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            title="Delete testimonial"
                            className="rounded-lg border border-gray-200 p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingId
                    ? "Edit Testimonial"
                    : "Add Testimonial"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Enter customer review details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {/* Customer Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Customer Review */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Customer Review *
                </label>
                <textarea
                  name="review"
                  value={form.review}
                  onChange={handleChange}
                  placeholder="Write the customer testimonial..."
                  rows={4}
                  required
                  className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Customer Image */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Customer Image
                </label>

                <div className="flex flex-wrap items-center gap-4">
                  {form.customerImage ? (
                    <img
                      src={`${api.defaults.baseURL.replace(/\/api\/?$/, "")}/api/uploads${form.customerImage}`} 
                      alt="Customer preview"
                      className="h-16 w-16 rounded-full border border-gray-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      <ImagePlus size={24} />
                    </div>
                  )}

                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    {uploading ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Upload size={17} />
                    )}

                    {uploading ? "Uploading..." : "Upload Image"}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>

                  {form.customerImage && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          customerImage: "",
                        }))
                      }
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Customer Rating
                </label>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          rating,
                        }))
                      }
                      className="text-yellow-500"
                    >
                      <Star
                        size={26}
                        fill={
                          rating <= Number(form.rating)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  ))}

                  <span className="ml-2 text-sm text-gray-500">
                    {form.rating} / 5
                  </span>
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Sort Order
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  min="0"
                  value={form.sortOrder}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Lower numbers appear first.
                </p>
              </div>

              {/* Active Status */}
              <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-gray-50 p-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 accent-red-700"
                />
                <span className="text-sm font-medium text-gray-700">
                  Show this testimonial on the website
                </span>
              </label>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving || uploading}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex items-center gap-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2 size={16} className="animate-spin" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Testimonial"
                      : "Create Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
