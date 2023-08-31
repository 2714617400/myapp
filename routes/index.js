var express = require('express');
var router = express.Router();
const conn= require('../public/javascripts/conn_mongodb')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
