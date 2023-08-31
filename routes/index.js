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

/* 增 */ 
router.get('/save',function(req,res){
  // 添加数据 —— <name>:LIN <age>:18
  let addContent = {
      name:'LIN',
      age:18
  }
  const insert = new infoModel();
  insert.name = addContent.name;
  insert.age = addContent.age;
  insert.save(function(err,data){
      if(err){
          res.send("添加异常");
      }else{
          console.log("添加成功");
          res.send(data);
      }
  });
})

/* 改 */ 
router.get('/update',function(req,res){
  // 更新文档 —— <name>:ZEN <age>:18
  let updateContent = {
      name:'ZEN',
      age:18
  }
  // 更新条件
  let querys = {
      name:'LIN',
      age:18
  }

  infoModel.updateOne(querys,updateContent,function(err){
      if(err){
          console.log("修改异常");
      }else{
          console.log("修改成功");
          res.send("{ updated : 1 , message : success }");
      }
  })
})

/* 删 */ 
router.get('/del/:id',async function(req,res){
  // 根据id来删除数据(id是唯一标识);
  console.log("id:"+ req.params.id);
  const doc = await infoModel.findById(req.params.id);
  await doc.remove(function(err){
      if(err){
          res.send("删除异常");
      }else{
          console.log("删除成功");
          res.send("{ delete : 1 , message : success }");
      }
  })
})
module.exports = router;
