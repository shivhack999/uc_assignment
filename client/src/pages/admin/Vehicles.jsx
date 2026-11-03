
import { useEffect, useState } from "react";
import api from "../../services/api";
import homepageService from "../../services/homepage.service";

const initialVehicle = {
  name: "",
  category: "CARS_SUVS",
  description: "",
  image: "",
  seatingCapacity: "",
  pricePerKm: "",
  features: [],
  buttonText: "Enquire Now",
  buttonUrl: "#contact",
  isActive: true,
};

const categories = [
  { value: "CARS_SUVS", label: "Cars & SUVs" },
  { value: "LUXURY_CARS", label: "Luxury Cars" },
  { value: "TEMPO_TRAVELLER", label: "Tempo Traveller" },
  { value: "FORCE_URBANIA", label: "Force Urbania" },
  { value: "MINI_BUS", label: "Mini Bus" },
  { value: "LUXURY_BUS", label: "Luxury Bus" },
];

// HANDLE DIFFERENT API RESPONSE STRUCTURES
const getVehicleArray = (response) => {
  const data = response?.data?.data ?? response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.vehicles)) return data.vehicles;

  return [];
};

const generateSlug = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};
const getUploadData = (response) => {
  return response?.data?.data ?? response?.data ?? response;
};
const getImageUrl = (image) => {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  const baseURL = api.defaults.baseURL || "";

  // Remove /api from base URL to avoid duplicate API prefix
  const serverURL = baseURL.replace(/\/api\/?$/, "");

  // If backend returns /uploads/image.jpg
  if (image.startsWith("/uploads/")) {
    return `${serverURL}/api${image}`;
  }

  // If backend returns /api/uploads/image.jpg
  if (image.startsWith("/api/uploads/")) {
    return `${serverURL}${image}`;
  }

  // If backend returns uploads/image.jpg
  return `${serverURL}/api/uploads/${image.replace(/^\/+/, "")}`;
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(initialVehicle);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [preview, setPreview] = useState("");
  const [featureInput, setFeatureInput] = useState("");

  // ==========================================
  // FETCH ALL VEHICLES
  // ==========================================

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await homepageService.getVehicles();

      setVehicles(getVehicleArray(response));
    } catch (err) {
      console.error("Fetch vehicles error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to fetch vehicles."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleAddFeature = () => {
    const feature = featureInput.trim();

    if (!feature) return;

    if (form.features.includes(feature)) {
      setError("This feature has already been added.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      features: [...prev.features, feature],
    }));

    setFeatureInput("");
    setError("");
  };

  const handleRemoveFeature = (featureToRemove) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter(
        (feature) => feature !== featureToRemove
      ),
    }));
  };


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

      // Field name must match backend upload middleware
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

      const data = getUploadData(response);

      const imageUrl =
        data?.fileUrl ||
        data?.url ||
        data?.path;

      if (!imageUrl) {
        throw new Error(
          "Image URL was not returned by server."
        );
      }

      setForm((prev) => ({
        ...prev,
        image: imageUrl,
      }));

      setPreview(getImageUrl(imageUrl));

      setSuccess("Image uploaded successfully.");
    } catch (err) {
      console.error("Upload error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Image upload failed."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };


  const resetForm = () => {
    setForm(initialVehicle);
    setPreview("");
    setFeatureInput("");
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handleAddVehicle = () => {
    resetForm();
    setSuccess("");
    setShowForm(true);
  };

  const handleEdit = (vehicle) => {
    setEditingId(vehicle.id);

    setForm({
      ...initialVehicle,
      ...vehicle,
      seatingCapacity: vehicle.seatingCapacity ?? "",
      pricePerKm: vehicle.pricePerKm ?? "",
      features: Array.isArray(vehicle.features)
        ? vehicle.features
        : [],
      isActive: vehicle.isActive ?? true,
    });

    setPreview(getImageUrl(vehicle.image || ""));

    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const wasEditing = Boolean(editingId);
    const currentEditingId = editingId;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...form,
        slug: generateSlug(form.name),
        seatingCapacity: Number(form.seatingCapacity),
        pricePerKm: Number(form.pricePerKm),
      };

      if (
        !Number.isFinite(payload.seatingCapacity) ||
        payload.seatingCapacity <= 0
      ) {
        throw new Error(
          "Enter a valid seating capacity."
        );
      }

      if (
        !Number.isFinite(payload.pricePerKm) ||
        payload.pricePerKm < 0
      ) {
        throw new Error(
          "Enter a valid price per kilometre."
        );
      }

      if (!payload.name.trim()) {
        throw new Error("Vehicle name is required.");
      }

      if (!payload.description.trim()) {
        throw new Error("Vehicle description is required.");
      }

      if (wasEditing) {
        await homepageService.updateVehicle(
          currentEditingId,
          payload
        );
      } else {
        await homepageService.createVehicle(payload);
      }

      resetForm();

      await fetchVehicles();

      setSuccess(
        wasEditing
          ? "Vehicle updated successfully!"
          : "Vehicle added successfully!"
      );
    } catch (err) {
      console.error("Save vehicle error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save vehicle."
      );
    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vehicle?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await homepageService.deleteVehicle(id);

      if (editingId === id) {
        resetForm();
      }

      await fetchVehicles();

      setSuccess("Vehicle deleted successfully!");
    } catch (err) {
      console.error("Delete vehicle error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete vehicle."
      );
    }
  };

  const handleToggleStatus = async (vehicle) => {
    try {
      setError("");
      setSuccess("");

      await homepageService.updateVehicle(
        vehicle.id,
        {
          isActive: !vehicle.isActive,
        }
      );

      await fetchVehicles();

      setSuccess(
        `Vehicle ${
          vehicle.isActive ? "disabled" : "enabled"
        } successfully.`
      );
    } catch (err) {
      console.error("Toggle vehicle status error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to update vehicle status."
      );
    }
  };


  const getCategoryName = (value) =>
    categories.find(
      (category) => category.value === value
    )?.label || value;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Vehicles Management
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your vehicles, images, features, pricing
              and homepage display.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddVehicle}
            className="rounded-lg bg-[#a20000] px-5 py-3 font-semibold text-white transition hover:bg-red-800"
          >
            + Add New Vehicle
          </button>
        </div>

        {/* NOTIFICATIONS */}

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

        {/* STATISTICS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Vehicles
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              {vehicles.length}
            </h2>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Active Vehicles
            </p>

            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {vehicles.filter((v) => v.isActive).length}
            </h2>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Inactive Vehicles
            </p>

            <h2 className="mt-2 text-3xl font-bold text-gray-500">
              {vehicles.filter((v) => !v.isActive).length}
            </h2>
          </div>

        </div>

        {/* ADD / EDIT FORM */}

        {showForm && (
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">

            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId
                    ? "Edit Vehicle"
                    : "Add New Vehicle"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter vehicle information below.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* VEHICLE NAME */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Vehicle Name *
                  </label>

                  <input
                    required
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Example: Toyota Innova Crysta"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#a20000]"
                  />
                </div>

                {/* CATEGORY */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Vehicle Category *
                  </label>

                  <select
                    required
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-lg border bg-white px-4 py-3 outline-none focus:border-[#a20000]"
                  >
                    {categories.map((category) => (
                      <option
                        key={category.value}
                        value={category.value}
                      >
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DESCRIPTION */}

                <div className="lg:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Vehicle Description *
                  </label>

                  <textarea
                    required
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter vehicle description..."
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#a20000]"
                  />
                </div>

                {/* SEATING CAPACITY */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Seating Capacity *
                  </label>

                  <input
                    required
                    type="number"
                    min="1"
                    name="seatingCapacity"
                    value={form.seatingCapacity}
                    onChange={handleChange}
                    placeholder="Example: 7"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#a20000]"
                  />
                </div>

                {/* PRICE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Price Per KM (₹) *
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    name="pricePerKm"
                    value={form.pricePerKm}
                    onChange={handleChange}
                    placeholder="Example: 18"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#a20000]"
                  />
                </div>

                {/* IMAGE */}

                <div className="lg:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Vehicle Image
                  </label>

                  {preview && (
                    <div className="relative mb-4 max-w-md overflow-hidden rounded-xl border">
                      <img
                        src={preview}
                        alt="Vehicle preview"
                        className="h-56 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setPreview("");

                          setForm((prev) => ({
                            ...prev,
                            image: "",
                          }));
                        }}
                        className="absolute right-3 top-3 rounded-lg bg-red-600 px-3 py-2 text-sm text-white"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 hover:border-[#a20000]">
                    <span className="text-3xl">📁</span>

                    <span className="mt-3 text-sm font-semibold text-gray-700">
                      {uploading
                        ? "Uploading..."
                        : "Click to upload vehicle image"}
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

                {/* FEATURES */}

                <div className="lg:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Vehicle Features
                  </label>

                  <div className="flex gap-2">
                    <input
                      value={featureInput}
                      onChange={(e) =>
                        setFeatureInput(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      placeholder="Example: AC, GPS, Music System"
                      className="min-w-0 flex-1 rounded-lg border px-4 py-3 outline-none focus:border-[#a20000]"
                    />

                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {form.features.map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm text-red-700"
                      >
                        {feature}

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveFeature(feature)
                          }
                          className="font-bold"
                          aria-label={`Remove ${feature}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA TEXT */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Button Text
                  </label>

                  <input
                    name="buttonText"
                    value={form.buttonText}
                    onChange={handleChange}
                    placeholder="Enquire Now"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#a20000]"
                  />
                </div>

                {/* CTA URL */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Button URL
                  </label>

                  <input
                    name="buttonUrl"
                    value={form.buttonUrl}
                    onChange={handleChange}
                    placeholder="#contact"
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-[#a20000]"
                  />
                </div>

                {/* ACTIVE STATUS */}

                <div className="lg:col-span-2">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      className="h-5 w-5 accent-[#a20000]"
                    />

                    <span className="text-sm font-medium text-gray-700">
                      Display this vehicle on the user homepage
                    </span>
                  </label>
                </div>

              </div>

              {/* FORM BUTTONS */}

              <div className="mt-8 flex flex-wrap justify-end gap-3 border-t pt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-lg bg-[#a20000] px-7 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Vehicle"
                    : "Save Vehicle"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VEHICLES LIST */}

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-3 border-b p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                All Vehicles
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage vehicles displayed on your homepage.
              </p>
            </div>

            <button
              onClick={fetchVehicles}
              type="button"
              disabled={loading}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading vehicles...
            </div>
          ) : vehicles.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl">🚘</div>

              <h3 className="mt-4 font-semibold text-gray-800">
                No Vehicles Found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Start by adding your first vehicle.
              </p>

              <button
                onClick={handleAddVehicle}
                type="button"
                className="mt-5 rounded-lg bg-[#a20000] px-5 py-3 text-sm font-semibold text-white"
              >
                + Add Vehicle
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Vehicle</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Seating</th>
                    <th className="px-5 py-4">Price / KM</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {vehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {vehicle.image ? (
                            <img
                              src={getImageUrl(vehicle.image)}
                              alt={vehicle.name}
                              className="h-14 w-20 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-gray-100">
                              🚘
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-gray-900">
                              {vehicle.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {vehicle.features?.length || 0} features
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {getCategoryName(vehicle.category)}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {vehicle.seatingCapacity} Seats
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                        ₹{vehicle.pricePerKm}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(vehicle)
                          }
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            vehicle.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {vehicle.isActive
                            ? "Active"
                            : "Inactive"}
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(vehicle)}
                            className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(vehicle.id)
                            }
                            className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                          >
                            Delete
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

      </div>
    </div>
  );
}
