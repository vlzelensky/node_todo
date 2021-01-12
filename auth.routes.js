const express = require('express')
const router = express.Router();
const controller = require('./controllers/controller');
require("dotenv/config");

router.put("/api/change_password", controller.changePassword);

router.post("/api/todolist", controller.saveTodoList);

router.get("/api/todolist", controller.getTodoLists);

router.post("/api/check_email", controller.checkEmail);

router.get("/api/editlist/:id", controller.getEditList);

router.put("/api/editlist/:id", controller.editList);

router.post("/api/login", controller.login);

router.post("/api/register", controller.register);

module.exports = router;
