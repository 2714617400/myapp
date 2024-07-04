var express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const superagent = require("superagent");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");

const Story = require("../models/story.js");
const upload = require("../plugins/multer");
const { customEncode } = require("../utils/book.js");
const router = express.Router();

// 搜索小说
router.get("/search", async function (req, res) {
  const { s } = req.query;
  if (!s.trim()) {
    res.json(global.FAIL("请输入书名"));
    return;
  }

  const encodedStr = customEncode(s.trim(), "GBK"); // 假设是GBK编码
  const searchUrl = `http://www.ldxsw.net/modules/article/search.php?searchkey=${encodedStr}`;
  let charset = "gbk";

  try {
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
      res.json(global.FAIL(errorText));
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
      res.json(global.SUCCESS(rowData));
    }
  } catch (e) {
    console.error("失败: ", e);
    res.json(global.FAIL(e));
  }
});

module.exports = router;
