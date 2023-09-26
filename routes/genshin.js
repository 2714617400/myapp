/*
 * @Author: hejiaqun 17774657825@163.com
 * @Date: 2023-09-04 11:37:43
 * @LastEditors: hejiaqun 17774657825@163.com
 * @LastEditTime: 2023-09-15 18:40:18
 * @FilePath: \myapp\routes\genshin.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
var express = require("express");
var router = express.Router();
const Role = require("../models/genshin.js");
const upload = require("../plugins/multer");
const fs = require("fs");

function copy(target, sounce) {
  for (let k in sounce) {
    target[k] = sounce[k];
  }
}

function filter(data, ft = []) {
  if (typeof data !== "object" || typeof ft !== "object") return {};
  if (ft.length === 0) return data;

  let obj = {};
  ft.forEach((key) => {
    if (data[key] !== undefined) {
      obj[key] = data[key];
    }
  });
  return obj;
}

router.get("/", function (req, res, next) {
  Role.find({}).exec(function (err, data) {
    if (err) {
      res.status(400).send("查询异常");
    } else {
      res.send(data);
    }
  });
});

router.post("/", function (req, res) {
  const body = req.body;
  const insert = new Role();
  copy(insert, body);

  insert.save(function (err, data) {
    if (err) {
      res.status(400).json(err.code === 11000 ? "名称重复" : err);
    } else {
      res.send(data);
    }
  });
});

router.put("/:id", function (req, res) {
  const id = req.params.id;
  const body = req.body;
  let updata = filter(body, [
      "name",
      "elemental",
      "avatar",
      "weaponType",
      "posters",
      "isGod",
      "godType",
      "country",
      "speech",
    ]),
    updatedAt = Date.now();
  Role.findByIdAndUpdate(
    id,
    {
      $set: Object.assign({}, updata, { updatedAt }),
    },
    { new: true },
    function (err, data) {
      if (err) res.status(400).send("更新失败");
      else {
        res.send(data);
      }
    }
  );
});

router.delete("/:id", async function (req, res) {
  const id = req.params.id;
  Role.findById(id, function (err, doc) {
    if (err) {
      res.status(400).send("查找失败");
    } else {
      // 删除文件
      try {
        fs.unlinkSync(`./public/uploads/${doc.toObject().avatar}`);
      } catch {
        console.log("这个文件文件不存在,或许已删除");
      }

      // 删除数据库数据
      Role.deleteOne({ _id: id }, function (err, doc) {
        // 使用id进行删除操作无效,可能是因为id并不实际存在
        if (err) {
          res.status(400).send("删除失败");
        } else {
          res.send(doc);
        }
      });
    }
  });
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
