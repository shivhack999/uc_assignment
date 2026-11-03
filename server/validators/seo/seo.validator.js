const { body, validationResult } = require("express-validator");

const validateSEO = [
  // Meta Title
  body("metaTitle")
    .trim()
    .notEmpty()
    .withMessage("Meta title is required")
    .isLength({ min: 10, max: 60 })
    .withMessage("Meta title must be between 10 and 60 characters"),

  // Meta Description
  body("metaDescription")
    .trim()
    .notEmpty()
    .withMessage("Meta description is required")
    .isLength({ min: 50, max: 160 })
    .withMessage("Meta description must be between 50 and 160 characters"),

  // Canonical URL
  body("canonicalUrl")
    .optional({ values: "null" })
    .trim()
    .isURL({ require_protocol: true })
    .withMessage("Please provide a valid canonical URL"),

  // Robots Configuration
  body("index")
    .notEmpty()
    .withMessage("Index configuration is required")
    .isBoolean()
    .withMessage("Index must be a boolean"),

  body("follow")
    .notEmpty()
    .withMessage("Follow configuration is required")
    .isBoolean()
    .withMessage("Follow must be a boolean"),

  // Open Graph
  body("ogTitle")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 255 })
    .withMessage("OG title cannot exceed 255 characters"),

  body("ogDescription")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 160 })
    .withMessage("OG description cannot exceed 160 characters"),

  body("ogImage")
    .trim()
    .notEmpty()
    .withMessage("Please provide a valid OG image URL"),

  body("ogType")
    .optional({ values: "null" })
    .isIn(["website", "article"])
    .withMessage("OG type must be website or article"),

  // Twitter Card
  body("twitterCard")
    .optional({ values: "null" })
    .isIn(["summary", "summary_large_image"])
    .withMessage("Invalid Twitter card type"),

  body("twitterTitle")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Twitter title cannot exceed 255 characters"),

  body("twitterDescription")
    .optional({ values: "null" })
    .trim()
    .isLength({ max: 200 })
    .withMessage("Twitter description cannot exceed 200 characters"),

  body("twitterImage")
    .trim()
    .notEmpty()
    .withMessage("Please provide a valid Twitter image URL"),

  // Validation Error Handler
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: "SEO validation failed",
        errors: errors.array().map((error) => ({
          field: error.path,
          message: error.msg,
        })),
      });
    }

    next();
  },
];

module.exports = { validateSEO };