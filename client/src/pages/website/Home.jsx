import { useEffect, useState } from "react";
import homepageService from "../../services/homepage.service";

export default function Home() {
    const [sections, setSections] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [contact, setContact] = useState(null);

    useEffect(() => {
        const loadWebsite = async () => {
            try {
                const [sectionRes, vehicleRes, galleryRes, contactRes] =
                    await Promise.all([
                        homepageService.getSections(),
                        homepageService.getVehicles({ isActive: true }),
                        homepageService.getGallery({ isActive: true }),
                        homepageService.getContact(),
                    ]);

                setSections(sectionRes.data?.data || []);
                setVehicles(vehicleRes.data?.data || []);
                setGallery(galleryRes.data?.data || []);
                setContact(contactRes.data?.data || null);
            } catch (error) {
                console.error("Website content loading error:", error);
            }
        };

        loadWebsite();
    }, []);

    const hero = sections.find((item) => item.sectionType === "HERO");
    const about = sections.find((item) => item.sectionType === "ABOUT");

    return (
        <main>
            {hero?.isActive && (
                <section className="relative flex min-h-[520px] items-center bg-gray-900">
                    {hero.image && (
                        <img
                            src={hero.image}
                            alt={hero.title}
                            className="absolute inset-0 h-full w-full object-cover opacity-50"
                        />
                    )}

                    <div className="relative mx-auto w-full max-w-7xl px-6 py-24 text-white">
                        <h1 className="max-w-3xl text-4xl font-bold md:text-6xl">
                            {hero.title}
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg text-gray-200">
                            {hero.subtitle || hero.description}
                        </p>

                        {hero.buttonText && (
                            <a
                                href={hero.buttonUrl || "#contact"}
                                className="mt-8 inline-block rounded-lg bg-[#a20000] px-7 py-3 font-semibold text-white"
                            >
                                {hero.buttonText}
                            </a>
                        )}
                    </div>
                </section>
            )}

            {about?.isActive && (
                <section id="about" className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2">
                    {about.image && (
                        <img
                            src={about.image}
                            alt={about.title}
                            className="h-80 w-full rounded-2xl object-cover"
                        />
                    )}
                    <div className="self-center">
                        <p className="font-semibold uppercase tracking-widest text-[#a20000]">
                            About Us
                        </p>
                        <h2 className="mt-3 text-3xl font-bold">
                            {about.title}
                        </h2>
                        <p className="mt-4 text-gray-600">
                            {about.description}
                        </p>
                    </div>
                </section>
            )}

            <section id="vehicles" className="bg-gray-50 px-6 py-20">
                <div className="mx-auto max-w-7xl">
                    <h2 className="mb-8 text-3xl font-bold">Our Vehicles</h2>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {vehicles.map((vehicle) => (
                            <article key={vehicle.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
                                {vehicle.image && (
                                    <img
                                        src={vehicle.image}
                                        alt={vehicle.name}
                                        className="h-56 w-full object-cover"
                                    />
                                )}
                                <div className="p-5">
                                    <h3 className="text-lg font-bold">{vehicle.name}</h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        {vehicle.seatingCapacity} seats
                                    </p>
                                    <p className="mt-3 text-sm text-gray-600">
                                        {vehicle.description}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="gallery" className="mx-auto max-w-7xl px-6 py-20">
                <h2 className="mb-8 text-3xl font-bold">Gallery</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {gallery.map((item) => (
                        <img
                            key={item.id}
                            src={item.image}
                            alt={item.altText || ""}
                            className="h-52 w-full rounded-xl object-cover"
                        />
                    ))}
                </div>
            </section>

            <section id="contact" className="bg-gray-50 px-6 py-20">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-3xl font-bold">Contact Us</h2>
                    {contact && (
                        <div className="mt-6 space-y-3 text-gray-600">
                            <p>{contact.phone}</p>
                            <p>{contact.email}</p>
                            <p>{contact.address}</p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}