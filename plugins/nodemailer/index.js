const nodemailer = require("nodemailer");
/**
 * 邮箱发送
 *
 * @param  {string}  to 对方邮箱
 * @param  {string}  content 发送内容
 */

// 创建Nodemailer传输器 SMTP 或者 其他 运输机制
let transporter = nodemailer.createTransport({
  service: "163", // 使用内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
  port: 465, // SMTP 端口
  secureConnection: true, // 使用 SSL
  auth: {
    user: "doyouloveme03@163.com", // 发送方邮箱的账号
    pass: "KPZPACKBORXPSEKG", // 邮箱授权密码
  },
});

exports.send = (to, content) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(
      {
        from: `"Fancier Server" <doyouloveme03@163.com>`, // 发送方邮箱的账号
        to: to, // 邮箱接受者的账号
        subject: "Welcome to Fancer Server!", // Subject line
        // text: '"MG'Blog ?"', // 文本内容
        html: `
          <div
            style="
              background-image: url('https://s.ccg999.cn/business/138/bargain/2024/06/19/b7493202406191014359152.jpg');
              background-size: 100% auto;
              color: #6495ed;
              padding: 10px 16px;
            "
          >
            <h2>Darling:</h2>
            <p>${content}</p>
          </div>`,
      },
      (error, info) => {
        if (error) {
          reject(error);
        }
        resolve(info);
      }
    );
  });
};
