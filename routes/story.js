var express = require("express");
var router = express.Router();
const Story = require("../models/story.js");
const upload = require("../plugins/multer");
const fs = require("fs");

function copy(target, sounce) {
  for (let k in sounce) {
    target[k] = sounce[k];
  }
}

const Filter = {
  __v: 0,
  chapters: 0,
};
router.get("/", function (req, res, next) {
  Story.find({}, Filter).exec(function (err, data) {
    // lean() 返回原生js对象,而不是mongoose文档对象
    if (err) {
      res.status(400).send("查询异常");
    } else {
      res.send(data);
    }
  });
});

router.post("/", function (req, res) {
  const body = req.body;
  console.log(body, "body");
  const insert = new Story();
  copy(insert, body);

  insert.save(function (err, data) {
    if (err) {
      res.status(400).json(err.code === 11000 ? "故事重复" : err);
    } else {
      res.send(data);
    }
  });
});

router.put("/:id", function (req, res) {
  const id = req.params.id,
    body = req.body;
  Story.findByIdAndUpdate(id, body, { new: true }, function (err, data) {
    if (err) res.status(400).send("更新失败");
    else {
      res.send(data);
    }
  });
});

router.delete("/:id", async function (req, res) {
  const id = req.params.id;
  Story.findById(id, async function (err, doc) {
    if (err || !doc)
      return res.status(400).send(err ? "查找失败" : "未找到该故事");

    if (doc.chapters && doc.chapters.length !== 0)
      return res.status(400).send("故事内还有章节,请先删除章节");
    let result = await Story.deleteOne({ _id: id });
    if (!result.acknowledged) return res.status(400).send(result);
    res.send("删除成功");
  });
});

module.exports = router;
