const prisma = require("../../config/prisma.client");
const generate_access_token = require("../../helpers/token/accessToken");
const generate_refresh_token = require("../../helpers/token/refreshToken");
const asyncHandler = require("../../middlewares/error/asyncHandler");
const AppError = require("../../utils/error/AppError");
const signin = asyncHandler(async (req, res, next) => {
  const { emailOrContact, password } = req?.body || {};

  if (!emailOrContact || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const response = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrContact }, { contact_number: emailOrContact }],
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      contact_number: true,
      is_active: true,
      inverters: {
        select: {
          id: true,
          imei: true,
          model: true,
          password: true,
          lastSeenAt: true,
        },
      },
    },
  });
  if (!response) {
    throw new AppError("Invalid email or password", 400);
  }

  if (response.is_active === false) {
    throw new AppError("Your account is not active", 403);
  }

  const verifyPassword = await bcrypt.compare(password, response.password);

  if (!verifyPassword) {
    throw new AppError("Invalid email or password", 400);
  }

  const accessToken = await generate_access_token({
    id: response.id,
  });

  const refreshToken = await generate_refresh_token({
    id: response.id,
  });

  await prisma.user.update({
    where: { id: response.id },
    data: { refresh_token: refreshToken },
  });

  const option = {
    maxAge: 32400000,
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json({
      success: true,
      message: `Login Successfully`,
      data: {
        id: response?.id,
        name: response?.name,
        email: response?.email,
        contact: response?.contact_number,
        inverter: response?.inverters,
      },
      token: refreshToken,
    });
});

const logout = asyncHandler(async (req, res) => {
  await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      refresh_token: null,
    },
  });

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  };

  return res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .status(200)
    .json({
      success: true,
      message: "Logout successfully",
    });
});



module.exports = {
  signin,
  logout,
};