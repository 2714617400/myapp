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
    el_author: "",
    el_cover: "",
    el_desc: "",
    el_directory: ".listmain dl dd a",
    el_title: '"#book .content h1',
    el_content: "#book #content",
  },
  lingdian: {
    url: "http://www.ldxsw.net",
    el_book_name: "#info h1",
    el_author: "#info a",
    el_cover: "#picbox img",
    el_desc: "#intro",
    el_directory: ".zjbox dl dd a",
    el_title: "#main>h1",
    el_content: "#content",
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
    this.storyId = "";
    this.lock = false;
    this.book = {
      title: "",
      author: "",
      cover: "",
      description: "",
      genres: [],
      tag: [],
      chapters: [],
    };
    this.siteOpt = WebSiteOpt[opt.site || "biquge"];
    if (opt.site === "lingdian") {
      this.siteOpt.url = opt.url;
    }
  }

  async start() {
    console.log("Book Sea! start!");

    // 拉取目录
    await this.getDirectory();
    if (this.chapters.length === 0) {
      console.error("目录是空的");
      return;
    }

    // 创建文件夹
    let createStates = await createDir(
      path.join(__dirname, `../public/books/${this.book.title}`)
    );
    if (createStates) {
      console.error(this.book.title + "文件夹创建失败");
      return;
    }

    // 创建故事
    let story_id = await createStory(this.book);
    if (!story_id) {
      console.error(this.book.title + "文档创建失败");
      return;
    }
    this.storyId = story_id;

    this.schedule = new TaskScheduler(`*/${this.interval} * * * * *`, () => {
      try {
        this.requestData();
      } catch (e) {
        console.error("数据请求异常: ", e);
        this.lock = false;
      }
    });
    this.schedule.start();
  }

  stop() {
    if (this.schedule) {
      this.schedule.stop();
      console.log("定时器已停止");
    } else {
      console.log("没有需要停止的定时器");
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
    this.book.title = $(this.siteOpt.el_book_name)
      .contents()
      .filter(function () {
        return this.nodeType === 3;
      })
      .text(); // 这种父元素包含子元素的结构,无法通过text()直接获取到父元素的文本,因为text()会返回父元素下的所有文本(包括子元素的问题).使用contents遍历父元素下的所有元素包括文本节点和注释节点,使用filter过滤出父元素的文本节点,然后对文本节点通过text()获取文本
    console.log("书名: ", this.book.title);
    if (!this.book.title) {
      console.error("书名获取失败!");
      this.stop();
      return;
    } else {
      this.book.title = Buffer.from(this.book.title.trim(), "utf8"); // 转换成utf8编码,否则文件打不开
    }

    let author = $(this.siteOpt.el_author).first().text();
    console.log("作者: ", author);
    let cover = $(this.siteOpt.el_cover).first().attr("src");
    console.log("封面: ", cover);
    let desc = $(this.siteOpt.el_desc).text();
    console.log("描述: ", desc);
    this.book.author = author ? author.trim() : "";
    this.book.cover = cover ? cover.trim() : "";
    this.book.description = desc ? desc.trim() : "";
    let content = $(this.siteOpt.el_directory);
    content.each((i, el) => {
      this.chapters.push({
        title: $(el).text(),
        href: $(el).attr("href"),
      });
    });
    console.log("目录: ", this.chapters.length);
  }

  // 请求数据
  async requestData() {
    if (this.lock) return;
    if (this.index >= this.chapters.length) {
      console.log(this.book.title + "所有章节已全部获取");
      saveChapters(this.book);
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
    title = $(this.siteOpt.el_title).first().text()?.trim();
    content = $(this.siteOpt.el_content).text();
    return {
      title,
      content,
    };
  }

  // 存储数据
  async saveData(data) {
    let { title, content } = data;
    // 写入文件
    const fileName = Buffer.from(`No.${this.index} ${title}`, "utf8");
    fs.writeFile(
      path.join(
        __dirname,
        `../public/books/${this.book.title}/${fileName}.txt`
      ),
      content,
      (err) => {
        let status = err ? "保存失败" : "保存成功";
        console.log(title + " " + status);
      }
    );
  }
}

function createDir(url) {
  return new Promise((resolve, reject) => {
    fs.readdir(url, (err) => {
      if (!err) return resolve(0); // 文件夹已存在
      fs.mkdir(url, (err2) => {
        if (err2) {
          console.error("文件夹创建失败: ", err2);
          return reject(1);
        } else return resolve(0);
      });
    });
  });
}

function createStory(book) {
  return new Promise((resolve, reject) => {
    Story.find({ title: book.title }).exec((err, data) => {
      if (err) {
        console.log("文档创建失败: ", err);
        reject("");
      } else {
        if (data.length) {
          resolve(data[0].id);
        } else {
          const insert = new Story(book);
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

function saveChapters(book) {
  return new Promise((resolve, reject) => {
    Story.findById(this.storyId).exec((err, data) => {
      if (err || data.length === 0) {
        reject("");
      } else {
        let url = path.join(__dirname, `../public/books/${book.title}/`);
        fs.readdir(url, { encoding: "utf8" }, (err1, files) => {
          if (err1) {
            console.error(book.title + "目录读取失败: ", err1);
            return;
          } else {
            insert = data[0];
            insert.chapters = files;
            insert.save((err3, data2) => {
              if (err3) {
                reject("");
              } else {
                console.log("章节保存成功");
                resolve(data2.id);
              }
            });
          }
        });
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
