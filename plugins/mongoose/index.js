const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;
// mongoose.connect(`mongodb://${CONF.MONGO}`, {
mongoose.connect(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`, {
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
