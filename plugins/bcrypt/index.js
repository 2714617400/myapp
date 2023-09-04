const bcrypt = require("bcrypt");

/**
 *
 * @param {String} password 输入的密码
 * @param {Number} rounds 哈希因子
 * @returns String
 */
const hash = function (password, rounds = 10) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, rounds, (err, hash) => {
      if (err) {
        console.error("密码哈希时出错：", err);
        reject(new Error(err));
        return;
      } else resolve(hash);
    });
  });
};

const compare = function (password, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, result) => {
      if (err) {
        console.error("密码验证时出错：", err);
        reject(new Error(err));
        return;
      }

      if (result) {
        console.log("密码正确");
      } else {
        console.log("密码错误");
      }
      resolve(result);
    });
  });
};

module.exports = {
  hash,
  compare,
};
