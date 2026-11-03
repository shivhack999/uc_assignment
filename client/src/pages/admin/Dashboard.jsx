import { useEffect, useState } from "react";
import {
    CarFront,
    CalendarDays,
    MessageSquareQuote,
    Images,
    Image,
    ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import Loader from "../../components/common/Loader";
import homepageService from "../../services/homepage.service";
import mediaService from "../../services/media.service";

export default function Dashboard() {
    const [stats, setStats] = useState([]);
    const [recentMedia, setRecentMedia] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [
                    vehicles,
                    occasions,
                    testimonials,
                    gallery,
                    media,
                ] = await Promise.all([
                    homepageService.getVehicles(),
                    homepageService.getOccasions(),
                    homepageService.getTestimonials(),
                    homepageService.getGallery(),
                    mediaService.getAll({ page: 1, limit: 5 }),
                ]);

                const getItems = (response) => response.data?.data || [];

                setStats([
                    {
                        title: "Vehicles",
                        count: getItems(vehicles).length,
                        icon: CarFront,
                        link: "/admin/vehicles",
                    },
                    {
                        title: "Occasions",
                        count: getItems(occasions).length,
                        icon: CalendarDays,
                        link: "/admin/occasions",
                    },
                    {
                        title: "Testimonials",
                        count: getItems(testimonials).length,
                        icon: MessageSquareQuote,
                        link: "/admin/testimonials",
                    },
                    {
                        title: "Gallery Images",
                        count: getItems(gallery).length,
                        icon: Images,
                        link: "/admin/gallery",
                    },
                ]);

                setRecentMedia(getItems(media));
            } catch (error) {
                console.error("Dashboard loading error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) return <Loader text="Loading dashboard..." />;

    return (
        <div>
            <PageHeader
                title="Dashboard"
                description="Overview of your website content and media."
            />

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.title}
                            to={item.link}
                            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <div className="rounded-xl bg-red-50 p-3 text-[#a20000]">
                                    <Icon size={23} />
                                </div>
                                <ArrowUpRight size={18} className="text-gray-400" />
                            </div>

                            <p className="mt-5 text-sm text-gray-500">
                                {item.title}
                            </p>
                            <h2 className="mt-1 text-3xl font-bold text-gray-900">
                                {item.count}
                            </h2>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="font-bold text-gray-900">Recent Media</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Recently uploaded images
                        </p>
                    </div>

                    <Link
                        to="/admin/media"
                        className="text-sm font-semibold text-[#a20000]"
                    >
                        View all
                    </Link>
                </div>

                {recentMedia.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-500">
                        <Image className="mx-auto mb-2" size={30} />
                        No media uploaded yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                        {recentMedia.map((item) => (
                            <div key={item.id} className="overflow-hidden rounded-lg border">
                                <img
                                    src={item.fileUrl || item.filePath}
                                    alt={item.originalName}
                                    className="h-32 w-full object-cover"
                                />
                                <p className="truncate p-2 text-xs text-gray-600">
                                    {item.originalName}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}