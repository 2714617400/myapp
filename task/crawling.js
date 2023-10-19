const TaskScheduler = require("../plugins/schedule/index.js");
const { send } = require("../plugins/nodemailer/index.js");
const Story = require("../models/story.js");
const superagent = require("superagent");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
// http://www.ibiquge.cc/502/322816.html
const id = "6530d37db2667f4b47bdcf0d";
const url = "http://www.ibiquge.cc";
const storeId = 502;
const startPageNum = 322816;
let defaultEncoding = "gbk";

let nextPage = `${url}/${storeId}/${startPageNum}.html`;
let isFinish = true;
const task = async function () {
  if (!isFinish) {
    console.log("当前爬取任务还在进行中...");
    return;
  }
  if (!nextPage) {
    console.log("爬取完成, 请终止爬虫程序");
    return;
  }
  isFinish = false;

  // 拉取网页源码
  let result = await superagent.get(nextPage).responseType("arraybuffer");
  result.charset && (defaultEncoding = result.charset);
  const utf8String = iconv.decode(result.body, defaultEncoding);
  const $ = cheerio.load(utf8String);

  // 获取下一章地址
  const next = $(".page_chapter a")
    .filter((i, v) => {
      return $(v).text() === "下一章";
    })
    .first()
    .attr("href");
  nextPage = next ? url + next : "";

  // 获取正文和标题
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

  // 生成章节数据
  const Chapters = {
    title: title,
    content: filter.join("\n"),
  };

  // 保存到数据库
  const body = Chapters;

  try {
    const save = await Story.findOneAndUpdate(
      { _id: id, "chapters.title": { $ne: body.title } }, // 查询条件
      {
        $addToSet: {
          // 使用$addToSet来确保不添加重复的子文档
          chapters: body,
        },
      },
      { new: false, upsert: true } // 选项，new:true表示返回更新后的文档，upsert:true表示如果文档不存在则创建
    );
    if (save) {
      console.log(title + " -- 爬取完成");
      isFinish = true;
    } else {
      console.error("数据插入异常：" + save);
    }
  } catch (e) {
    console.error("数据库异常：" + e);
    isFinish = true;
  }

  //   await send("17774657825@163.com", "每个星期三中午12点 发送邮件");
  //   return console.log(
  //     "允许定时任务每个星期三中午12点 发送邮件..." +
  //       new Date().getMinutes() +
  //       "-" +
  //       new Date().getSeconds()
  //   );
};

module.exports = new TaskScheduler("*/3 * * * * *", task);
// module.exports = new TaskScheduler('0 0 12 ? * WED', task);
