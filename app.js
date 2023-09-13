/*
 * @Author: hejiaqun 17774657825@163.com
 * @Date: 2023-09-02 16:56:38
 * @LastEditors: hejiaqun 17774657825@163.com
 * @LastEditTime: 2023-09-13 09:59:21
 * @FilePath: \myapp\app.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
const config = require("./global.config")["development"];
global.CONF = config;
const utils = require("./utils/index");
Object.assign(global, utils);

var app = express();

// 连接数据库
require("./plugins/mongoose");

// 文件上传
const upload = require("./plugins/multer");
app.post("/upload", upload.single("file"), (req, res) => {
  // 文件上传成功后的处理
  console.log(req.file);
  res.json({ message: "文件上传成功" });
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 路由
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var genshinRouter = require("./routes/genshin");
var uploadRouter = require("./routes/upload");
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/genshin", genshinRouter);
app.use("/file", uploadRouter);

console.log("环境变量: ", process.env.MY_APP);

// 404
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send("error");
});

module.exports = app;
