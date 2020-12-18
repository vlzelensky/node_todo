const express = require("express");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("./Models/User");
const app = express();
const router = express.Router();
require("dotenv/config");

// const todoSchema = mongoose.Schema({
//     text: String,
//     checked: Boolean
// })

// let todoList = mongoose.model('todos', todoSchema);

router.put("/api/change_password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const hashedpassword = await bcrypt.hash(newPassword, 12);  
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          password: hashedpassword  
        },
      }
    ).then(result => {
      console.log('result', result);
      res.status(201).send({data: result, message:"password updated"});
    }).catch(err => console.log('err', err)) ;
  } catch (e) {
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid username / password pair" });
    }
    const token = jwt.sign({ userId: user.id }, process.env.jwtSecret, {
      expiresIn: "1h",
    });

    res.json({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
      userId: user.id,
    });
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
