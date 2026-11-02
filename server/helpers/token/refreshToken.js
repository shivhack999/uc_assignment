require("dotenv").config();
const jwt = require('jsonwebtoken');
const refreshToken = (empData) => {
        const token = jwt.sign(empData, process.env.JWT_SECRET, {expiresIn:"90d"});
        return "Bearer "+token;
}
module.exports = refreshToken;