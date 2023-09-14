require("dotenv").config(); // 加载默认环境变量

// 加载特定环境的配置文件
if (process.env.NODE_ENV == "development") {
  require("dotenv").config({ path: ".env.development" });
} else if (process.env.NODE_ENV == "production") {
  require("dotenv").config({ path: ".env.production" });
}
