var express = require("express");
const fs = require("fs");
const superagent = require("superagent");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");

const Story = require("../models/story.js");
const { initTimer } = require("../utils/index.js");
const { customEncode, collect, makeUrl } = require("../utils/book.js");
const router = express.Router();
const timer = initTimer();

// 搜索小说
router.get("/search", async function (req, res) {
  const { s } = req.query;
  if (!s || !s.trim()) {
    // res.json(global.FAIL("请输入书名"));
    res.render("searchResult", { msg: "请输入书名" });
    return;
  }

  const encodedStr = customEncode(s.trim(), "GBK"); // 假设是GBK编码
  const searchUrl = `http://www.ldxsw.net/modules/article/search.php?searchkey=${encodedStr}`;
  let charset = "gbk";

  try {
    timer.start();
    const source = await superagent.get(searchUrl).responseType("arraybuffer");
    source.charset && (charset = source.charset);
    const UTF8Data = iconv.decode(source.body, charset);
    const $ = cheerio.load(UTF8Data);

    let hasErrorText = $(".blocktitle").first().text();
    if (hasErrorText) {
      let errorText;
      $(".blockcontent")
        .find("div")
        .first()
        .contents()
        .each((i, el) => {
          if (el.type === "text") {
            errorText = el.data.trim();
            return false;
          }
        });
      console.error("错误提示: ", hasErrorText, errorText);
      // res.json(global.FAIL(errorText));
      res.render("searchResult", { msg: errorText });
    } else {
      let $tr = $("#main table tbody").find("tr");
      let rowData = [];
      $tr.each((i, el) => {
        let cells = $(el).find("td");
        if (cells.length) {
          let cellData = [];
          cells.each((j, elTwo) => {
            if (j === 0) {
              let aEl = $(elTwo).find("a");
              cellData.push($(aEl).attr("href"));
              cellData.push($(aEl).text().trim());
            } else {
              cellData.push($(elTwo).text().trim());
            }
          });
          rowData.push(cellData);
        }
      });
      console.log("爬取结果: ", rowData);
      res.render("searchResult", {
        list: rowData,
        msg: "",
        consume: timer.stop(),
      });
      // res.json(global.SUCCESS(rowData));
    }
  } catch (e) {
    console.error("失败: ", e);
    // res.json(global.FAIL(e));
    res.render("searchResult", { msg: JSON.stringify(e) });
  }
});

router.get("/test", async function (req, res) {
  let charset = "gbk";
  const source = await superagent
    .get("http://www.wlwx.la/book/53832/")
    .responseType("arraybuffer");
  source.charset && (charset = source.charset);
  const UTF8Data = iconv.decode(source.body, charset);
  const $ = cheerio.load(UTF8Data);
  console.log("提取: ", collect($("#bookCover > img")));
  console.log(
    "拼接url: ",
    makeUrl("https://www.baidu.com/abc/ddd", "public/books/")
  );
  res.json(new Date().getTime());
});
module.exports = router;
