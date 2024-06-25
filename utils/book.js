const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");

const currency = [];
function filter(text, str, isAll = false) {
  let arr = text.filter((v) => !!v.trim());
  let reg = new RegExp(str, "g");
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

function make(str) {
  let filterData = filter(
    str.split(/\u00A0/),
    "零点小说网 www.ldxsw.net，最快更新魔王奶爸最新章节！"
  );
  return filterData.join("\n\n");
}

function makeBook() {
  const name = "魔王奶爸";
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
                let filterData = filter(
                  data.split(/\u00A0/),
                  "零点小说网 www.ldxsw.net，最快更新魔王奶爸最新章节！"
                );
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

module.exports = {
  make,
  makeBook,
  createBookJson,
};
// 'fly me to the moon.'
