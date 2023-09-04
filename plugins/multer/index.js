/*
 * @Author: hejiaqun 17774657825@163.com
 * @Date: 2023-09-04 13:56:13
 * @LastEditors: hejiaqun 17774657825@163.com
 * @LastEditTime: 2023-09-04 14:41:16
 * @FilePath: \myapp\plugins\multer.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
