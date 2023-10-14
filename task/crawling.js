const TaskScheduler = require("../plugins/schedule/index.js");
const { send } = require("../plugins/nodemailer/index.js");
const superagent = require("superagent");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");

const url = "http://www.ibiquge.cc";
const storeId = 448;
const startPageNum = 350154;
let defaultEncoding = "gbk";

let currentPageNum = startPageNum;
let isFinish = true;
const task = async function () {
  if (!isFinish) {
    console.log("当前爬取任务还在进行中...");
    return;
  }
  isFinish = false;

  let result = await superagent
    .get(`${url}/${storeId}/${currentPageNum}.html`)
    .responseType("arraybuffer");
  result.charset && (defaultEncoding = result.charset);
  const utf8String = iconv.decode(result.body, defaultEncoding);
  const $ = cheerio.load(utf8String);

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

  const Chapters = {
    title: title,
    content: filter.join("\n"),
  };
  isFinish = true;
  currentPageNum++;
  console.log(title + " -- 爬取完成");

  //   await send("17774657825@163.com", "每个星期三中午12点 发送邮件");
  //   return console.log(
  //     "允许定时任务每个星期三中午12点 发送邮件..." +
  //       new Date().getMinutes() +
  //       "-" +
  //       new Date().getSeconds()
  //   );
};

module.exports = new TaskScheduler("10 * * * * *", task);
// module.exports = new TaskScheduler('0 0 12 ? * WED', task);
