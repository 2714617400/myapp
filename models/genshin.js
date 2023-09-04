const mongoose = require("mongoose");
// mongoose.set('strictQuery',true);
const Host = "127.0.0.1:3000";

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    unique: true,
    required: [true, "名称不能为空哦～"],
  },
  elemental: {
    type: Number,
    validate: {
      validator: function (v) {
        return [0, 1, 2, 3, 4, 5, 6, 7].includes(v);
      },
      message: () => "不支持未知元素类型哟～",
    },
  },
  avatar: {
    type: String,
    required: [true, "头像不能为空哦～"],
    get: (v) => Host + "/uploads/" + v,
  },
});

RoleSchema.set("toJSON", { getters: true }); // 解决get无效问题
const Role = mongoose.model("Role", RoleSchema, "roles");
module.exports = Role;
