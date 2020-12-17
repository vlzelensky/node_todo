const express = require("express");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("./Models/User");
const app = express();
const router = express.Router();

// const todoSchema = mongoose.Schema({
//     text: String,
//     checked: Boolean
// })

// let todoList = mongoose.model('todos', todoSchema);

router.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!ismatch) {
      return res
        .status(400)
        .json({ message: "Invalid username / password pair" });
    }

    const token = jwt.sign({ userId: user.id }, config.get("jwt.Secret"), {
      expiresIn: "1h",
    });

    res.json({ token, userId: user.id });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong, please try again" });
  }
});

router.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const candidate = await User.findOne({ email });
    if (candidate) {
      return res
        .status(400)
        .json({ message: "User with this mail already exists" });
    }

    const hashedpassword = await bcrypt.hash(password, 12);
    const user = User({
      firstName,
      lastName,
      email,
      password: hashedpassword,
    });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong, try again" });
  }
});

module.exports = router;
