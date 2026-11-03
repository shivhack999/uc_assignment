
import { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
  RefreshCw,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";
import homepageService from "../../services/homepage.service";

const initialFormData = {
  phone: "",
  email: "",
  address: "",
  googleMapEmbed: "",
};

const getContactData = (response) => {
  const data = response?.data?.data ?? response?.data ?? response;
  return data?.contact ?? data;
};

export default function Contact() {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchContact = async () => {
    try {
      setLoading(true);

      const response = await homepageService.getContact();
      const contact = getContactData(response);

      setFormData({
        phone: contact?.phone ?? "",
        email: contact?.email ?? "",
        address: contact?.address ?? "",
        googleMapEmbed: contact?.googleMapEmbed ?? "",
      });
    } catch (error) {
      console.error("Contact fetch error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to load contact information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(formData.email.trim())) {
        toast.error("Please enter a valid email address.");
        return;
      }
    }

    try {
      setSaving(true);

      const payload = {
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        googleMapEmbed: formData.googleMapEmbed.trim(),
      };

      await homepageService.updateContact(payload);

      toast.success("Contact information updated successfully.");
      await fetchContact();
    } catch (error) {
      console.error("Contact update error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to update contact information."
      );
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    {
      name: "phone",
      label: "Phone Number",
      icon: Phone,
      type: "tel",
      placeholder: "Enter phone number",
    },
    {
      name: "email",
      label: "Email Address",
      icon: Mail,
      type: "email",
      placeholder: "Enter email address",
    },
    {
      name: "address",
      label: "Office Address",
      icon: MapPin,
      type: "textarea",
      placeholder: "Enter office address",
    },
    {
      name: "googleMapEmbed",
      label: "Google Maps Embed URL",
      icon: MapPin,
      type: "textarea",
      placeholder: "Paste your Google Maps embed URL",
    },
  ];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Contact Information
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the contact details displayed on your website.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchContact}
          disabled={loading || saving}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Contact Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-red-700" size={32} />
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <h2 className="font-semibold text-gray-800">
                Website Contact Details
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Changes saved here will be used by the public Contact section.
              </p>
            </div>

            <div className="grid gap-5">
              {fields.map((field) => {
                const Icon = field.icon;

                return (
                  <div key={field.name}>
                    <label
                      htmlFor={field.name}
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      {field.label}
                    </label>

                    <div className="flex items-start gap-3 rounded-lg border border-gray-200 px-3 py-3 transition focus-within:border-red-600">
                      <Icon
                        size={18}
                        className="mt-1 shrink-0 text-gray-400"
                      />

                      {field.type === "textarea" ? (
                        <textarea
                          id={field.name}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          rows={3}
                          placeholder={field.placeholder}
                          className="w-full resize-y bg-transparent text-sm outline-none"
                        />
                      ) : (
                        <input
                          id={field.name}
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          className="w-full bg-transparent text-sm outline-none"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={fetchContact}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}

                {saving ? "Saving..." : "Save Contact Information"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
