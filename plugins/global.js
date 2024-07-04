const SUCCESS = function (data) {
  return {
    status: 0,
    msg: data ? "" : "操作成功",
    result: data,
  };
};
const FAIL = function (data) {
  return {
    status: 1,
    msg: data ?? "操作失败",
  };
};

Object.assign(global, {
  SUCCESS,
  FAIL,
});
