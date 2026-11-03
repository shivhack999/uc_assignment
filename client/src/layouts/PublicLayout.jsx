import { Outlet, Link } from "react-router-dom";

export default function PublicLayout() {
    return (
        <div className="min-h-screen bg-white">
            <header className="flex h-20 items-center justify-between border-b px-6 lg:px-16">
                <Link to="/" className="text-xl font-bold text-[#a20000]">
                    YOUR BRAND
                </Link>

                <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
                    <a href="#about">About</a>
                    <a href="#vehicles">Vehicles</a>
                    <a href="#gallery">Gallery</a>
                    <a href="#contact">Contact</a>
                </nav>

                <a
                    href="#contact"
                    className="rounded-lg bg-[#a20000] px-5 py-3 text-sm font-semibold text-white"
                >
                    Contact Us
                </a>
            </header>

            <Outlet />

            <footer className="bg-[#191919] px-6 py-8 text-center text-sm text-gray-400">
                © {new Date().getFullYear()} Your Brand. All rights reserved.
            </footer>
        </div>
    );
}