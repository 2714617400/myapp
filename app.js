var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("./plugins/dotenv"); // 导入环境变量
const config = require("./global.config")["development"];
global.CONF = config;
const utils = require("./utils/index");
Object.assign(global, utils);

var app = express();

//测试代码
const superagent = require("superagent");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");

const url = "http://www.ibiquge.cc";
const storeId = 448;
const startPageNum = 350154;
let defaultEncoding = "gbk";
app.get("/", async (req, res) => {
  let result = await superagent
    .get(`${url}/${storeId}/${startPageNum}.html`)
    .responseType("arraybuffer");
  result.charset && (defaultEncoding = result.charset);
  const utf8String = iconv.decode(result.body, defaultEncoding);
  const $ = cheerio.load(utf8String);
  let next = $(".page_chapter a")
    .filter((i, v) => {
      return $(v).text() === "下一章";
    })
    .first()
    .attr("href");
  next && (next = url + next);
  console.log(next);
  res.send(utf8String);
  return;

  const content = $("#content").text(); // 正文
  const title = $(".content h1").text(); // 正文
  const textArr = content.split("\n");
  const filter = [];
  for (let i = 0; i < textArr.length; i++) {
    let t = textArr[i].trim();
    if (Boolean(t)) {
      filter.push(t);
    }
  }
  console.log(filter);
  const Chapters = {
    title: title,
    content: filter.join("\n"),
  };
  res.send(Chapters);
  // res.send(`<pre style="text-indent: 25px;">${Chapters}</pre>`);
  // res.send(result.text)
});

// const SendEmail = require("./task/demo.js");
// SendEmail.start();
// console.log("定时任务开始");

// 爬虫任务
// const Crawling = require("./task/crawling.js");
// Crawling.start();
// console.log("爬虫启动!");

// 连接数据库
require("./plugins/mongoose");

// 文件上传
const upload = require("./plugins/multer");
app.post("/upload", upload.single("file"), (req, res) => {
  // 文件上传成功后的处理
  console.log(req.file);
  res.json({ message: "文件上传成功" });
});

// 解析不同类型的POST请求
// app.use(upload.array()); // multipart/form-data 这是对所有请求都执行文件上传处理,不管请求路径是否匹配,应该再需要的路由使用
app.use(express.json()); // application/json
app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded

app.use(logger("dev"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 路由
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var genshinRouter = require("./routes/genshin");
var uploadRouter = require("./routes/upload");
var storyRouter = require("./routes/story");
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/genshin", genshinRouter);
app.use("/file", uploadRouter);
app.use("/story", storyRouter);

// 404
app.use(function (req, res, next) {
  next(createError(404));
});

/**
 * 响应规范: 正常情况状态为200,直接传值. 异常情况状态为400,传报错文字. 服务器错误传500
 */

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;
