const cheerio = require("cheerio");

// 内容提取配置
const config = {
  title_el: "",
  content_el: "",
  next_chapter_el: "",
  type: 0, // 分类处理
};
/**
 * @typedef {Object} Chapter
 * @property {string} title 标题
 * @property {string} content 正文
 * @property {string} next_chapter 下一章路径
 *
 * @param {string | null} content 要处理的内容
 * @returns {Chapter} 提取的章节数据
 */
function getContent(content) {
  const $ = cheerio.load(content);
  // 获取章节标题和章节内容
  const Title = $(config.title_el).text(); // 标题
  const Content = $(config.content_el).text(); // 内容
  const NextChapter = $(config.next_chapter_el)
    .filter((i, v) => {
      return $(v).text() === "下一章";
    })
    .first()
    .attr("href");

  // 处理章节内容数据
  const PList = Content.split("\n");
  const RList = [];
  for (let i = 0; i < PList.length; i++) {
    const T = PList[i].trim();
    if (Boolean(T)) {
      RList.push(T);
    }
  }

  return {
    title: Title,
    content: RList.join("\n"),
    next_chapter: NextChapter,
  };
}

module.exports = {
  getContent,
};
