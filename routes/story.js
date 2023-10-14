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

router.get("/:id/chapter", function (req, res, next) {
  const id = req.params.id;
  Story.findById(id, { __v: 0 }).exec(function (err, data) {
    if (err) {
      res.status(400).send("查询异常");
    } else {
      res.send(data.chapters);
    }
  });
});

// 新增或修改章节
router.post("/:id/chapter", function (req, res) {
  const id = req.params.id,
    body = req.body;
  console.log(body, "body");

  Story.findOneAndUpdate(
    { _id: id, "chapters.title": { $ne: body.title } }, // 查询条件
    {
      $addToSet: {
        // 使用$addToSet来确保不添加重复的子文档
        chapters: body,
      },
    },
    { new: true, upsert: true }, // 选项，new:true表示返回更新后的文档，upsert:true表示如果文档不存在则创建
    (err, updatedParent) => {
      if (err) {
        console.error(err);
        res.status(400).send(err);
      } else {
        res.send(updatedParent);
      }
    }
  );
});

router.delete("/:id/chapter/:child_id", function (req, res, next) {
  const id = req.params.id,
    child_id = req.params.child_id;

  Story.findByIdAndUpdate(
    id,
    { $pull: { chapters: { _id: child_id } } },
    { new: true },
    (err, updatedParent) => {
      if (err) {
        res.status(400).send(err);
      } else {
        res.send(updatedParent);
      }
    }
  );
});

module.exports = router;
