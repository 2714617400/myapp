const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const folder = `${year}${month}${day}`;

    // 创建文件夹路径
    const uploadPath = path.join(__dirname, "../../public/images", folder);

    // 确保文件夹存在，如果不存在则创建它
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath); // 设置存储路径
  },
  filename: (req, file, cb) => {
    let extname = path.extname(file.originalname); // 获取扩展名
    cb(null, Date.now() + extname); // 设置文件名
  },
});

const upload = multer({ storage });
module.exports = upload;
