const superagent = require("superagent");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const Story = require("../models/story.js");
const TaskScheduler = require("../plugins/schedule/index.js");

const website = "http://www.ibiquge.cc",
  directory = "http://www.ibiquge.cc/24";
let charset = "gbk";
let links;
async function getDirectory(url = directory) {
  const Source = await superagent.get(url).responseType("arraybuffer");
  Source.charset && (charset = Source.charset);
  const UTF8Data = iconv.decode(Source.body, charset);
  const $ = cheerio.load(UTF8Data);
  let content = $(".listmain dl");
  let title = $("dt", content).text()(
    (links = $("a", content).map((i, v) => {
      return {
        title: $(v).text(),
        link: website + $(v).attr("href"),
      };
    }))
  );
  console.log(title, links, typeof links, links[0]);
  return links;
}

let cache = [],
  index = 0;

function requestData() {
  let current = links[index];
  let obj = {
    title: current.title,
    key: index++, // 用作排序
    status: 0, // 状态:0请求中 1请求成功 2请求失败
    request: function (url = current.link) {
      superagent
        .get(url)
        .responseType("arraybuffer")
        .then((res) => {
          this.status = 1;
        })
        .catch(() => {
          this.status = 2;
        });
      return this;
    },
  };
  cache.push(obj);
}

class BookSea {
  constructor(opt) {
    this.url = opt.url;
    this.charset = opt.charset || "charset";
    this.schedule = null;
    this.interval = Number(opt.interval) || 3;
  }

  async start() {
    console.log('Book Sea! start!');
    this.schedule = new TaskScheduler(
      `*/${this.interval} * * * * *`,
      () => {
        console.log('executing')
      }
    );
  }

  stop() {
    if(this.schedule) {
      this.schedule.stop();
      console.log('schedule is stopped.')
    } else {
      console.log('no schedule.')
    }
  }

  // 请求数据
  async requestData() {
    const source = await superagent.get(url).responseType("arraybuffer");
    source.charset && (this.charset = source.charset);
    const UTF8Data = iconv.decode(source.body, this.charset);
    const $ = cheerio.load(UTF8Data);
    return $;
  }

  // 提取数据
  extractData(data) {
    let $ = data,
        title,
        text,
        next;
    text = $(".listmain dl");
    title = $("dt", content).text();
    return {
      title,
      text
    }
  }

  // 存储数据
  saveData() {
    if (storyId) {
      const Chapters = {
        title: Title,
        content: RList.join("\n"),
      };

      try {
        const Save = await Story.findOneAndUpdate(
          { _id: storyId, "chapters.title": { $ne: Chapters.title } }, // 查询条件
          {
            $addToSet: {
              // 使用$addToSet来确保不添加重复的子文档
              chapters: Chapters,
            },
          },
          { new: false, upsert: true } // 选项，new:true表示返回更新后的文档，upsert:true表示如果文档不存在则创建
        );
        if (Save) {
          isFinish = true;
          console.log(Title + " -- 爬取完成");
        } else {
          console.error("数据插入异常：" + Save);
        }
      } catch (e) {
        console.error("数据库异常：" + e);
        isFinish = true;
      }
    }
  }
}

module.exports = {
  getDirectory,
};
