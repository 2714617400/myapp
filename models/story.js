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
    max: [100, "故事章节不能过长"],
    required: [true, "故事章节不能为空"],
  },
  content: {
    type: String,
    max: [3000, "章节内容不能超过3万字"],
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
    description: String, // 描述或简介
    cover_image: {
      type: String,
      // get: toUrl,
    }, // 封面
    genres: Array, // 标签或类型
    chapters: [ChapterSchema], // 故事章节
  },
  {
    timestamps: true, // 自动添加createdAt和updatedAt字段
    // id: false, // id是_id的映射,设置为false则不自动添加id映射
  }
);

StorySchema.set("toJSON", { getters: true }); // 解决get无效问题
const Story = mongoose.model("Story", StorySchema);
module.exports = Story;
