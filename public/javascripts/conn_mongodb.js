const mongoose = require('mongoose');
mongoose.set('strictQuery',true);
// mongoose.connect('mongodb://127.0.0.1:27017/syan',function(err){
//     if(err){
//         console.log("—— 连接异常 ——");
//     }else{
//         console.log("—— 连接成功 ——");
//     }
// })
// mongoose.connect('mongodb://fancier:fancier123@127.0.0.1:27027/myapp', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })

// document框架
const RoleSchema = new mongoose.Schema({
    name:{
        type: String,
        require: [true, '名称不能为空哦～']
    },
    elemental: {
        type: Number,
        validate: {
            validator: function(v) {
                return [0,1,2,3,4,5,6,7].includes(v)
            },
            message: () => '不支持未知元素类型哟～'
        }
    }
});

// Model - global(全局)
global.infoModel = mongoose.model("Role",RoleSchema,"roles");

// 共享
module.exports = mongoose;