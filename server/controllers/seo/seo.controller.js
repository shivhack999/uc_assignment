
const prisma = require("../../config/prisma.client");
const asyncHandler = require("../../middlewares/error/asyncHandler");
const AppError = require("../../utils/error/AppError");

const getSEO = asyncHandler(async (req, res) => {
  const seo = await prisma.seo_setting.findUnique({
    where: {
      settingKey: "homepage",
    },
  });

  if (!seo) {
    throw new AppError("SEO configuration not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "SEO fetched successfully",
    data: {
      ...seo,
      index: seo.robotsIndex,
      follow: seo.robotsFollow,
    },
  });
});

const updateSEO = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("User authentication required", 401);
  }

  const {
    metaTitle,
    metaDescription,
    canonicalUrl,
    index,
    follow,
    focusKeywords,
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
  } = req.body || {};

  // Find existing SEO configuration
  const existingSEO = await prisma.seo_setting.findUnique({
    where: {
      settingKey: "homepage",
    },
  });

  // Map frontend fields to Prisma fields
  const seoData = {
    metaTitle,
    metaDescription,
    canonicalUrl,
    robotsIndex: index,
    robotsFollow: follow,
    focusKeywords,
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
  };

  // Remove undefined fields
  Object.keys(seoData).forEach((key) => {
    if (seoData[key] === undefined) {
      delete seoData[key];
    }
  });

  let seo;

  if (existingSEO) {
    // Update existing SEO configuration
    seo = await prisma.seo_setting.update({
      where: {
        id: existingSEO.id,
      },
      data: {
        ...seoData,
        updatedBy: {
          connect: {
            id: userId,
          },
        },
      },
    });
  } else {
    // Create initial SEO configuration
    seo = await prisma.seo_setting.create({
      data: {
        ...seoData,
        settingKey: "homepage",
        createdBy: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  return res.status(200).json({
    success: true,
    message: existingSEO
      ? "SEO updated successfully"
      : "SEO configuration created successfully",
    data: {
      ...seo,
      index: seo.robotsIndex,
      follow: seo.robotsFollow,
    },
  });
});

module.exports = {
  getSEO,
  updateSEO,
};
