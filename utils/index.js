/*
 * @Author: hejiaqun 17774657825@163.com
 * @Date: 2023-09-06 10:20:03
 * @LastEditors: hejiaqun 17774657825@163.com
 * @LastEditTime: 2023-09-07 09:05:03
 * @FilePath: \myapp\utils\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
function transf(data) {
  return {
    code: 0,
    msg: "fail",
    data,
  };
}

module.exports = {
  transf,
};
