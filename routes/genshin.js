var express = require("express");
var router = express.Router();
const Role = require("../models/genshin.js");
const upload = require("../plugins/multer");
const fs = require('fs')

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

router.delete("/", async function (req, res) {
  const query = req.query;
  Role.findOne(query, function(err, doc) {
    if(err) {
      res.status(400).send('查找失败')
    } else {
      console.log('查找到的数据', doc.toObject())
      fs.unlinkSync(`./public/uploads/${doc.toObject().avatar}`)
      Role.deleteOne(query, function(err, doc) {
        if(err) {
          res.status(400).send('删除失败')
        } else {
          res.send(doc)
        }
      })
    }
  })
});

router.all("/elemental", function (req, res) {
  // 查询操作
  let elementalGroup = ["无", "风", "岩", "雷", "草", "水", "火", "冰"];
  const elementalList = elementalGroup.map((v, i) => {
    return {
      value: i,
      label: v,
    };
  });
  res.send(elementalList);
});

module.exports = router;
