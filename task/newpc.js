const superagent = require("superagent");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const Story = require("../models/story.js");
const TaskScheduler = require("../plugins/schedule/index.js");
const { initTimer } = require("../utils/index.js");
let fs = require("fs");
const path = require("path");

const WebSiteOpt = {
  biquge: {
    url: "http://www.ibiquge.cc",
    el_book_name: "#maininfo #info h1",
    el_directory: ".listmain dl dd a",
    el_title: '"#book .content h1',
    el_content: "#book #content",
  },
  lingdian: {
    url: "http://www.ldxsw.net",
    el_book_name: "#main #info h1",
    el_directory: ".zjbox dl dd a",
    el_title: "#main h1",
    el_content: "#main #readbox #content",
  },
};

let timer1 = initTimer();
let timer2 = initTimer();
class BookSea {
  constructor(opt) {
    this.url = opt.url;
    this.charset = opt.charset || "gbk";
    this.schedule = null;
    this.interval = Number(opt.interval) || 3;

    this.chapters = [];
    this.index = 0;
    this.bookName = null;
    this.storyId = "";
    this.lock = false;
    this.siteOpt = WebSiteOpt[opt.site || "biquge"];
    if (opt.site === "lingdian") {
      this.siteOpt.url = opt.url;
    }
  }

  async start() {
    console.log("Book Sea! start!");

    // 拉取目录
    await this.getDirectory();

    // 创建文件夹
    let createStates = await createDir(
      path.join(__dirname, `../public/books/${this.bookName}`)
    );
    if (createStates) return;

    // 创建故事
    let story_id = await createStory(this.bookName);
    // if (!story_id) return;
    // this.storyId = story_id;

    this.schedule = new TaskScheduler(`*/${this.interval} * * * * *`, () => {
      try {
        this.requestData();
      } catch {
        console.error("请求报错, 重新请求");
        this.lock = false;
      }
    });
    this.schedule.start();
  }

  stop() {
    if (this.schedule) {
      this.schedule.stop();
      console.log("schedule is stopped.");
    } else {
      console.log("no schedule.");
    }
  }

  // 请求目录
  async getDirectory() {
    timer1.start();
    const source = await superagent.get(this.url).responseType("arraybuffer");
    console.log("拉取目录耗时: " + timer1.stop() + "s");
    source.charset && (this.charset = source.charset);
    const UTF8Data = iconv.decode(source.body, this.charset);
    const $ = cheerio.load(UTF8Data);
    this.chapters = [];
    this.bookName = $(this.siteOpt.el_book_name)
      .contents()
      .filter(function () {
        return this.nodeType == 3;
      })
      .text();
    if (!this.bookName) {
      console.log("无法获取到书名!");
      this.stop();
      return;
    }
    let content = $(this.siteOpt.el_directory);
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
    if (this.lock) return;
    if (this.index >= this.chapters.length) {
      this.stop();
      return;
    }
    this.lock = true;
    let url = this.siteOpt.url + this.chapters[this.index].href;
    // console.log("请求网址: ", url);
    timer1.start();
    const source = await superagent.get(url).responseType("arraybuffer");
    console.log("请求内容耗时: " + timer1.stop() + "s");
    source.charset && (this.charset = source.charset);
    const UTF8Data = iconv.decode(source.body, this.charset);
    const $ = cheerio.load(UTF8Data);
    this.index++;

    let data = this.extractData($);
    this.saveData(data);
    this.lock = false;
  }

  // 提取数据
  extractData(data) {
    let $ = data,
      title,
      content;
    title = $(this.siteOpt.el_title).text();
    content = $(this.siteOpt.el_content).text();
    return {
      title,
      content,
    };
  }

  // 存储数据
  async saveData(data) {
    let { title, content } = data;
    // let story_id = this.storyId;
    // 写入文件
    fs.writeFile(
      path.join(
        __dirname,
        `../public/books/${this.bookName}/No.${this.index} ${title}.txt`
      ),
      content,
      async (err) => {
        let status = err ? "保存失败" : "保存成功";
        console.log(title + " " + status);

        // timer2.start();
        // try {
        //   const Save = await Story.findOneAndUpdate(
        //     { _id: story_id, "chapters.title": { $ne: data.title } }, // 查询条件
        //     {
        //       $addToSet: {
        //         // 使用$addToSet来确保不添加重复的子文档
        //         chapters: data,
        //       },
        //     },
        //     { new: false, upsert: true } // 选项，new:true表示返回更新后的文档，upsert:true表示如果文档不存在则创建
        //   );
        //   if (Save) {
        //     console.log(title + " -- 爬取完成");
        //   } else {
        //     console.error("数据插入异常：" + Save);
        //   }
        // } catch (e) {
        //   console.error("数据库异常：" + e);
        // }
        // console.error("插入数据库耗时: " + timer2.stop() + "s");
      }
    );
  }
}

function createDir(url) {
  return new Promise((resolve, reject) => {
    fs.readdir(url, (err, dirs) => {
      if (!err) return resolve(0); // 文件夹已存在
      fs.mkdir(url, (err2) => {
        if (err2) {
          console.log("文件夹创建失败: ", err2);
          return reject(1);
        } else return resolve(0);
      });
    });
  });
}

function createStory(title) {
  return new Promise((resolve, reject) => {
    Story.find({ title }).exec((err, data) => {
      console.log(err, data);
      if (err) {
        reject("");
      } else {
        if (data.length) {
          resolve(data[0].id);
        } else {
          const insert = new Story();
          insert.title = title;
          insert.save((err2, data2) => {
            if (err2) {
              reject("");
            } else {
              resolve(data2.id);
            }
          });
        }
      }
    });
  });
}

function initBookSea(opt) {
  return new BookSea(opt);
}

module.exports = {
  initBookSea,
};
