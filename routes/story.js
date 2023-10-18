var express = require("express");
const mongoose = require("mongoose");
var router = express.Router();
const Story = require("../models/story.js");
const upload = require("../plugins/multer");
const fs = require("fs");

function copy(target, sounce) {
  for (let k in sounce) {
    target[k] = sounce[k];
  }
}

// 故事列表
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

// 新增故事
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

// 修改故事
router.put("/:id", function (req, res) {
  const id = req.params.id,
    body = req.body;
  Story.findByIdAndUpdate(id, body, { new: false }, function (err, data) {
    if (err) res.status(400).send("更新失败");
    else {
      res.send(data);
    }
  });
});

// 删除故事
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

// 章节列表
const FilterChapter = {
  __v: 0,
  content: 0,
};
router.get("/:id/chapter", async function (req, res, next) {
  const id = req.params.id,
    page = +req.query.page || 1,
    perPage = +req.query.per_page || 10;

  // 创建聚合管道，用于分页查询子文档
  const pipeline = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(id), // 根据父文档 ID 过滤
      },
    },
    {
      $project: {
        _id: 0, // 排除父文档的 _id
        chapters: {
          $map: {
            input: "$chapters",
            as: "child",
            in: {
              // 这里使用 $mergeObjects 来排除特定字段
              title: "$$child.title",
              id: "$$child._id",
            },
          },
        },
      },
    },
    {
      $addFields: {
        chapters: {
          $slice: ["$chapters", (page - 1) * perPage, perPage],
        },
      },
    },
  ];
  const pipelineOfCount = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(id), // 根据父文档 ID 过滤
      },
    },
    {
      $unwind: "$chapters",
    },
    {
      $count: "total", // 使用 $count 统计子文档总数
    },
  ];
  try {
    let docList = await Story.aggregate(pipeline).exec();
    let result = await Story.aggregate(pipelineOfCount).exec();

    res.send({
      code: 0,
      data: {
        list: docList[0]?.chapters,
        total: result[0]?.total,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(400).send("查询异常");
  }
  console.log("end");
  // Story.findById(id, FilterChapter)
  //   .skip((page - 1) * perPage) // 跳过前 (page - 1) 页的文档
  //   .limit(perPage) // 限制每页返回的文档数量
  //   .exec(function (err, data) {
  //     if (err) {
  //       res.status(400).send("查询异常");
  //     } else {
  //       res.send(data.chapters);
  //     }
  //   });
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

// 删除章节
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

// 获取章节内容
router.get("/:id/chapter/:child_id", function (req, res, next) {
  const id = req.params.id,
    child_id = req.params.child_id;

  // 使用聚合管道查询指定条件的子文档
  Story.aggregate([
    {
      $match: { _id: mongoose.Types.ObjectId(id) },
    },
    {
      $unwind: "$chapters", // 将嵌套数组展开
    },
    {
      $match: {
        "chapters._id": mongoose.Types.ObjectId(child_id) /* 你要查询的条件 */,
      },
    },
    {
      $group: {
        _id: "$_id",
        chapters: { $push: "$chapters" },
      },
    },
  ]).exec((err, result) => {
    if (err) {
      res.status(400).send(err);
    } else {
      const chapters = result[0]?.chapters;
      // res.send(chapters);
      res.send({
        code: 0,
        data: chapters[0],
      });
    }
  });
});

module.exports = router;
