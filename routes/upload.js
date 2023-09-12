var express = require("express");
var router = express.Router();
const upload = require("../plugins/multer");

router.get("/", function (req, res, next) {
  res.send('hello')
});

// 上传头像
router.post("/avatar", upload.single("avatar"), function (req, res) {
  let avatar = CONF.FILE_HOST + "/uploads/" + req.file.filename;
  res.send({avatar})
});

module.exports = router;
