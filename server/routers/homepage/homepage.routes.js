
const express = require("express");
const router = express.Router();

const homepageController = require("../../controllers/homepage/homepage.controller");

const { tokenVerification } = require("../../middlewares/tokenVerifyWithRole");
router.use(tokenVerification(["ADMIN"]));
router.get("/sections", homepageController.getHomepageSections);
router.put("/sections", homepageController.updateHomepageSections);

// VEHICLES
router.post("/vehicles", homepageController.createVehicle);
router.get("/vehicles", homepageController.getVehicles);


router.patch("/vehicles/reorder", homepageController.reorderVehicles);

router.get("/vehicles/:id", homepageController.getVehicleById);
router.put("/vehicles/:id", homepageController.updateVehicle);
router.delete("/vehicles/:id", homepageController.deleteVehicle);


// OCCASIONS
router.post("/occasions", homepageController.createOccasion);
router.get("/occasions", homepageController.getOccasions);

router.patch("/occasions/reorder", homepageController.reorderOccasions);

router.get("/occasions/:id", homepageController.getOccasionById);
router.put("/occasions/:id", homepageController.updateOccasion);
router.delete("/occasions/:id", homepageController.deleteOccasion);


// TESTIMONIALS
router.post("/testimonials", homepageController.createTestimonial);
router.get("/testimonials", homepageController.getTestimonials);
router.get("/testimonials/:id", homepageController.getTestimonialById);
router.put("/testimonials/:id", homepageController.updateTestimonial);
router.delete("/testimonials/:id", homepageController.deleteTestimonial);

// GALLERY
router.post("/gallery", homepageController.createGalleryImage);
router.get("/gallery", homepageController.getGallery);

router.patch("/gallery/reorder", homepageController.reorderGallery);
router.patch("/gallery/:id/alt", homepageController.updateGalleryAltText);
router.delete("/gallery/:id", homepageController.deleteGalleryImage);

// CONTACT INFORMATION
router.get("/contact", homepageController.getContactInformation);
router.put("/contact", homepageController.updateContactInformation);

module.exports = router;
