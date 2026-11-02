
const { body, param, validationResult } = require("express-validator");

const schemaTypes = [
  "ORGANIZATION",
  "FAQ",
  "BREADCRUMB",
  "WEBSITE",
  "LOCAL_BUSINESS",
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Schema validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};

const validateSchemaId = [
  param("id")
    .isUUID()
    .withMessage("Invalid schema ID"),
  handleValidation,
];

const validateCreateSchema = [
  body("schemaType")
    .notEmpty()
    .withMessage("Schema type is required")
    .isIn(schemaTypes)
    .withMessage("Invalid schema type"),

  body("schemaData")
    .isObject()
    .withMessage("Schema data must be a JSON object")
    .custom((value) => {
      if (
        Object.hasOwn(value, "@context") ||
        Object.hasOwn(value, "@type") ||
        Object.hasOwn(value, "@graph")
      ) {
        throw new Error("Reserved JSON-LD properties are not allowed");
      }

      return true;
    }),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be boolean"),

  handleValidation,
];

const validateUpdateSchema = [
  ...validateSchemaId,

  body("schemaType")
    .optional()
    .isIn(schemaTypes)
    .withMessage("Invalid schema type"),

  body("schemaData")
    .optional()
    .isObject()
    .withMessage("Schema data must be a JSON object")
    .custom((value) => {
      if (
        Object.hasOwn(value, "@context") ||
        Object.hasOwn(value, "@type") ||
        Object.hasOwn(value, "@graph")
      ) {
        throw new Error("Reserved JSON-LD properties are not allowed");
      }

      return true;
    }),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be boolean"),

  handleValidation,
];

module.exports = {
  validateCreateSchema,
  validateUpdateSchema,
  validateSchemaId,
};
