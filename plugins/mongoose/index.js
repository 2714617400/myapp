/*
 * @Author: hejiaqun 17774657825@163.com
 * @Date: 2023-09-04 14:22:45
 * @LastEditors: hejiaqun 17774657825@163.com
 * @LastEditTime: 2023-09-04 14:35:46
 * @FilePath: \myapp\plugins\mongoose\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
mongoose.connect(`mongodb://${CONF.MONGO}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB 连接错误："));
db.once("open", () => {
  console.log("成功连接到 MongoDB 数据库！");
});

// 在应用程序关闭时关闭数据库连接
process.on("SIGINT", () => {
  db.close(() => {
    console.log("数据库连接已关闭");
    process.exit(0);
  });
});
