const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/auth.controller');
const { tokenVerification } = require("../../middlewares/tokenVerifyWithRole");
const { validateSEO } = require("../../validators/seo/seo.validator.js");
const {
    getSEO,
    updateSEO
} = require("../../controllers/seo/seo.controller");


router.get("/seo", getSEO);
router.put("/seo", tokenVerification(["ADMIN"]), validateSEO, updateSEO);


module.exports = router;