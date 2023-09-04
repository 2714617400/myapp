var express = require("express");
var router = express.Router();
const Role = require("../models/genshin.js");
const upload = require("../plugins/multer");

router.get("/", function (req, res, next) {
  Role.find({}).exec(function (err, data) {
    if (err) {
      res.status(400).send("查询异常");
    } else {
      res.send(data);
    }
  });
});

router.post("/", upload.single("avatar"), function (req, res) {
  const body = req.body;
  const insert = new Role();
  insert.name = body.name;
  insert.elemental = body.elemental;
  insert.avatar = req.file.filename;
  insert.save(function (err, data) {
    if (err) {
      res.status(400).json(err.code === 11000 ? "名称重复" : err);
    } else {
      res.send(data);
    }
  });
});

module.exports = router;
