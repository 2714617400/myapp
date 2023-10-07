const TaskScheduler = require("../plugins/schedule/index.js");
const { send } = require("../plugins/nodemailer/index.js");

const task = async function () {
  await send("17774657825@163.com", "每个星期三中午12点 发送邮件");
  return console.log(
    "允许定时任务每个星期三中午12点 发送邮件..." +
      new Date().getMinutes() +
      "-" +
      new Date().getSeconds()
  );
};

// 创建一个 每个星期三中午12点 发送邮件
module.exports = new TaskScheduler("30 * * * * *", task);
// module.exports = new TaskScheduler('0 0 12 ? * WED', task);
