var express = require("express");
const mongoose = require("mongoose");
var router = express.Router();
const Story = require("../models/story.js");
const upload = require("../plugins/multer");
const fs = require("fs");

router.get("/story", function (req, res) {});
