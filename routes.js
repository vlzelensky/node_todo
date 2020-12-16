const express = require('express');
const app = express();
const router = express.Router();
const mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String
});

let userList = mongoose.model('Users', UserSchema);

const todoSchema = mongoose.Schema({
    text: String,
    checked: Boolean
})

let todoList = mongoose.model('todos', todoSchema);

router.post('/api/user', (req, res) => {
    const newUser = userList({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    })
    newUser.save();
    res.status(200).json({});
})


module.exports = router;