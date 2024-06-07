const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");

const currency = [];
function filter(text, str, isAll = false) {
  let arr = text.filter((v) => !!v.trim());
  let reg = new RegExp(str, "g");
  if (isAll) {
    arr.forEach((v) => v.replace(reg, ""));
  } else {
    let s = [0, arr.length - 1];
    s.forEach((v) => arr[v].replace(reg, ""));
  }
  arr = arr.filter((v) => !!v.trim());
  return arr;
}

function handle() {
  console.log(__dirname, "__dirname", iconv.decode("../public/books/", "utf8"));
  //   let url = iconv.decode(
  //     Buffer.from(path.join(__dirname, "../public/books/魔法学徒/")),
  //     "UTF-16"
  //   );
  //   let url = Buffer.from(
  //     path.join(__dirname, "../public/books/魔法学徒/"),
  //     "utf8"
  //   ).toString("ucs2");
  let url = path.join(__dirname, "../public/books/魔法学徒/");
  console.log("路径", url);
  fs.readdir(
    `f:\\CCGProject\\myapp\\public\\books\\魔法学徒\\`,
    { encoding: "utf8" },
    (err, files) => {
      console.log("读取", err, files);
    }
  );
}

module.exports = {
  handle,
};
// 'fly me to the moon.'
