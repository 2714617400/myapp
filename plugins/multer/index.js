const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/"); // 设置文件存储目录
  },
  filename: (req, file, cb) => {
    let extname = path.extname(file.originalname); // 获取扩展名
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); // 随机字符串
    cb(null, file.fieldname + "-" + uniqueSuffix + extname); // 设置文件名
  },
});

const upload = multer({ storage });
module.exports = upload;
