require("dotenv").config();
const jwt = require('jsonwebtoken');
const accessToken = (data) => {
    const token = jwt.sign(data, process.env.JWT_SECRET, {expiresIn:"15m"});
    return "Bearer "+token;
}
module.exports = accessToken;