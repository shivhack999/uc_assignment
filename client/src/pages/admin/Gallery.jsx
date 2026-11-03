import { useState } from "react";
import { Image, Plus, Search } from "lucide-react";

export default function Gallery() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gallery Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage images displayed in your website gallery.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-800"
        >
          <Plus size={18} />
          Add Image
        </button>
      </div>

      {/* Gallery Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
          <Search size={18} className="text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gallery..."
            className="w-full text-sm outline-none"
          />
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Image size={42} className="mb-3 text-gray-400" />

          <h2 className="font-semibold text-gray-800">
            No gallery images loaded
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Upload and manage your website gallery images here.
          </p>
        </div>
      </div>
    </div>
  );
}