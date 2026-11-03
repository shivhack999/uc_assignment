require("dotenv").config();
const jwt = require('jsonwebtoken');
const refreshToken = (empData) => {
        const token = jwt.sign(empData, process.env.R_JWT_SECRET, {expiresIn:"7d"});
        return "Bearer "+token;
}
module.exports = refreshToken;