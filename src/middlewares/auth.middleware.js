const userModel = require("../models/user.model");
const JWT = require("jsonwebtoken");

async function authUser(req, res, next) {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res
        .status(401)
        .send({ message: "Access denied. No token provided." });
    }

    try {
      const decoded = JWT.verify(token, process.env.JWT_SECRET);
      const user = await userModel
        .findById(decoded.id)
        
        .select("-password -__v");

        if (!user) {
          return res.status(401).send({ message: "Authentication failed. User not found." });
        }

      req.user = user;

      next();
    } catch (error) {
      return res.status(401).send({ message: "Invalid token." });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
}

module.exports = { authUser };