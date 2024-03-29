const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");

async function start() {
  fs.readFile(
    path.join(__dirname, "../public/books/若星汉天空实体版.txt"),
    async (err, data) => {
      if (err) {
        console.log("err: ", err);
        return;
      }

      var fileCon = iconv.decode(data, "GBK").toString();
      let arr = fileCon.split("\n");
      let result = [];
      arr.forEach((v) => {
        let txt = v.trim();
        if (txt && !/本文由派派txt小说/.test(txt)) {
          result.push(v.trim());
        }
      });
      console.log("读取的数据: ", result);

      let directory = path.join(__dirname, "../public/books/若星汉天空实体版");
      let status = await createDir(directory);
      if (status) return;

      //   let writeFilePath = path.join(
      //     __dirname,
      //     "../public/books/若星汉天空网络版/demo.txt"
      //   );

      let title = "序幕";
      let str = "";
      let reg = /^第[\S]+章.+/g;
      let no = 1;
      for (let i = 0; i < result.length; i++) {
        let v = result[i];
        if (v.match(reg)) {
          try {
            fs.writeFileSync(
              path.join(
                __dirname,
                `../public/books/若星汉天空实体版/No.${no}${title}.txt`
              ),
              str
            );
            no++;
          } catch (err3) {
            console.log(`${title}写入失败: `, err3);
          }
          title = v;
          str = "";
        } else {
          str += "\n\n" + v;
        }
      }
      console.log("完成!");
      //   fs.writeFile(writeFilePath, result.join("\n\n"), (err2) => {
      //     if (err2) {
      //       console.log("写入失败: ", err2);
      //     }
      //   });
    }
  );
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

module.exports = start;
