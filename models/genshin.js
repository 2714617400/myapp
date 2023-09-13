/*
 * @Author: hejiaqun 17774657825@163.com
 * @Date: 2023-09-04 14:33:08
 * @LastEditors: hejiaqun 17774657825@163.com
 * @LastEditTime: 2023-09-13 18:35:32
 * @FilePath: \myapp\models\genshin.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const mongoose = require("mongoose");
// mongoose.set('strictQuery',true);

const RoleSchema = new mongoose.Schema(
  {
    name: {
      // 角色名称
      type: String,
      trim: true,
      unique: true,
      required: [true, "名称不能为空哦～"],
    },
    elemental: {
      // 角色元素类型
      type: Number,
      validate: {
        validator: function (v) {
          return [0, 1, 2, 3, 4, 5, 6, 7].includes(v);
        },
        message: () => "不支持未知元素类型哟～",
      },
    },
    avatar: {
      // 角色头像
      type: String,
      required: [true, "头像不能为空哦～"],
      get: (v) => CONF.FILE_HOST + "/uploads/" + v,
    },
    weaponType: {
      // 武器类型: 单手剑、双手剑、弓、长柄武器、法器
      type: Number,
      validate: {
        validator: function (v) {
          if (!String(v).trim()) {
            return true;
          } else {
            return [1, 2, 3, 4, 5].includes(v);
          }
        },
        message: () => "不支持未知武器哟～",
      },
    },
    posters: Array, // 角色海报
    isGod: {
      // 是否神明
      type: Boolean,
      default: false,
    },
    godType: {
      // 七神
      type: Number,
      required: function () {
        return this.isGod;
      },
      validate: {
        validator: function (v) {
          if (!String(v).trim()) {
            return true;
          } else {
            return [1, 2, 3, 4, 5, 6, 7].includes(v);
          }
        },
        message: () => "不支持外地神明哟～",
      },
    },
    country: {
      // 国家
      type: Number,
      validate: {
        validator: function (v) {
          if (!String(v).trim()) {
            return true;
          } else {
            return [1, 2, 3, 4, 5, 6, 7].includes(v);
          }
        },
        message: () => "不支持外地哟～",
      },
    },
    speech: Array,
  },
  {
    timestamps: true, // 自动添加createdAt和updatedAt字段
  }
);

// RoleSchema.pre('save', function(next) {
//   if(this.isGod) {
//     this.schema.path('godType').required(true, 'godType is required for admin users.');
//   }
// })

RoleSchema.set("toJSON", { getters: true }); // 解决get无效问题
const Role = mongoose.model("Role", RoleSchema, "roles");
module.exports = Role;
