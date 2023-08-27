var express = require('express');
var router = express.Router();

const UserGroup = [];

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json(UserGroup)
});
router.post('/', function(req, res, next) {
  if(!req.body.name) return res.send('请填写name');
  else if(UserGroup.find(v => v.name == req.body.name)) return res.send('该用户已存在');
  else {
    UserGroup.push(req.body);
    res.send('success!');
  }
});
router.delete('/', function(req, res, next) {
  if(!req.query.name) return res.send('请填写name');
  else if(!UserGroup.find(v => v.name == req.query.name)) return res.send('该用户不存在');
  else {
    let index = UserGroup.findIndex(v => v.name == req.query.name);
    UserGroup.splice(index, 1);
    res.send(JSON.stringify(UserGroup));
  }
});
router.put('/', function(req, res, next) {
  if(!req.body.name) return res.send('请填写name');
  else if(!UserGroup.find(v => v.name == req.body.name)) return res.send('该用户不存在');
  else {
    let index = UserGroup.findIndex(v => v.name == req.body.name);
    UserGroup[index] = req.body;
    res.json(UserGroup)
  }
});

module.exports = router;
