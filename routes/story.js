var express = require("express");
const mongoose = require("mongoose");
var router = express.Router();
const Story = require("../models/story.js");

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
  let currentPage = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  let pageSize =
    parseInt(req.query.pageSize) > 0 ? parseInt(req.query.pageSize) : 5;
  let skip = (currentPage - 1) * pageSize;
  let regex = new RegExp(req.query.title || "", "i");
  let matchFilter = req.query.title ? { title: { $regex: regex } } : {};
  console.log("枫叶: ", req.query, skip);
  Story.aggregate()
    .match(matchFilter) // 根据需要筛选父文档
    .skip(skip) // 跳过文档
    .limit(pageSize) // 限制文档数量
    .project({
      title: 1, // 选择你想要返回的父文档字段
      cover_image: 1,
      updatedAt: 1,
      createdAt: 1,
      author: 1,
      description: 1,
      genres: 1,
      id: "$_id", // 重命名
      _id: 0, // 明确不返回_id
      chaptersCount: { $size: "$chapters" }, // 计算嵌套文档的数量
    })
    .exec((err, data) => {
      if (err) {
        res.status(400).json({
          status: 1,
          msg: err,
        });
      } else {
        Story.countDocuments(matchFilter, (err2, count) => {
          if (err2)
            return res.status(400).json({
              status: 1,
              msg: err,
            });
          res.json({
            status: 0,
            msg: "",
            result: {
              list: data,
              page: currentPage,
              pageSize: pageSize,
              total: count,
            },
          });
        });
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
      res.status(400).json({
        status: 1,
        msg: err.code === 11000 ? "故事重复" : err,
      });
    } else {
      res.json({
        status: 0,
        msg: "操作成功",
      });
    }
  });
});

// 修改故事
router.put("/:id", function (req, res) {
  const id = req.params.id,
    body = req.body;
  Story.findByIdAndUpdate(id, body, { new: false }, function (err, data) {
    if (err)
      res.status(400).json({
        status: 1,
        msg: "更新失败",
      });
    else {
      res.json({
        status: 0,
        msg: "操作成功",
      });
    }
  });
});

// 删除故事
router.delete("/:id", async function (req, res) {
  const id = req.params.id;
  Story.findById(id, async function (err, doc) {
    if (err || !doc)
      return res.status(400).json({
        status: 1,
        msg: err ? "查找失败" : "未找到该故事",
      });

    // if (doc.chapters && doc.chapters.length !== 0)
    // return res.status(400).json("故事内还有章节,请先删除章节");
    let result = await Story.deleteOne({ _id: id });
    if (!result.acknowledged)
      return res.status(400).json({
        status: 1,
        msg: result,
      });
    res.json({
      status: 0,
      msg: "操作成功",
    });
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
    perPage = +req.query.pageSize || 10;

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

    res.json({
      status: 0,
      result: {
        list: docList.length ? docList[0].chapters : [],
        total: result.length ? result[0].total : 0,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 1,
      msg: err,
    });
  }
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
    { new: false, upsert: true }, // 选项，new:true表示返回更新后的文档，upsert:true表示如果文档不存在则创建
    (err) => {
      if (err) {
        res.status(400).json({
          status: 1,
          msg: err,
        });
      } else {
        res.json({
          status: 0,
          msg: "操作成功",
        });
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
    { new: false },
    (err) => {
      if (err) {
        res.status(400).json({
          status: 1,
          msg: err,
        });
      } else {
        res.json({
          status: 0,
          msg: "操作成功",
        });
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
      res.status(400).json({
        status: 1,
        msg: err,
      });
    } else {
      const chapters = result[0].chapters;
      res.json({
        status: 0,
        result: chapters[0],
      });
    }
  });
});

// 获取下一章章节内容
router.get("/:id/chapter/:child_id/next", function (req, res, next) {
  const id = req.params.id,
    child_id = req.params.child_id;
  console.log("开始查询下一章");

  Story.findById(id, { "chapters.content": 0 }, (err, parent) => {
    console.log("查询所在故事");
    if (err) {
      res.status(400).json({
        status: 1,
        msg: err,
      });
    } else {
      // 在父文档中查找包含指定ID的嵌套文档
      const nestedDocument = parent.chapters.find(
        (doc) => doc._id.toString() === child_id
      );

      // 获取下一个嵌套文档的索引
      const currentIndex = parent.chapters.indexOf(nestedDocument);
      const nextIndex = currentIndex + 1;

      if (nextIndex < parent.chapters.length) {
        const nextNestedDocument = parent.chapters[nextIndex];
        res.json({
          status: 0,
          result: nextNestedDocument,
        });
      } else {
        res.json({
          status: 1,
          msg: "没有下一章",
        });
      }
    }
  });
});

module.exports = router;
