var express = require("express");
var router = express.Router();
const upload = require("../plugins/multer");

// 上传图片
router.post("/file", upload.single("file"), function (req, res) {
  console.log("上传文件: ", req.file);
  const file = req.file;
  let pathArr = file.destination.split("/");
  let result = {
    url: `${pathArr[pathArr.length - 1]}/${file.filename}`,
    name: file.filename,
    size: (file.size / 1024).toFixed(2),
  };
  res.send(result);
});

// 上传图片--最多同时上传15张
router.post("/files", upload.array("files", 15), function (req, res) {
  let pathArr = req.file.destination.split("/");
  let images = req.files.map((v) => {
    return {
      url: `${pathArr[pathArr.length - 1]}/${v.filename}`,
      name: v.filename,
    };
  });
  res.send(images);
});

module.exports = router;
