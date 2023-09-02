var express = require('express');
var router = express.Router();
const conn= require('../public/javascripts/conn_mongodb')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.all('/elemental_list',function(req,res){
    // 查询操作
    let elementalGroup = ['无', '风', '岩', '雷', '草', '水', '火', '冰'];
    const elementalList = elementalGroup.map((v, i) => {
        return {
            value: i,
            label: v
        }
    })
    res.send(elementalList);
  })

/* 查 */
router.all('/all',function(req,res){
  // 查询操作
  infoModel.find({}).exec(function(err,data){
      if(err){
          res.status(400).send("查询异常");
      }else{
          console.log("查询成功");
          res.send(data);
      }
  })
})

/* 增 */ 
router.post('/save',function(req,res){
  // 添加数据 —— <name>:LIN <age>:18
  const body = req.body;
  const insert = new infoModel();
  insert.name = body.name;
  insert.elemental = body.elemental;
  insert.save(function(err,data){
      if(err){
          res.status(400).json(err.code === 11000 ? '名称重复' : err);
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
