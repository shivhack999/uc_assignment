
const prisma = require("../../config/prisma.client");

const generate_access_token = require("../../helpers/token/accessToken");
const generate_refresh_token = require("../../helpers/token/refreshToken");

const asyncHandler = require("../../middlewares/error/asyncHandler");
const AppError = require("../../utils/error/AppError");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const accessCookieOptions = {
  maxAge: 15 * 60 * 1000, // 15 minutes
  httpOnly: true,
  secure: false, 
  sameSite: "lax",
  path: "/",
};

const refreshCookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: false, 
  sameSite: "lax",
  path: "/",
};

const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const employee = await prisma.employee.findFirst({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      isActive: true,
      role: true,
    },
  });

  if (!employee) {
    throw new AppError("Invalid email or password", 400);
  }

  if (!employee.isActive) {
    throw new AppError("Your account is not active", 403);
  }

  const verifyPassword = await bcrypt.compare(
    password,
    employee.password
  );

  if (!verifyPassword) {
    throw new AppError("Invalid email or password", 400);
  }

  const accessToken = generate_access_token({
    id: employee.id,
  });

  const refreshToken = generate_refresh_token({
    id: employee.id,
  });

  await prisma.employee.update({
    where: { id: employee.id },
    data: { refresh_token: refreshToken },
  });

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessCookieOptions)
    .cookie("refreshToken", refreshToken, refreshCookieOptions)
    .json({
      success: true,
      message: "Login Successfully",
      data: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
    });
});


const profile = asyncHandler(async (req, res) => {
 
  const employeeId = req.user.id;

  const employee = await prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  if (!employee.isActive) {
    throw new AppError("Your account is not active", 403);
  }

  return res.status(200).json({
    success: true,
    message: "Profile fetched successfully",
    user: employee,
  });
});


const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  console.log("Refresh Token from cookie:", refreshToken);
  if (!refreshToken) {
    throw new AppError("Refresh token not found", 401);
  }

  let decoded;

  try {
    // Use exactly the same secret used by generate_refresh_token
    decoded = jwt.verify(
      refreshToken.split(" ")[1],
      process.env.R_JWT_SECRET
    );
  } catch (error) {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const employee = await prisma.employee.findUnique({
    where: {
      id: decoded.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      refresh_token: true,
    },
  });

  if (!employee || employee.refresh_token !== refreshToken) {
    throw new AppError("Invalid refresh session", 401);
  }

  if (!employee.isActive) {
    throw new AppError("Your account is not active", 403);
  }

  // Generate a new access token
  const newAccessToken = generate_access_token({
    id: employee.id,
  });

  return res
    .status(200)
    .cookie(
      "accessToken",
      newAccessToken,
      accessCookieOptions
    )
    .json({
      success: true,
      message: "Access token refreshed successfully",
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
    });
});


const logout = asyncHandler(async (req, res) => {
  await prisma.employee.update({
    where: {
      id: req.user.id,
    },
    data: {
      refresh_token: null,
    },
  });

  return res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    })
    .status(200)
    .json({
      success: true,
      message: "Logout successfully",
    });
});

module.exports = {
  signin,
  profile,
  refresh,
  logout,
};
