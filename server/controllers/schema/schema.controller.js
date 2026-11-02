
const prisma = require("../../config/prisma.client");
const asyncHandler = require("../../middlewares/error/asyncHandler");
const AppError = require("../../utils/error/AppError");

const allowedSchemaTypes = [
  "ORGANIZATION",
  "FAQ",
  "BREADCRUMB",
  "WEBSITE",
  "LOCAL_BUSINESS",
];

// ========================================
// GENERATE JSON-LD
// ========================================
const generateJsonLD = (schema) => {
  return {
    "@context": "https://schema.org",
    "@type": schema.schemaType === "FAQ"
      ? "FAQPage"
      : schema.schemaType === "BREADCRUMB"
      ? "BreadcrumbList"
      : schema.schemaType === "LOCAL_BUSINESS"
      ? "LocalBusiness"
      : schema.schemaType === "ORGANIZATION"
      ? "Organization"
      : "WebSite",
    ...schema.schemaData,
  };
};

// ========================================
// GET ALL SCHEMAS
// ========================================
const getAllSchemas = asyncHandler(async (req, res) => {
  const schemas = await prisma.seo_schemas.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({
    success: true,
    message: "Schemas fetched successfully",
    count: schemas.length,
    data: schemas.map((schema) => ({
      ...schema,
      jsonLD: generateJsonLD(schema),
    })),
  });
});

// ========================================
// CREATE SCHEMA
// ========================================
const createSchema = asyncHandler(async (req, res) => {
  const { schemaType, schemaData, isActive = true } = req.body;

  if (!allowedSchemaTypes.includes(schemaType)) {
    throw new AppError("Invalid schema type", 400);
  }

  if (
    !schemaData ||
    typeof schemaData !== "object" ||
    Array.isArray(schemaData)
  ) {
    throw new AppError("Schema data must be a valid JSON object", 400);
  }

  if (
    Object.hasOwn(schemaData, "@context") ||
    Object.hasOwn(schemaData, "@type") ||
    Object.hasOwn(schemaData, "@graph")
  ) {
    throw new AppError(
      "JSON-LD reserved properties are managed by the backend",
      400
    );
  }

  const existingSchema = await prisma.seo_schemas.findUnique({
    where: { schemaType },
  });

  if (existingSchema) {
    throw new AppError(
      `${schemaType} schema already exists. Please update it instead.`,
      409
    );
  }

  const schema = await prisma.seo_schemas.create({
    data: {
      schemaType,
      schemaData,
      isActive,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Schema created successfully",
    data: {
      ...schema,
      jsonLD: generateJsonLD(schema),
    },
  });
});

// ========================================
// GET SINGLE SCHEMA
// ========================================
const getSchemaById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const schema = await prisma.seo_schemas.findUnique({
    where: { id },
  });

  if (!schema) {
    throw new AppError("Schema not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Schema fetched successfully",
    data: {
      ...schema,
      jsonLD: generateJsonLD(schema),
    },
  });
});

// ========================================
// UPDATE SCHEMA
// ========================================
const updateSchema = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { schemaType, schemaData, isActive } = req.body;

  const existingSchema = await prisma.seo_schemas.findUnique({
    where: { id },
  });

  if (!existingSchema) {
    throw new AppError("Schema not found", 404);
  }

  if (
    schemaType !== undefined &&
    !allowedSchemaTypes.includes(schemaType)
  ) {
    throw new AppError("Invalid schema type", 400);
  }

  if (
    schemaData !== undefined &&
    (
      !schemaData ||
      typeof schemaData !== "object" ||
      Array.isArray(schemaData)
    )
  ) {
    throw new AppError("Schema data must be a valid JSON object", 400);
  }

  if (
    schemaData &&
    (
      Object.hasOwn(schemaData, "@context") ||
      Object.hasOwn(schemaData, "@type") ||
      Object.hasOwn(schemaData, "@graph")
    )
  ) {
    throw new AppError(
      "JSON-LD reserved properties are managed by the backend",
      400
    );
  }

  const updatedSchema = await prisma.seo_schemas.update({
    where: { id },
    data: {
      ...(schemaType !== undefined && { schemaType }),
      ...(schemaData !== undefined && { schemaData }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return res.status(200).json({
    success: true,
    message: "Schema updated successfully",
    data: {
      ...updatedSchema,
      jsonLD: generateJsonLD(updatedSchema),
    },
  });
});

// ========================================
// DELETE SCHEMA
// ========================================
const deleteSchema = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingSchema = await prisma.seo_schemas.findUnique({
    where: { id },
  });

  if (!existingSchema) {
    throw new AppError("Schema not found", 404);
  }

  await prisma.seo_schemas.delete({
    where: { id },
  });

  return res.status(200).json({
    success: true,
    message: "Schema deleted successfully",
  });
});

// ========================================
// GET ACTIVE SCHEMAS (PUBLIC)
// ========================================
const getActiveSchemas = asyncHandler(async (req, res) => {
  const schemas = await prisma.seo_schemas.findMany({
    where: {
      isActive: true,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Active schemas fetched successfully",
    count: schemas.length,
    data: schemas.map(generateJsonLD),
  });
});

module.exports = {
  getAllSchemas,
  createSchema,
  getSchemaById,
  updateSchema,
  deleteSchema,
  getActiveSchemas,
};
