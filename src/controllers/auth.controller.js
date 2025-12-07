const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");

async function registerUser(req, res) {
    console.log('Request Received at Controller:', req.body);
  try {
    const {
      fullName: { firstName, lastName },
      email,
      password,
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      fullName: { firstName, lastName },
      email,
      password: hashedPassword,
    });

    return res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  registerUser,
};
