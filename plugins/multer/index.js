const multer = require("multer");
const path = require("path");

function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate =
    date.getFullYear() + seperator1 + month + seperator1 + strDate;
  return currentdate.toString();
}
var datatime = "public/images/" + getNowFormatDate();

const storage = multer.diskStorage({
  destination: datatime,
  filename: (req, file, cb) => {
    let extname = path.extname(file.originalname); // 获取扩展名
    cb(null, Date.now() + extname); // 设置文件名
  },
});

const upload = multer({ storage });
module.exports = upload;
