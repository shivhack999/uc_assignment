const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/auth.controller');
const { tokenVerification } = require("../../middlewares/tokenVerifyWithRole");
const {
    signin,
    logout,
    profile,
    refresh
} = authController;


router.post("/login", signin);
router.post("/logout", logout);
router.post("/refresh", refresh);

// These routes require a valid access token
router.get("/profile", tokenVerification, profile);
module.exports = router;
