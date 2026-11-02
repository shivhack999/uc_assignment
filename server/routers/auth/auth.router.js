const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/auth.controller');
const { tokenVerification } = require("../../middlewares/tokenVerifyWithRole");
const {
    signin,
    logout,

} = authController;


router.post("/signin", signin);
router.post("/logout", logout);

module.exports = router;
