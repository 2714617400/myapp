require("dotenv").config(); // 加载默认环境变量
const env = process.env.NODE_ENV;
// 加载特定环境的配置文件
if (env == "development" || env === undefined) {
  require("dotenv").config({ path: ".env.development" });
} else if (env == "production") {
  require("dotenv").config({ path: ".env.production" });
}
console.log('node env: ', env)
