const express = require('express')
const router = express.Router();
const controller = require('./controllers/controller');
require("dotenv/config");

router.put("/api/change_password", controller.changePassword);

router.post("/api/login", controller.login);

router.post("/api/register", controller.register);

module.exports = router;
