var express = require('express');
var router = express.Router();
const conn= require('../public/javascripts/conn_mongodb')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* 查 */
router.all('/all',function(req,res){
  // 查询操作
  infoModel.find({}).exec(function(err,data){
      if(err){
          res.send("查询异常");
      }else{
          console.log("查询成功");
          res.send(data);
      }
  })
})
module.exports = router;
