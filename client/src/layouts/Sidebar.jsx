
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Search,
    FileCode,
    Image,
    CarFront,
    CalendarDays,
    MessageSquareQuote,
    Images,
    Phone,
    PanelTop,
    Info,
    X,
    Globe,
} from "lucide-react";

const groups = [
    {
        title: "OVERVIEW",
        links: [
            { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
        ],
    },
    {
        title: "WEBSITE CONTENT",
        links: [
            { label: "Hero Section", path: "/admin/homepage/hero", icon: PanelTop },
            { label: "About Section", path: "/admin/homepage/about", icon: Info },
            { label: "Vehicles", path: "/admin/vehicles", icon: CarFront },
            { label: "Occasions", path: "/admin/occasions", icon: CalendarDays },
            { label: "Testimonials", path: "/admin/testimonials", icon: MessageSquareQuote },
            { label: "Gallery", path: "/admin/gallery", icon: Images },
            { label: "Contact", path: "/admin/contact", icon: Phone },
        ],
    },
    {
        title: "SEO & MEDIA",
        links: [
            { label: "SEO Settings", path: "/admin/seo", icon: Search },
            { label: "Schema Management", path: "/admin/seo/schema", icon: FileCode },
            { label: "Media Library", path: "/admin/media", icon: Image },
        ],
    },
];

export default function Sidebar({ open, onClose }) {
    return (
        <>
            {open && (
                <button
                    aria-label="Close navigation"
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#191919] text-white transition-transform lg:static lg:translate-x-0 ${
                open ? "translate-x-0" : "-translate-x-full"
            }`}>
                <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#a20000]">
                            <Globe size={21} />
                        </div>
                        <div>
                            <p className="font-bold tracking-wide">CMS PANEL</p>
                            <p className="text-xs text-gray-400">Website Management</p>
                        </div>
                    </div>
                    <button className="lg:hidden" onClick={onClose} aria-label="Close sidebar">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
                    {groups.map((group) => (
                        <div key={group.title}>
                            <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.18em] text-gray-500">
                                {group.title}
                            </p>

                            <div className="space-y-1">
                                {group.links.map(({ label, path, icon: Icon }) => (
                                    <NavLink
                                        key={path}
                                        to={path}
                                        end={path === "/admin"}
                                        onClick={onClose}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                                                isActive
                                                    ? "bg-[#a20000] font-semibold text-white"
                                                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                                            }`
                                        }
                                    >
                                        <Icon size={18} />
                                        {label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="border-t border-white/10 p-4">
                    <p className="text-xs text-gray-500">CMS Admin Panel</p>
                    <p className="mt-1 text-xs text-gray-400">Content Management System</p>
                </div>
            </aside>
        </>
    );
}
