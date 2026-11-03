import { useEffect, useState } from "react";
import {
  Image,
  Upload,
  Search,
  Trash2,
  FileImage,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function MediaLibrary() {
  const [media, setMedia] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);

      const response = await api.get("/media", {
        params: { search },
      });

      setMedia(response.data?.data?.media || response.data?.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load media"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [search]);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      setUploading(true);

      await api.post("/media/upload", formData);

      toast.success("Image uploaded successfully");
      setSelectedFile(null);
      e.target.reset();
      fetchMedia();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Image upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      await api.delete(`/media/${id}`);
      toast.success("Image deleted successfully");
      fetchMedia();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to delete image"
      );
    }
  };

  const getImageUrl = (filePath) => {
    if (!filePath) return "";
    if (filePath.startsWith("http")) return filePath;

    const baseURL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
    return `${baseURL}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Media Library
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload, search, and manage your website images.
        </p>
      </div>

      {/* Upload */}
      <form
        onSubmit={handleUpload}
        className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2">
          <Upload size={20} className="text-red-700" />
          <h2 className="font-semibold text-gray-900">Upload Image</h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="block w-full max-w-md rounded-lg border border-gray-200 p-2 text-sm"
          />

          <button
            type="submit"
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Upload size={18} />
            )}
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {selectedFile && (
          <p className="mt-3 text-sm text-gray-500">
            Selected: {selectedFile.name}
          </p>
        )}
      </form>

      {/* Media list */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
          <Search size={18} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media..."
            className="w-full text-sm outline-none"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-red-700" size={30} />
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Image size={42} className="mb-3 text-gray-400" />
            <h3 className="font-semibold text-gray-800">
              No media found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload an image to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {media.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-lg border border-gray-200"
              >
                <div className="flex aspect-square items-center justify-center bg-gray-100">
                  {item.filePath ? (
                    <img
                      src={getImageUrl(item.filePath)}
                      alt={item.originalName || item.fileName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileImage size={40} className="text-gray-400" />
                  )}
                </div>

                <div className="p-3">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {item.originalName || item.fileName}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="mt-3 flex items-center gap-2 text-sm text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}