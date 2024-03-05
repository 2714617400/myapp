const TaskScheduler = require("../plugins/schedule/index.js");
const Story = require("../models/story.js");
const superagent = require("superagent");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");

const header = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.95 Safari/537.36 QIHU 360SE",
};
const URL = "http://www.ibiquge.cc",
  NEXT_CHAPTER_EL = ".page_chapter a",
  TITLE_EL = ".content h1",
  CONTENT_EL = "#content";
const Reptile = (bookId, startPage, storyId, interval) => {
  if (!(bookId && startPage)) {
    console.error("BQG爬虫需要启动参数!");
    return;
  }

  let charset = "gbk",
    isFinish = true,
    target = `${URL}/${bookId}/${startPage}.html`;
  const Task = async function () {
    if (!isFinish) {
      console.log("任务进行中...");
      return;
    }
    if (!target) {
      console.log("任务结束");
      Schedule.stop();
      return;
    }

    isFinish = false;

    // 获取目标网页源码
    const Source = await superagent
      .get(target)
      .set(header)
      .responseType("arraybuffer");
    Source.charset && (charset = Source.charset);
    const UTF8Data = iconv.decode(Source.body, charset);
    const $ = cheerio.load(UTF8Data);

    // 获取下一章网址
    const NextChapter = $(NEXT_CHAPTER_EL)
      .filter((i, v) => {
        return $(v).text() === "下一章";
      })
      .first()
      .attr("href");
    target = NextChapter ? `${URL}${NextChapter}` : "";

    // 获取章节标题和章节内容
    const Title = $(TITLE_EL).text(); // 标题
    const Content = $(CONTENT_EL).text(); // 内容

    // 处理章节内容数据
    const PList = Content.split("\n");
    const RList = [];
    for (let i = 0; i < PList.length; i++) {
      const T = PList[i].trim();
      if (Boolean(T)) {
        RList.push(T);
      }
    }

    console.log("爬取章节", Title);
    // isFinish = true;

    // 保存到数据库
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
  };

  const Schedule = new TaskScheduler(
    `*/${Number(interval || 5)} * * * * *`,
    Task
  );
  return Schedule;
};

module.exports = Reptile;
