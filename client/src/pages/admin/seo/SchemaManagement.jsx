import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Code,
  Loader2,
  Power,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../services/api";

const schemaTypes = [
  "ORGANIZATION",
  "FAQ",
  "BREADCRUMB",
  "WEBSITE",
  "LOCAL_BUSINESS",
];

const initialForm = {
  schemaType: "ORGANIZATION",
  schemaData: '{\n  "@context": "https://schema.org",\n  "@type": "Organization"\n}',
  isActive: true,
};

export default function SchemaManagement() {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const fetchSchemas = async () => {
    try {
      setLoading(true);

      const response = await api.get("/seo/schemas");

      const data = response.data?.data;
      setSchemas(Array.isArray(data) ? data : data?.schemas || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load schema records"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemas();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      schemaType: item.schemaType,
      schemaData: JSON.stringify(item.schemaData, null, 2),
      isActive: item.isActive,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let parsedSchema;

    try {
      parsedSchema = JSON.parse(formData.schemaData);
    } catch {
      toast.error("Please enter valid JSON schema data");
      return;
    }

    const payload = {
      schemaType: formData.schemaType,
      schemaData: parsedSchema,
      isActive: formData.isActive,
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/seo/schemas/${editingId}`, payload);
        toast.success("Schema updated successfully");
      } else {
        await api.post("/seo/schemas", payload);
        toast.success("Schema created successfully");
      }

      setShowModal(false);
      fetchSchemas();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to save schema"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schema?")) {
      return;
    }

    try {
      await api.delete(`/seo/schemas/${id}`);
      toast.success("Schema deleted successfully");
      fetchSchemas();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to delete schema"
      );
    }
  };

  const filteredSchemas = schemas.filter((item) =>
    item.schemaType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Schema Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage structured data for search engines.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-800"
        >
          <Plus size={18} />
          Add Schema
        </button>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
          <Search size={18} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schema type..."
            className="w-full text-sm outline-none"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-red-700" size={30} />
          </div>
        ) : filteredSchemas.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Code size={42} className="mb-3 text-gray-400" />
            <h3 className="font-semibold text-gray-800">No schemas found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first structured data schema.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="p-3">Schema Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Schema Data</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSchemas.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="p-3 font-medium text-gray-800">
                      {item.schemaType}
                    </td>

                    <td className="p-3">
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

                    <td className="max-w-xs truncate p-3 text-gray-500">
                      {JSON.stringify(item.schemaData)}
                    </td>

                    <td className="p-3">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={17} />
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              {editingId ? "Edit Schema" : "Add Schema"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Schema Type
                </label>

                <select
                  name="schemaType"
                  value={formData.schemaType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5"
                >
                  {schemaTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Schema JSON
                </label>

                <textarea
                  name="schemaData"
                  value={formData.schemaData}
                  onChange={handleChange}
                  rows={12}
                  spellCheck={false}
                  className="w-full rounded-lg border border-gray-200 bg-gray-950 p-4 font-mono text-sm text-green-300 outline-none focus:border-red-600"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="accent-red-700"
                />
                <Power size={16} />
                Active
              </label>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-red-700 px-5 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}