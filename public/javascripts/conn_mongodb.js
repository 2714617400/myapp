const mongoose = require('mongoose');
mongoose.set('strictQuery',true);
mongoose.connect('mongodb://127.0.0.1:27017/syan',function(err){
    if(err){
        console.log("—— 连接异常 ——");
    }else{
        console.log("—— 连接成功 ——");
    }
})

// document框架
const infoSchema = new mongoose.Schema({
    name:String,
    age:Number
});

// Model - global(全局)
global.infoModel = mongoose.model("syan",infoSchema,"sen");

// 共享
module.exports = mongoose;