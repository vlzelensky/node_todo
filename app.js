const express = require("express");
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const postRoute = require("./routes");
const bodyParser = require('body-parser')
const cors = require('cors');
require("dotenv/config");

app.use(cors());

app.use(bodyParser.json())

app.use("/", postRoute);

mongoose.connect(
   process.env.DB_CONNECTION, { 
       useNewUrlParser: true,
       useFindAndModify: false, }, () => {
   console.log("connected to port 8080")
});

app.listen(8080);