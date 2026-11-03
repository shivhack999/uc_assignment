
const express = require("express");
const router = express.Router();

const homepageController = require("../../controllers/homepage/homepage.controller");

const { tokenVerification } = require("../../middlewares/tokenVerifyWithRole");
router.get("/sections", homepageController.getHomepageSections);
router.get("/vehicles", homepageController.getVehicles);
router.get("/vehicles/:id", homepageController.getVehicleById);
router.get("/occasions", homepageController.getOccasions);
router.get("/occasions/:id", homepageController.getOccasionById);
router.get("/testimonials", homepageController.getTestimonials);
router.get("/gallery", homepageController.getGallery);
router.get("/testimonials/:id", homepageController.getTestimonialById);
router.get("/contact", homepageController.getContactInformation);


router.use(tokenVerification(["ADMIN"]));
router.put("/sections", homepageController.updateHomepageSections);
// VEHICLES
router.post("/vehicles", homepageController.createVehicle);
router.patch("/vehicles/reorder", homepageController.reorderVehicles);
router.put("/vehicles/:id", homepageController.updateVehicle);
router.delete("/vehicles/:id", homepageController.deleteVehicle);

// OCCASIONS
router.post("/occasions", homepageController.createOccasion);
router.patch("/occasions/reorder", homepageController.reorderOccasions);
router.put("/occasions/:id", homepageController.updateOccasion);
router.delete("/occasions/:id", homepageController.deleteOccasion);

// TESTIMONIALS
router.post("/testimonials", homepageController.createTestimonial);
router.put("/testimonials/:id", homepageController.updateTestimonial);
router.delete("/testimonials/:id", homepageController.deleteTestimonial);

// GALLERY
router.post("/gallery", homepageController.createGalleryImage);

router.patch("/gallery/reorder", homepageController.reorderGallery);
router.patch("/gallery/:id/alt", homepageController.updateGalleryAltText);
router.delete("/gallery/:id", homepageController.deleteGalleryImage);

// CONTACT INFORMATION
router.put("/contact", homepageController.updateContactInformation);

module.exports = router;
