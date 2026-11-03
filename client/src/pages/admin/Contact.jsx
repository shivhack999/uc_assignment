import { useState } from "react";
import { Mail, Phone, MapPin, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    address: "",
    googleMapEmbed: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // API integration will be added here.
    toast.success("Contact form UI is ready. API integration pending.");
  };

  const fields = [
    { name: "phone", label: "Phone Number", icon: Phone, type: "text" },
    { name: "email", label: "Email Address", icon: Mail, type: "email" },
    { name: "address", label: "Office Address", icon: MapPin, type: "textarea" },
    {
      name: "googleMapEmbed",
      label: "Google Maps Embed URL",
      icon: MapPin,
      type: "textarea",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Contact Information
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your website contact details.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5">
          {fields.map((field) => {
            const Icon = field.icon;

            return (
              <div key={field.name}>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {field.label}
                </label>

                <div className="flex items-start gap-3 rounded-lg border border-gray-200 px-3 py-3 focus-within:border-red-600">
                  <Icon size={18} className="mt-1 text-gray-400" />

                  {field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      rows={3}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full resize-y outline-none"
                    />
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full outline-none"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          className="mt-6 flex items-center gap-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800"
        >
          <Save size={18} />
          Save Contact Information
        </button>
      </form>
    </div>
  );
}