var express = require("express");
var router = express.Router();
const upload = require("../plugins/multer");
const { FILE_HOST, IMAGE_PRE } = process.env;
const PRE = FILE_HOST + IMAGE_PRE;

router.get("/", function (req, res, next) {
  res.send("You Can !");
});

// 上传头像
router.post("/avatar", upload.single("avatar"), function (req, res) {
  let result = {
    url: PRE + req.file.filename,
    name: req.file.filename,
  };
  res.send(result);
});

// 上传图片--最多同时上传15张
router.post("/images", upload.array("images", 15), function (req, res) {
  let images = req.files.map((v) => {
    return {
      url: PRE + v.filename,
      name: v.filename,
    };
  });
  res.send(images);
});

module.exports = router;
