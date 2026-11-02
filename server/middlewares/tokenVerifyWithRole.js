const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma.client");

module.exports.tokenVerification = (allowedRoles, allowedDepartments) => {
  return async (req, res, next) => {
    try {
      const token = req?.cookies?.accessToken || req?.headers?.authorization;
      if (!token) {
        return res.status(403).json({ success: false, message: "No token provided" });
      }
      let decoded ={};
      const splitToken = token?.split(" ");
      if (splitToken.length === 2) {
        try {
          decoded = jwt.verify(splitToken[1], process.env.JWT_SECRET);
        } catch (err) {
          return res.status(403).json({
            success: false,
            message: err.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
          });
        }
      }else{
        decoded.id = splitToken[1];
      }
      // 🔥 FAST indexed lookup
      const user = await prisma.auth.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          is_active: true,
          refresh_token:true,
          role: { select: { name: true } },
          department: { select: { name: true } }
        }
      });
      if (!user) {
        return res.status(403).json({ success: false, message: "User not found" });
      }
      if(!user.refresh_token) return res.status(403).json({ success: false, message: "User already logout" });
      if (!user.is_active) {
        return res.status(403).json({ success: false, message: "User is inactive" });
      }
      const userRole = user.role.name;
      const userDepartment = user.department.name;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      if(!allowedDepartments.includes(userDepartment)){
        return res.status(403).json({ success:false, message: "Access denied please connect with IT team."})
      }
      req.user = user;
      next();

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message,
      });
    }
  };
};