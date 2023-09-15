function transList(data) {
  return {
    code: 0,
    msg: "fail",
    data,
  };
}

/**
 *  Fisher-Yates 洗牌算法,随机打乱数组
 * @param {*} array
 * @returns
 */
function shuffleArray(array) {
  const newArray = [...array]; // 创建原数组的副本，以免修改原数组
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 生成随机索引
    // 交换元素位置
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

module.exports = {
  transList,
  shuffleArray,
};
