import { useState } from "react";
import { MessageSquare, Plus, Search, Star } from "lucide-react";

export default function Testimonials() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-6">
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
          className="flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-800"
        >
          <Plus size={18} />
          Add Testimonial
        </button>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
          <Search size={18} className="text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search testimonials..."
            className="w-full text-sm outline-none"
          />
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare size={40} className="mb-3 text-gray-400" />

          <h2 className="font-semibold text-gray-800">
            No testimonials loaded
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Connect the testimonials API to manage customer reviews.
          </p>

          <div className="mt-3 flex gap-1 text-yellow-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={16} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}