const mongoose = require("mongoose");
const { FILE_HOST, IMAGE_PRE } = process.env;
const PRE = FILE_HOST + IMAGE_PRE;

function toUrl(s) {
  return s ? PRE + s : s;
}

// 这是一个嵌套文档
const ChapterSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    max: [100, "故事章节不能超过100字"],
    required: [true, "故事章节不能为空"],
  },
  content: {
    type: String,
    max: [30000, "章节内容不能超过3万字"],
  },
});

const StorySchema = new mongoose.Schema(
  {
    title: {
      // 故事名称
      type: String,
      trim: true,
      unique: true,
      required: [true, "请输入故事名称"],
    },
    author: String, // 作者
    cover: String, // 封面
    description: String, // 简介
    genres: Array, // 类型
    tag: Array, // 标签
    chapters: Array, // 故事章节
  },
  {
    timestamps: true, // 自动添加createdAt和updatedAt字段
    // id: false, // id是_id的映射,设置为false则不自动添加id映射
  }
);

StorySchema.set("toJSON", { getters: true }); // 解决get无效问题
const Story = mongoose.model("Story", StorySchema);
module.exports = Story;
