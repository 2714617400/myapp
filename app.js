var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const mongoose = require('mongoose');
mongoose.set('strictQuery',true);
mongoose.connect('mongodb://fancier:fancier123@127.0.0.1:27027/myapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB 连接错误：'));
db.once('open', () => {
  console.log('成功连接到 MongoDB 数据库！');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// 在应用程序关闭时关闭数据库连接
process.on('SIGINT', () => {
  db.close(() => {
    console.log('数据库连接已关闭');
    process.exit(0);
  });
});

module.exports = app;
