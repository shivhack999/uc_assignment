import { useState } from "react";
import { Search, Save, Globe, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function SEOSettings() {
  const [formData, setFormData] = useState({
    metaTitle: "",
    metaDescription: "",
    focusKeywords: "",
    canonicalUrl: "",
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("SEO form UI is ready. API integration pending.");
  };

  const InputField = ({ label, name, placeholder, textarea = false }) => (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      {textarea ? (
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleChange}
          rows={3}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-red-600"
        />
      ) : (
        <input
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-red-600"
        />
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          SEO Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your website search engine optimization settings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General SEO */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Search className="text-red-700" size={22} />
            <h2 className="text-lg font-semibold">General SEO</h2>
          </div>

          <div className="grid gap-5">
            <InputField
              label="Meta Title"
              name="metaTitle"
              placeholder="Enter website meta title"
            />

            <InputField
              label="Meta Description"
              name="metaDescription"
              placeholder="Enter meta description"
              textarea
            />

            <InputField
              label="Focus Keywords"
              name="focusKeywords"
              placeholder="keyword 1, keyword 2"
            />

            <InputField
              label="Canonical URL"
              name="canonicalUrl"
              placeholder="https://example.com/"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-6">
            {[
              { name: "robotsIndex", label: "Allow Search Indexing" },
              { name: "robotsFollow", label: "Allow Link Following" },
            ].map((item) => (
              <label
                key={item.name}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  name={item.name}
                  checked={formData[item.name]}
                  onChange={handleChange}
                  className="accent-red-700"
                />
                {item.label}
              </label>
            ))}
          </div>
        </section>

        {/* Open Graph */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Globe className="text-red-700" size={22} />
            <h2 className="text-lg font-semibold">Open Graph Settings</h2>
          </div>

          <div className="grid gap-5">
            <InputField label="OG Title" name="ogTitle" placeholder="Enter OG title" />
            <InputField
              label="OG Description"
              name="ogDescription"
              placeholder="Enter OG description"
              textarea
            />
            <InputField
              label="OG Image URL"
              name="ogImage"
              placeholder="Enter image URL"
            />
          </div>
        </section>

        {/* Twitter */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
           <Send className="text-red-700" size={22} />
            <h2 className="text-lg font-semibold">Twitter Settings</h2>
          </div>

          <div className="grid gap-5">
            <InputField
              label="Twitter Title"
              name="twitterTitle"
              placeholder="Enter Twitter title"
            />
            <InputField
              label="Twitter Description"
              name="twitterDescription"
              placeholder="Enter Twitter description"
              textarea
            />
            <InputField
              label="Twitter Image URL"
              name="twitterImage"
              placeholder="Enter image URL"
            />
          </div>
        </section>

        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-red-700 px-5 py-3 text-sm font-medium text-white hover:bg-red-800"
        >
          <Save size={18} />
          Save SEO Settings
        </button>
      </form>
    </div>
  );
}