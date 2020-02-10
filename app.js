const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

const route = require('./routes/index');

const mongodb = require('./core/mongodb');
//import 等语法要用到 babel 支持
require("babel-register");

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev')); // 加载日志中间件
app.use(express.json()); //加载解析json的中间件
app.use(express.urlencoded({ extended: false })); //加载解析urlencoded请求体的中间件
app.use(cookieParser()); //加载解析cookie的中间件
app.use(express.static(path.join(__dirname, 'public'))); //设置public文件夹为存放静态文件的目录
app.use(
    session({
        secret: 'miniServer',
        name: 'session_id', // 在浏览器中生成cookie的名称 key, 默认是connet.sid
        resave: true,
        saveUninitialized: true,
        cookie: { maxAge: 60 * 1000 * 30, httpOnly: true }, //过期时间
    })
)

//data server
mongodb.connect();



//路由控制器(官方)
// app.use('/', indexRouter);
route(app);



// catch 404 and forward to error handler
//捕获404错误，并转发到错误处理器
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
//开发环境下的错误处理器，将错误信息渲染error模版并显示到浏览器中
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(8100, function() {
    console.log("Server Start");
})


module.exports = app