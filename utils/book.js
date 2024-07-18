const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");

const currency = [];
function filter(text, str, isAll = false) {
  let arr = text.filter((v) => !!v.trim());
  let reg = new RegExp(str);
  if (isAll) {
    arr.map((v) => v.trim().replace(reg, ""));
  } else {
    let s = [0, arr.length - 1];
    s.forEach((v) => {
      arr[v] = arr[v].trim().replace(reg, "");
    });
  }
  arr = arr.filter((v) => v.trim().length > 0);
  return arr;
}

// 去除正文中的网站宣传链接,格式化换行
function make(data, exclude = "https://www.rezero.cc") {
  let filterData = filter(data.split(/(\u00A0|\n)+/), exclude);
  return filterData.join("\n\n");
}

function makeBook(name, str) {
  const url = path.join(__dirname, `../public/books/${name}`);
  // console.log("目录路径: ", url);
  fs.readdir(url, { encoding: "utf8" }, async (err, files) => {
    if (!err && files.length) {
      for (let i = 0; i < files.length; i++) {
        try {
          let chart = path.join(url, files[i]);
          await new Promise((resolve, reject) => {
            fs.readFile(chart, { encoding: "utf-8" }, (err2, data) => {
              if (!err2 && data) {
                let filterData = filter(data.split(/\u00A0/), str);
                let writeData = filterData.join("\n\n");
                fs.writeFile(chart, writeData, (err3) => {
                  if (!err3) {
                    resolve();
                  } else reject(err3);
                });
              } else reject(err2);
            });
          });
          console.log(files[i], " 处理完成");
        } catch (e) {
          console.error(files[i], "处理失败: ", e);
        }
      }
    } else {
      console.error(name, "目录读取失败: ", err || "目录是空的!");
    }
  });
}

// 创建书本索引文件
function createBookJson(name) {
  const bookPath = path.join(__dirname, `../public/books/${name}`);
  const jsonPath = path.join(__dirname, `../public/books/${name}/info.json`);
  fs.readdir(bookPath, (err, files) => {
    if (err) {
      console.error(err);
    } else {
      const reg = /^No\.(\d+)\s(.+)\.txt$/;
      let arr = [];
      files = files.filter((v) => path.extname(v) === ".txt");
      files.forEach((v) => {
        let result = v.match(reg);
        arr.push({
          sort: Number(result[1]),
          title: result[2],
          fileName: v,
        });
      });
      arr.sort((a, b) => a.sort - b.sort);
      // console.log("目录: ", arr);
      let data = {
        title: name,
        directory: arr.map((v) => {
          return {
            title: v.title,
            fileName: v.fileName,
          };
        }),
        index: arr.length,
      };
      let jsonData;
      try {
        jsonData = JSON.stringify(data);
      } catch {
        console.error("json数据转换失败");
      }
      if (!jsonData) return;
      fs.writeFile(jsonPath, jsonData, (err2) => {
        if (err2) {
          console.error(name, "json文件生成失败");
        } else {
          console.log(name, "json文件生成成功");
        }
      });
    }
  });
}

function customEncode(str, charset) {
  // 将gbk编码的文字转换为16进制的字节,字节前加%,并且16进制字母转为大写
  const buf = iconv.encode(str, charset); // 转换为字节数组
  return Array.from(
    buf,
    (byte) => "%" + byte.toString(16).padStart(2, "0").toUpperCase()
  ).join(""); // 转换为十六进制字符串
}

// 一个提取文本,图片链接,跳转链接的函数,不适用复杂结构的元素
function collect($el) {
  console.log(
    "路径: ",
    path.join("https://www.baidu.com/abc/ddd/", `../public/books`)
  );
  if (!$el) return {};
  try {
    const el = $el.first();
    let data = {};
    // get(0): 获取这个元素的原始DOM对象
    if (el.get(0).tagName === "img") {
      data = {
        url: el.attr("src"),
      };
    } else if (el.get(0).tagName === "a") {
      data = {
        href: el.attr("href"),
        text: el
          .contents()
          .filter(function () {
            return this.nodeType === 3;
          })
          .text(),
      };
    } else {
      data = {
        text: el
          .contents()
          .filter(function () {
            return this.nodeType === 3;
          })
          .text(),
      };
    }
    return data;
  } catch (e) {
    console.error("提取报错: ", e);
    throw new Error(e);
  }
}

function splitUrl(url) {
  // 正则表达式匹配协议头和路径
  const regex = /^(https?:\/\/[^\/]+)(\/[^?#]*)?.*$/i;
  const match = url.match(regex);

  if (match) {
    // 获取协议头和可能的路径部分
    const protocolAndHost = match[1];
    const path = match[2] || ""; // 如果没有路径，则默认为空字符串

    // 将协议头和路径部分按斜杠分割成数组
    return [protocolAndHost].concat(path.split("/").filter(Boolean));
  } else {
    return [];
  }
}
// 组合url和路径
function makeUrl(url, p) {
  let splitParts = splitUrl(url).filter((v) => v.length);
  const splitPath = p.split("/").filter((v) => v.length);
  return splitParts.concat(splitPath).join("/");
}

module.exports = {
  make,
  makeBook,
  createBookJson,
  customEncode,
  collect,
  makeUrl,
};
// 'fly me to the moon.'
