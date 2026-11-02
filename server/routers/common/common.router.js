const express = require('express');
const router = express.Router();
const multerUpload = require("../../middlewares/multipleUpload.middleware");
const { tokenVerification } = require("../../middlewares/tokenVerifyWithRole");
const {
    uploadFile
} = require("../../controllers/common.controller");

router.post("/upload-file", multerUpload(`web`, [{ name: "file", maxCount: 1 }]), uploadFile);

module.exports = router;