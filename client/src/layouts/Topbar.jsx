
import { Menu, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ onMenuClick }) {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
            <button
                onClick={onMenuClick}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                aria-label="Open menu"
            >
                <Menu size={22} />
            </button>

            <div className="hidden text-sm text-gray-500 sm:block">
                Admin / <span className="font-semibold text-gray-900">Management</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
                <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold text-gray-900">
                        {user?.name || "Administrator"}
                    </p>
                    <p className="text-xs text-gray-500">
                        {user?.role || "ADMIN"}
                    </p>
                </div>

                <UserCircle size={32} className="text-gray-500" />

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                    <LogOut size={17} />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
}
