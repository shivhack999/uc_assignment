
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

import AdminLayout from "../layouts/AdminLayout";
import PublicLayout from "../layouts/PublicLayout";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/admin/Dashboard";
import Hero from "../pages/admin/homepage/Hero"
import About from "../pages/admin/homepage/About";
import Vehicles from "../pages/admin/Vehicles";
import Occasions from "../pages/admin/Occasions";
import Testimonials from "../pages/admin/Testimonials";
import Gallery from "../pages/admin/Gallery";
import Contact from "../pages/admin/Contact";
import MediaLibrary from "../pages/admin/MediaLibrary";
import SEOSettings from "../pages/admin/SEO/SEOSettings";
import SchemaManagement from "../pages/admin/SEO/SchemaManagement";
import Home from "../pages/website/Home";

function ProtectedRoute() {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) return <Loader text="Verifying your session..." />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    // if (user?.role !== "ADMIN") return <Navigate to="/login" replace />;

    return <Outlet />;
}

function GuestRoute() {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) return <Loader />;
    console.log("GuestRoute - isAuthenticated:", isAuthenticated, "user:", user);
    if (isAuthenticated && user?.role === "ADMIN") {
        return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
}

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<GuestRoute />}>
                <Route path="/login" element={<Login />} />
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="homepage/hero" element={<Hero />} />
                    <Route path="homepage/about" element={<About />} />
                    <Route path="vehicles" element={<Vehicles />} />
                    <Route path="occasions" element={<Occasions />} />
                    <Route path="testimonials" element={<Testimonials />} />
                    <Route path="gallery" element={<Gallery />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="media" element={<MediaLibrary />} />
                    <Route path="seo" element={<SEOSettings />} />
                    <Route path="seo/schema" element={<SchemaManagement />} />
                </Route>
            </Route>

            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
