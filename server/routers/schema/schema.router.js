const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/auth.controller');
const { tokenVerification } = require("../../middlewares/tokenVerifyWithRole");

const {
  validateCreateSchema,
  validateUpdateSchema,
  validateSchemaId,
} = require("../../validators/schemas/schema.validator.js");

const {
  getAllSchemas,
  createSchema,
  getSchemaById,
  updateSchema,
  deleteSchema,
  getActiveSchemas,
} = require("../../controllers/schema/schema.controller.js");


// Public API
router.get("/active", getActiveSchemas);

// Admin APIs
router.get("/schema", tokenVerification(["ADMIN"]), getAllSchemas);
router.post("/schema", tokenVerification(["ADMIN"]), validateCreateSchema, createSchema);
router.get("/schema:id", tokenVerification(["ADMIN"]), validateSchemaId, getSchemaById);
router.put("/schema:id", tokenVerification(["ADMIN"]), validateUpdateSchema, updateSchema);
router.delete("/schema:id", tokenVerification(["ADMIN"]), validateSchemaId, deleteSchema);

module.exports = router;