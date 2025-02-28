var express = require("express");
const fs = require("fs");
const path = require("path");
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
  let charset = "utf8";
  const source = await superagent
    .get(
      "https://wxd1b8512951f2fc88.xtjl-p.ccg999.cn/html/article/405.html?v=1722502754"
    )
    .responseType("arraybuffer");
  source.charset && (charset = source.charset);
  const UTF8Data = iconv.decode(source.body, charset);
  const $ = cheerio.load(UTF8Data);
  console.log("提取: ", $(`head > link[rel="modulepreload"]`));
  let arr = [];
  let str = "";
  $(`head > link[rel="modulepreload"]`).each((i, el) => {
    arr.push($(el).attr("href"));
    str += `<link rel="modulepreload" crossorigin="" href="${$(el).attr(
      "href"
    )}" reportloaderror="">`;
  });
  // fs.writeFile(path.join(__dirname, `./assets/ddddd.txt`), str, (err2) => {
  //   if (err2) {
  //     console.error(1, "json文件生成失败");
  //   } else {
  //     console.log(1, "json文件生成成功");
  //   }
  // });
  console.log("get: ", str);
  for (let i = 0; i < arr.length; i++) {
    console.log("下载: ", arr[i]);
    let response = await superagent.get("https:" + arr[i]);
    response.charset && (charset = response.charset);
    const UTF8Data2 = iconv.decode(response.body, charset);
    console.log("内容: ", UTF8Data2);
    let sp = arr[i].split("/");
    let name = sp[sp.length - 1];

    await fs.writeFileSync(
      path.join(__dirname, `./assets/${name}`),
      UTF8Data2,
      (err2) => {
        if (err2) {
          console.error(1, "json文件生成失败");
        } else {
          console.log(1, "json文件生成成功");
        }
      }
    );

    // const fileStream = fs.createWriteStream(
    //   path.join(__dirname, `./assets/${name}`)
    // );
    // fileStream.write(UTF8Data2); // 直接写入响应文本
    // fileStream.on("finish", () => {
    //   fileStream.close(); // 完成写入后关闭流
    //   console.log("文件下载并保存成功");
    //   res.send("文件下载并保存成功");
    // });
    // fileStream.on("error", (error) => {
    //   console.error("写入文件时出错：", error);
    //   res.status(500).send("写入文件时发生错误");
    // });
  }
  // console.log(
  //   "提取链接: ",
  //   arr.map((v) =>
  //     v.replace("//res.wx.qq.com/mmbizappmsg/zh_CN/htmledition/js/", "")
  //   )
  // );
  res.json(new Date().getTime());
});

// 爬取网页内的图片
router.get("/get_pics", async function (req, res) {
  const { url } = req.query;
  if (!url) {
    res.send("请传入目标网页链接");
    return;
  }

  const decodeUrl = decodeURI(url); // 解码
  let charset = "gbk";
  console.log("解码: ", decodeUrl);

  try {
    timer.start();
    const source = await superagent.get(decodeUrl).responseType("arraybuffer");
    source.charset && (charset = source.charset);
    const UTF8Data = iconv.decode(source.body, charset);
    const $ = cheerio.load(UTF8Data);

    console.log("web: ", UTF8Data);
    let arr = [];
    $("img").each((i, el) => {
      arr.push($(el).attr("src"));
      console.log("1", $(el).attr("src"), arr);
    });
    res.json(arr);
  } catch (e) {
    console.error("失败: ", e);
    // res.json(global.FAIL(e));
    res.send("爬取失败");
  }
});

module.exports = router;
