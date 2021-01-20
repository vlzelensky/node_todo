const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const TodoList = require("../Models/Todolist");
const TodoTask = require("../Models/Todotask");
const mongoose = require("mongoose");
const c = require("config");

exports.checkEmail = async function (req, res) {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  } else {
    return res.status(201).json({ message: "User has been founded" });
  }
};

exports.changePassword = async function (req, res) {
  try {
    const { email, newPassword } = req.body;
    const hashedpassword = await bcrypt.hash(newPassword, 12);
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          password: hashedpassword,
        },
      }
    )
      .then((result) => {
        res.status(201).send({ data: result, message: "password updated" });
      })
      .catch((err) => console.log("err", err));
  } catch (e) {
    res.status(500).send({ message: "Something went wrong" });
  }
};

exports.login = async function (req, res) {
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
};

exports.register = async function (req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;

    const candidate = await User.findOne({ email });
    if (candidate) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
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
};

exports.saveTodoList = async function (req, res) {
  const token = req.get("x-token");
  try {
    const data = jwt.verify(token, process.env.jwtSecret);
    const { title, tasks } = req.body;

    const todoList = TodoList({
      userId: data.userId,
      title,
    });
    await todoList.save();
    tasks.forEach((todoItem) => {
      const todoTask = TodoTask({
        text: todoItem.text,
        checked: todoItem.checked,
        id_list: todoList._id,
      });
      todoTask.save();
    });
    res.status(201).json({ message: "Todolist created successfully" });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong, try again" });
    console.log(e);
  }
};

exports.getTodoLists = async function (req, res) {
  const token = req.get("x-token");
  try {
    const data = jwt.verify(token, process.env.jwtSecret);
    const lists = await TodoList.find({ userId: data.userId }).lean().exec();

    await Promise.all(
      lists.map(async (list) => {
        const tasks = await TodoTask.find({
          id_list: list._id,
        })
          .limit(3)
          .lean()
          .exec();
        list["tasks"] = tasks;
      })
    );
    res.status(200).json(lists);
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Something went wrong, try again" });
  }
};

exports.getEditList = async function (req, res) {
  try {
    const list = await TodoList.findOne({ _id: req.params.id });
    const tasks = await TodoTask.find({ id_list: req.params.id });
    res.status(200).json({ list, tasks });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong, try again" });
  }
};

exports.editList = async function (req, res) {
  try {
    const { editing, editingTitle } = req.body;
    const tasks = Object.values(editing);
    if (editingTitle !== undefined) {
      await TodoList.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: {
            title: editingTitle,
          },
        }
      );
    }
    if (tasks) {
      tasks.forEach(async (task) => {
        const { _id, text, checked } = task;
        await TodoTask.findOneAndUpdate(
          { _id },
          {
            $set: {
              text,
              checked,
            },
          }
        );
      });
    }

    res.status(201).json({ message: "TodoList updated successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Something went wrong, try again" });
  }
};

exports.deleteList = async function (req, res) {
  try {
    const { id } = req.params;
    const deleteList = await TodoList.deleteOne({ _id: id });
    const deleteListTasks = await TodoTask.deleteMany({ id_list: id });
    res.status(200).json({ message: "TodoList deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong, try again" });
  }
};

exports.deleteTask = async function (req, res) {
  try {
    const { id } = req.params;
    const deleteTask = await TodoTask.deleteOne({ _id: id });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong, try again" });
  }
};

exports.addNewTask = async function (req, res) {
  try {
    const { id_list, text, checked } = req.body;
    const newTask = await TodoTask({
      id_list,
      text,
      checked,
    });
    newTask.save();
    res.status(200).json({ message: "Task saved successfully" });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong, try again" });
  }
};

exports.getUser = async function (req, res) {
  const token = req.get("x-token");
  if (!token) {
    return res.status(400).json({ message: "token is not provided" });
  }
  try {
    const data = jwt.verify(token, process.env.jwtSecret);
    const user = await User.findOne({ _id: data.userId });
    res.json({ firstName: user.firstName, lastName: user.lastName, userId: user._id, email: user.email });
  } catch (e) {
    res.status(500).json({ message: "Invalid token" });
  }
};
