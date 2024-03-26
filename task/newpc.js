const superagent = require("superagent");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const Story = require("../models/story.js");
const TaskScheduler = require("../plugins/schedule/index.js");
let fs = require("fs");
const path = require("path");

const WebSite = "http://www.ibiquge.cc";
class BookSea {
  constructor(opt) {
    this.url = opt.url;
    this.charset = opt.charset || "gbk";
    this.schedule = null;
    this.interval = Number(opt.interval) || 3;

    this.chapters = [];
    this.index = 0;
    this.bookName = null;
  }

  async start() {
    console.log("Book Sea! start!");
    await this.getDirectory();
    let result = await this.requestData();
    return result;
    // this.schedule = new TaskScheduler(`*/${this.interval} * * * * *`, () => {
    //   console.log("executing");
    // });
  }

  stop() {
    // if (this.schedule) {
    //   this.schedule.stop();
    //   console.log("schedule is stopped.");
    // } else {
    //   console.log("no schedule.");
    // }
  }

  // 请求目录
  async getDirectory() {
    const source = await superagent.get(this.url).responseType("arraybuffer");
    source.charset && (this.charset = source.charset);
    const UTF8Data = iconv.decode(source.body, this.charset);
    const $ = cheerio.load(UTF8Data);
    this.chapters = [];
    this.bookName = $("#maininfo #info h1").text();
    if (!this.bookName) {
      console.log("无法获取到书名!");
      return;
    }
    let content = $(".listmain dl dd a");
    content.each((i, el) => {
      this.chapters.push({
        title: $(el).text(),
        href: $(el).attr("href"),
      });
    });
    return this.chapters;
  }

  // 请求数据
  async requestData() {
    if (this.index >= this.chapters.length) {
      this.stop();
      return;
    }
    let url = WebSite + this.chapters[this.index].href;
    const source = await superagent.get(url).responseType("arraybuffer");
    source.charset && (this.charset = source.charset);
    const UTF8Data = iconv.decode(source.body, this.charset);
    const $ = cheerio.load(UTF8Data);
    this.index++;

    let data = this.extractData($);
    this.saveData(data);

    return data;
  }

  // 提取数据
  extractData(data) {
    let $ = data,
      title,
      content;
    title = $("#book .content h1").text();
    content = $("#book #content").text();
    return {
      title,
      content,
    };
  }

  // 存储数据
  async saveData(data) {
    let { title, content } = data;
    // fs.mkdirSync(path.join(__dirname, this.bookName));
    // if (!fs.accessSync(`./${this.bookName}`)) {
    //   console.log("mik");
    //   fs.mkdirSync(`./${this.bookName}`);
    // }
    if (this.index === 0) {
      fs.mkdirSync(path.resolve("../public/books", `./${this.bookName}`));
    }
    fs.writeFileSync(
      path.resolve("../public/books", `./${this.bookName}/${title}.txt`),
      content
    );
    // if (storyId) {
    //   const Chapters = {
    //     title: Title,
    //     content: RList.join("\n"),
    //   };

    //   try {
    //     const Save = await Story.findOneAndUpdate(
    //       { _id: storyId, "chapters.title": { $ne: Chapters.title } }, // 查询条件
    //       {
    //         $addToSet: {
    //           // 使用$addToSet来确保不添加重复的子文档
    //           chapters: Chapters,
    //         },
    //       },
    //       { new: false, upsert: true } // 选项，new:true表示返回更新后的文档，upsert:true表示如果文档不存在则创建
    //     );
    //     if (Save) {
    //       isFinish = true;
    //       console.log(Title + " -- 爬取完成");
    //     } else {
    //       console.error("数据插入异常：" + Save);
    //     }
    //   } catch (e) {
    //     console.error("数据库异常：" + e);
    //     isFinish = true;
    //   }
    // }
  }
}

function initBookSea(opt) {
  return new BookSea(opt);
}

module.exports = {
  initBookSea,
};
