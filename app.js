var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const ejs = require("ejs");
require("./plugins/dotenv"); // 导入环境变量
require("./plugins/global");
const config = require("./global.config")["development"];
global.CONF = config;
const utils = require("./utils/index");
Object.assign(global, utils);

var app = express();
// 指定EJS为模板引擎
app.engine("ejs", ejs.__express);

// 设置默认的模板文件后缀为.ejs
app.set("view engine", "ejs");

// app.use(function (req, res, next) {
//   console.log("我是中间件");
//   next();
// });
// http://www.ibiquge.cc/762/
const superagent = require("superagent");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");

let fs = require("fs");
const newpc = require("./task/newpc.js");
const conversion = require("./utils/conversion.js");
//测试代码
app.get("/", async (req, res) => {
  // const bookSea = new newpc.initBookSea({
  //   // url: "http://www.ibiquge.cc/762/",
  //   url: "http://www.ldxsw.net/book_13491/",
  //   site: "lingdian",
  //   interval: 1,
  // });
  // bookSea.start();
  // conversion();

  console.log("当前环境: ", process.env);
  res.send("start!" + new Date().getTime());
});

// const demo = require("./task/demo.js");
// demo.start();

const { makeBook, createBookJson } = require("./utils/book.js");
app.get("/demo", async (req, res) => {
  // makeBook("魔法学徒", "零点小说网 www.ldxsw.net，最快更新魔法学徒最新章节！");
  // createBookJson("魔法学徒");
  res.send("start!" + new Date().getTime());
});

app.get("/read", async (req, res) => {
  const query = req.query;
  if (!query.title) return res.status(400).json("小说名称不能为空");
  if (query.index === "" || isNaN(Number(query.index)))
    return res.status(400).json("索引不存在");
  let index = Number(query.index);
  let title = query.title;
  const dirPath = path.join(__dirname, `./public/books/${title}`);
  const jsonPath = path.join(__dirname, `./public/books/${title}/info.json`);

  fs.readFile(jsonPath, (err, data) => {
    if (err) return res.status(400).json(err);
    else {
      let jsonData;
      try {
        jsonData = JSON.parse(data);
      } catch {
        return res.status(400).json("json解析失败");
      }
      let item = jsonData.directory[index - 1];
      const chartPath = path.join(
        __dirname,
        `./public/books/${title}/${item.fileName}`
      );
      fs.readFile(chartPath, (err2, data2) => {
        if (err2) res.status(400).json("文件读取失败");
        else {
          let pre = index - 1 || 1;
          let next =
            index + 1 <= jsonData.directory.length
              ? index + 1
              : jsonData.directory.length;
          res.render("index", {
            name: title,
            title: item.title,
            content: data2,
            index,
            pre,
            next,
            chapters: jsonData.directory,
          });
        }
      });
    }
  });
});

const BQG = require("./task/bqg.js");
let pachong = "";
app.get("/start", async (req, res) => {
  // let { story_id, start_page_no, interval, id } = req.query;
  // pachong = BQG(story_id, start_page_no, id, interval);
  // pachong.start();
  res.send("start!");
});
app.get("/stop", async (req, res) => {
  if (!pachong) {
    res.send("没有运行中的爬虫");
  } else {
    pachong.stop();
    res.send("stop!");
  }
});

// const test = require("./task/newpc.js");
// test.getDirectory();

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

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(logger("dev"));
// 记录接口请求到日志
const accessLogStream = fs.createWriteStream("./log/request.log", {
  flags: "a",
});
app.use(logger("combined", { stream: accessLogStream }));

// 路由
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var genshinRouter = require("./routes/genshin");
var uploadRouter = require("./routes/upload");
var storyRouter = require("./routes/story");
var timerRouter = require("./routes/timer");
var botRouter = require("./routes/bot");
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/genshin", genshinRouter);
app.use("/upload", uploadRouter);
app.use("/story", storyRouter);
app.use("/timer", timerRouter);
app.use("/bot", botRouter);

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
