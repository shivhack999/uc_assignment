import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const user = await login(form);

            if (user.role !== "ADMIN") {
                toast.error("Administrator access required.");
                return;
            }

            toast.success("Login successful");
            navigate("/admin", { replace: true });
        } catch (error) {
            toast.error(
                error.response?.data?.message || error.message || "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#a20000] text-white">
                        <LockKeyhole size={26} />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900">
                        Admin Login
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Sign in to manage your website
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Email address
                        </label>
                        <div className="flex items-center gap-3 rounded-lg border px-3">
                            <Mail size={18} className="text-gray-400" />
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                placeholder="admin@example.com"
                                className="w-full py-3 text-sm outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Password
                        </label>
                        <div className="flex items-center gap-3 rounded-lg border px-3">
                            <LockKeyhole size={18} className="text-gray-400" />
                            <input
                                type="password"
                                required
                                value={form.password}
                                onChange={(e) =>
                                    setForm({ ...form, password: e.target.value })
                                }
                                placeholder="Enter password"
                                className="w-full py-3 text-sm outline-none"
                            />
                        </div>
                    </div>

                    <Button type="submit" loading={loading} className="w-full">
                        Sign In
                    </Button>
                </form>
            </div>
        </div>
    );
}