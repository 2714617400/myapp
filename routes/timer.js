const timerList = [
  {
    timer: {}, // 定时器实例
    title: "xx", // 运行的任务名称-小说名称
    len: 999, // 目录数
    currentIndex: 1,
    status: 0, // 状态: 0未运行 1运行中 2暂停 3结束 4错误
    errorMsg: "", // 错误信息
  },
];

const express = require("express");
const router = express.Router();

router.get("/", function (req, res) {
  res.json(global.SUCCESS(timerList));
});

module.exports = router;
