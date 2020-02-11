/**
 * Mongoose module.
 * @file 数据库模块
 * @module core/mongoose
 * @author Lee
 */

const consola = require('consola');
const CONFIG = require('../app.config.js');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');


//remove DeprecationWarning 移除弃用警告
mongoose.set('useFindAndModify', false);

//mongoose Promise
mongoose.Promise = global.Promise

//mongoose
exports.mongoose = mongoose

//自增 ID 初始化
autoIncrement.initialize(mongoose.connection)

//connect
exports.connect = () => {
    console.log('CONFIG.MONGODB.uri: ', CONFIG.MONGDB.uri);
    //连接数据库
    mongoose.connect(CONFIG.MONGDB.uri, {
        useCreateIndex: true,
        useNewUrlParser: true,
        promiseLibrary: global.Promise
    })

    //连接错误
    mongoose.connection.on('error', error => {
        consola.warn('数据库连接失败! ', error)
    })

    //连接成功
    mongoose.connection.once('open', () => {
        consola.ready('数据库连接成功! ')
    })

    //返回实例
    return mongoose
}