
const prisma = require("../../config/prisma.client");
const asyncHandler = require("../../middlewares/error/asyncHandler");
const AppError = require("../../utils/error/AppError");

// COMMON HELPERS


const validateId = (id) => {
    if (!id || typeof id !== "string" || !id.trim()) {
        throw new AppError("Valid ID is required", 400);
    }
};

const validateString = (value, field, required = false) => {
    if (required && (typeof value !== "string" || !value.trim())) {
        throw new AppError(`${field} is required`, 400);
    }

    if (value !== undefined && value !== null && typeof value !== "string") {
        throw new AppError(`${field} must be a string`, 400);
    }
};

const validateBoolean = (value, field) => {
    if (value !== undefined && typeof value !== "boolean") {
        throw new AppError(`${field} must be a boolean`, 400);
    }
};

const validateNumber = (value, field, min = 0) => {
    if (
        value !== undefined &&
        (!Number.isInteger(value) || value < min)
    ) {
        throw new AppError(`${field} must be an integer greater than or equal to ${min}`, 400);
    }
};

const validateReorderItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new AppError("Items must be a non-empty array", 400);
    }

    const ids = items.map((item) => item.id);

    if (
        items.some(
            (item) =>
                !item ||
                typeof item.id !== "string" ||
                !item.id.trim()
        )
    ) {
        throw new AppError("Every item must contain a valid ID", 400);
    }

    if (new Set(ids).size !== ids.length) {
        throw new AppError("Duplicate IDs are not allowed", 400);
    }
};

const reorderRecords = async (model, items) => {
    validateReorderItems(items);

    await prisma.$transaction(async (tx) => {
        const ids = items.map((item) => item.id);

        const existingRecords = await tx[model].findMany({
            where: {
                id: {
                    in: ids,
                },
            },
            select: {
                id: true,
            },
        });

        if (existingRecords.length !== ids.length) {
            throw new AppError("One or more records were not found", 404);
        }

        await Promise.all(
            items.map((item, index) =>
                tx[model].update({
                    where: {
                        id: item.id,
                    },
                    data: {
                        sortOrder: index + 1,
                    },
                })
            )
        );
    });
};


// HERO AND ABOUT US
const getHomepageSections = asyncHandler(async (req, res) => {
    const sections = await prisma.homepage_sections.findMany({
        orderBy: {
            sectionType: "asc",
        },
    });

    res.status(200).json({
        success: true,
        data: sections,
        message: "Homepage sections fetched successfully",
    });
});

const updateHomepageSections = asyncHandler(async (req, res) => {
    console.log("Body :-", req.body);
    const { sections } = req.body;

    if (!Array.isArray(sections) || sections.length === 0) {
        throw new AppError("Sections array is required", 400);
    }

    const allowedTypes = ["HERO", "ABOUT"];
    const submittedTypes = sections.map((item) => item.sectionType);

    if (sections.some((item) => !allowedTypes.includes(item.sectionType))) {
        throw new AppError("Invalid section type. Allowed types: HERO, ABOUT", 400);
    }

    if (new Set(submittedTypes).size !== submittedTypes.length) {
        throw new AppError("Duplicate section types are not allowed", 400);
    }

    const updatedSections = await prisma.$transaction(
        sections.map((section) => {
            validateString(section.title, "Title", true);
            validateString(section.subtitle, "Subtitle");
            validateString(section.description, "Description");
            validateString(section.image, "Image");
            validateString(section.buttonText, "Button text");
            validateString(section.buttonUrl, "Button URL");
            validateBoolean(section.isActive, "isActive");

            const data = {
                title: section.title.trim(),
            };

            [
                "subtitle",
                "description",
                "image",
                "buttonText",
                "buttonUrl",
                "isActive",
            ].forEach((field) => {
                if (section[field] !== undefined) {
                    data[field] = section[field];
                }
            });

            return prisma.homepage_sections.upsert({
                where: {
                    sectionType: section.sectionType,
                },
                update: data,
                create: {
                    sectionType: section.sectionType,
                    ...data,
                },
            });
        })
    );

    res.status(200).json({
        success: true,
        data: updatedSections,
        message: "Homepage sections updated successfully",
    });
});

// VEHICLES
const createVehicle = asyncHandler(async (req, res) => {
    const {
        name,
        slug,
        image,
        seatingCapacity,
        description,
        features,
        sortOrder,
        isActive,
    } = req.body;

    validateString(name, "Vehicle name", true);
    validateString(slug, "Slug", true);
    validateString(image, "Image");
    validateString(description, "Description");
    validateNumber(seatingCapacity, "Seating capacity", 1);
    validateNumber(sortOrder, "Sort order");
    validateBoolean(isActive, "isActive");

    const vehicle = await prisma.vehicle.create({
        data: {
            name: name.trim(),
            slug: slug.trim(),
            image: image ?? null,
            seatingCapacity,
            description: description ?? null,
            features: features ?? undefined,
            sortOrder: sortOrder ?? 0,
            isActive: isActive ?? true,
        },
    });

    res.status(201).json({
        success: true,
        data: vehicle,
        message: "Vehicle created successfully",
    });
});

const getVehicles = asyncHandler(async (req, res) => {
    const { isActive } = req.query;

    const where = {};

    if (isActive !== undefined) {
        if (!["true", "false"].includes(isActive)) {
            throw new AppError("isActive must be true or false", 400);
        }

        where.isActive = isActive === "true";
    }

    const vehicles = await prisma.vehicle.findMany({
        where,
        orderBy: [
            { sortOrder: "asc" },
            { createdAt: "desc" },
        ],
    });

    res.status(200).json({
        success: true,
        data: vehicles,
        message: "Vehicles fetched successfully",
    });
});

const getVehicleById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);

    const vehicle = await prisma.vehicle.findUnique({
        where: { id },
    });

    if (!vehicle) {
        throw new AppError("Vehicle not found", 404);
    }

    res.status(200).json({
        success: true,
        data: vehicle,
        message: "Vehicle fetched successfully",
    });
});

const updateVehicle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);

    const {
        name,
        slug,
        image,
        seatingCapacity,
        description,
        features,
        sortOrder,
        isActive,
    } = req.body;

    const data = {};

    if (name !== undefined) {
        validateString(name, "Vehicle name", true);
        data.name = name.trim();
    }

    if (slug !== undefined) {
        validateString(slug, "Slug", true);
        data.slug = slug.trim();
    }

    if (image !== undefined) {
        validateString(image, "Image");
        data.image = image;
    }

    if (seatingCapacity !== undefined) {
        validateNumber(seatingCapacity, "Seating capacity", 1);
        data.seatingCapacity = seatingCapacity;
    }

    if (description !== undefined) {
        validateString(description, "Description");
        data.description = description;
    }

    if (features !== undefined) {
        data.features = features;
    }

    if (sortOrder !== undefined) {
        validateNumber(sortOrder, "Sort order");
        data.sortOrder = sortOrder;
    }

    if (isActive !== undefined) {
        validateBoolean(isActive, "isActive");
        data.isActive = isActive;
    }

    if (Object.keys(data).length === 0) {
        throw new AppError("At least one field is required to update", 400);
    }

    const existing = await prisma.vehicle.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new AppError("Vehicle not found", 404);
    }

    const vehicle = await prisma.vehicle.update({
        where: { id },
        data,
    });

    res.status(200).json({
        success: true,
        data: vehicle,
        message: "Vehicle updated successfully",
    });
});

const deleteVehicle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);

    const existing = await prisma.vehicle.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new AppError("Vehicle not found", 404);
    }

    await prisma.vehicle.delete({
        where: { id },
    });

    res.status(200).json({
        success: true,
        message: "Vehicle deleted successfully",
    });
});

const reorderVehicles = asyncHandler(async (req, res) => {
    const { items } = req.body;

    await reorderRecords("vehicle", items);

    res.status(200).json({
        success: true,
        message: "Vehicles reordered successfully",
    });
});

// OCCASIONS
const createOccasion = asyncHandler(async (req, res) => {
    const {
        title,
        slug,
        description,
        image,
        sortOrder,
        isActive,
    } = req.body;

    validateString(title, "Title", true);
    validateString(slug, "Slug", true);
    validateString(description, "Description");
    validateString(image, "Image");
    validateNumber(sortOrder, "Sort order");
    validateBoolean(isActive, "isActive");

    const occasion = await prisma.occasion.create({
        data: {
            title: title.trim(),
            slug: slug.trim(),
            description: description ?? null,
            image: image ?? null,
            sortOrder: sortOrder ?? 0,
            isActive: isActive ?? true,
        },
    });

    res.status(201).json({
        success: true,
        data: occasion,
        message: "Occasion created successfully",
    });
});

const getOccasions = asyncHandler(async (req, res) => {
    const { isActive } = req.query;
    const where = {};

    if (isActive !== undefined) {
        if (!["true", "false"].includes(isActive)) {
            throw new AppError("isActive must be true or false", 400);
        }

        where.isActive = isActive === "true";
    }

    const occasions = await prisma.occasion.findMany({
        where,
        orderBy: [
            { sortOrder: "asc" },
            { createdAt: "desc" },
        ],
    });

    res.status(200).json({
        success: true,
        data: occasions,
        message: "Occasions fetched successfully",
    });
});

const getOccasionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);

    const occasion = await prisma.occasion.findUnique({
        where: { id },
    });

    if (!occasion) {
        throw new AppError("Occasion not found", 404);
    }

    res.status(200).json({
        success: true,
        data: occasion,
        message: "Occasion fetched successfully",
    });
});

const updateOccasion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);

    const {
        title,
        slug,
        description,
        image,
        sortOrder,
        isActive,
    } = req.body;

    const data = {};

    if (title !== undefined) {
        validateString(title, "Title", true);
        data.title = title.trim();
    }

    if (slug !== undefined) {
        validateString(slug, "Slug", true);
        data.slug = slug.trim();
    }

    if (description !== undefined) {
        validateString(description, "Description");
        data.description = description;
    }

    if (image !== undefined) {
        validateString(image, "Image");
        data.image = image;
    }

    if (sortOrder !== undefined) {
        validateNumber(sortOrder, "Sort order");
        data.sortOrder = sortOrder;
    }

    if (isActive !== undefined) {
        validateBoolean(isActive, "isActive");
        data.isActive = isActive;
    }

    if (Object.keys(data).length === 0) {
        throw new AppError("At least one field is required to update", 400);
    }

    const existing = await prisma.occasion.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new AppError("Occasion not found", 404);
    }

    const occasion = await prisma.occasion.update({
        where: { id },
        data,
    });

    res.status(200).json({
        success: true,
        data: occasion,
        message: "Occasion updated successfully",
    });
});

const deleteOccasion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);

    const existing = await prisma.occasion.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new AppError("Occasion not found", 404);
    }

    await prisma.occasion.delete({
        where: { id },
    });

    res.status(200).json({
        success: true,
        message: "Occasion deleted successfully",
    });
});

const reorderOccasions = asyncHandler(async (req, res) => {
    const { items } = req.body;

    await reorderRecords("occasion", items);

    res.status(200).json({
        success: true,
        message: "Occasions reordered successfully",
    });
});


// TESTIMONIALS
const createTestimonial = asyncHandler(async (req, res) => {
    const {
        customerName,
        review,
        rating,
        customerImage,
        sortOrder,
        isActive,
    } = req.body;

    validateString(customerName, "Customer name", true);
    validateString(review, "Review", true);
    validateString(customerImage, "Customer image");
    validateNumber(rating, "Rating", 1);
    validateNumber(sortOrder, "Sort order");
    validateBoolean(isActive, "isActive");

    if (rating > 5) {
        throw new AppError("Rating must be between 1 and 5", 400);
    }

    const testimonial = await prisma.testimonial.create({
        data: {
            customerName: customerName.trim(),
            review: review.trim(),
            rating,
            customerImage: customerImage ?? null,
            sortOrder: sortOrder ?? 0,
            isActive: isActive ?? true,
        },
    });

    res.status(201).json({
        success: true,
        data: testimonial,
        message: "Testimonial created successfully",
    });
});

const getTestimonials = asyncHandler(async (req, res) => {
    const { isActive } = req.query;
    const where = {};

    if (isActive !== undefined) {
        if (!["true", "false"].includes(isActive)) {
            throw new AppError("isActive must be true or false", 400);
        }

        where.isActive = isActive === "true";
    }

    const testimonials = await prisma.testimonial.findMany({
        where,
        orderBy: [
            { sortOrder: "asc" },
            { createdAt: "desc" },
        ],
    });

    res.status(200).json({
        success: true,
        data: testimonials,
        message: "Testimonials fetched successfully",
    });
});

const getTestimonialById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);

    const testimonial = await prisma.testimonial.findUnique({
        where: { id },
    });

    if (!testimonial) {
        throw new AppError("Testimonial not found", 404);
    }

    res.status(200).json({
        success: true,
        data: testimonial,
        message: "Testimonial fetched successfully",
    });
});

const updateTestimonial = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);

    const {
        customerName,
        review,
        rating,
        customerImage,
        sortOrder,
        isActive,
    } = req.body;

    const data = {};

    if (customerName !== undefined) {
        validateString(customerName, "Customer name", true);
        data.customerName = customerName.trim();
    }

    if (review !== undefined) {
        validateString(review, "Review", true);
        data.review = review.trim();
    }

    if (rating !== undefined) {
        validateNumber(rating, "Rating", 1);

        if (rating > 5) {
            throw new AppError("Rating must be between 1 and 5", 400);
        }

        data.rating = rating;
    }

    if (customerImage !== undefined) {
        validateString(customerImage, "Customer image");
        data.customerImage = customerImage;
    }

    if (sortOrder !== undefined) {
        validateNumber(sortOrder, "Sort order");
        data.sortOrder = sortOrder;
    }

    if (isActive !== undefined) {
        validateBoolean(isActive, "isActive");
        data.isActive = isActive;
    }

    if (Object.keys(data).length === 0) {
        throw new AppError("At least one field is required to update", 400);
    }

    const existing = await prisma.testimonial.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new AppError("Testimonial not found", 404);
    }

    const testimonial = await prisma.testimonial.update({
        where: { id },
        data,
    });

    res.status(200).json({
        success: true,
        data: testimonial,
        message: "Testimonial updated successfully",
    });
});

const deleteTestimonial = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);

    const existing = await prisma.testimonial.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new AppError("Testimonial not found", 404);
    }

    await prisma.testimonial.delete({
        where: { id },
    });

    res.status(200).json({
        success: true,
        message: "Testimonial deleted successfully",
    });
});

const createGalleryImage = asyncHandler(async (req, res) => {
    const {
        image,
        altText,
        sortOrder,
        isActive,
    } = req.body;

    validateString(image, "Image path", true);
    validateString(altText, "Alt text");
    validateNumber(sortOrder, "Sort order");
    validateBoolean(isActive, "isActive");

    const galleryImage = await prisma.gallery.create({
        data: {
            image: image.trim(),
            altText: altText ?? null,
            sortOrder: sortOrder ?? 0,
            isActive: isActive ?? true,
        },
    });

    res.status(201).json({
        success: true,
        data: galleryImage,
        message: "Gallery image added successfully",
    });
});

const getGallery = asyncHandler(async (req, res) => {
    const { isActive } = req.query;
    const where = {};

    if (isActive !== undefined) {
        if (!["true", "false"].includes(isActive)) {
            throw new AppError("isActive must be true or false", 400);
        }

        where.isActive = isActive === "true";
    }

    const gallery = await prisma.gallery.findMany({
        where,
        orderBy: [
            { sortOrder: "asc" },
            { createdAt: "desc" },
        ],
    });

    res.status(200).json({
        success: true,
        data: gallery,
        message: "Gallery fetched successfully",
    });
});

const updateGalleryAltText = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { altText } = req.body;

    validateId(id);
    validateString(altText, "Alt text");

    if (altText === undefined) {
        throw new AppError("Alt text is required", 400);
    }

    const existing = await prisma.gallery.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new AppError("Gallery image not found", 404);
    }

    const galleryImage = await prisma.gallery.update({
        where: { id },
        data: {
            altText,
        },
    });

    res.status(200).json({
        success: true,
        data: galleryImage,
        message: "Gallery alt text updated successfully",
    });
});

const deleteGalleryImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);

    const existing = await prisma.gallery.findUnique({
        where: { id },
    });

    if (!existing) {
        throw new AppError("Gallery image not found", 404);
    }

    // Only the gallery database record is deleted.
    // Physical file deletion is managed by your common upload API.
    await prisma.gallery.delete({
        where: { id },
    });

    res.status(200).json({
        success: true,
        message: "Gallery image deleted successfully",
    });
});

const reorderGallery = asyncHandler(async (req, res) => {
    const { items } = req.body;

    await reorderRecords("gallery", items);

    res.status(200).json({
        success: true,
        message: "Gallery reordered successfully",
    });
});

// CONTACT INFORMATION
const getContactInformation = asyncHandler(async (req, res) => {
    const contact = await prisma.contact_information.findUnique({
        where: {
            settingKey: "GLOBAL",
        },
    });

    res.status(200).json({
        success: true,
        data: contact,
        message: "Contact information fetched successfully",
    });
});

const updateContactInformation = asyncHandler(async (req, res) => {
    const {
        phone,
        email,
        address,
        googleMapEmbed,
    } = req.body;

    const data = {};

    if (phone !== undefined) {
        validateString(phone, "Phone");
        data.phone = phone;
    }

    if (email !== undefined) {
        validateString(email, "Email");
        data.email = email;
    }

    if (address !== undefined) {
        validateString(address, "Address");
        data.address = address;
    }

    if (googleMapEmbed !== undefined) {
        validateString(googleMapEmbed, "Google map embed");
        data.googleMapEmbed = googleMapEmbed;
    }

    if (Object.keys(data).length === 0) {
        throw new AppError("At least one field is required to update", 400);
    }

    const contact = await prisma.contact_information.upsert({
        where: {
            settingKey: "GLOBAL",
        },
        update: data,
        create: {
            settingKey: "GLOBAL",
            ...data,
        },
    });

    res.status(200).json({
        success: true,
        data: contact,
        message: "Contact information updated successfully",
    });
});


module.exports = {
    updateContactInformation,
    getContactInformation,
    reorderGallery,
    deleteGalleryImage,
    updateGalleryAltText,
    getGallery,
    createGalleryImage,
    deleteTestimonial,
    updateTestimonial,
    getTestimonialById,
    getTestimonials,
    createTestimonial,
    reorderOccasions,
    deleteOccasion,
    updateOccasion, 
    getOccasionById,
    getOccasions,
    createOccasion,
    reorderVehicles,
    deleteVehicle,
    updateVehicle,
    getVehicleById,
    getVehicles,
    createVehicle,
    updateHomepageSections,
    getHomepageSections,

}
