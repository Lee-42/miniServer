/**
 * App config mudole.
 * @file 应用运行配置
 * @module app.config
 * @author 
 */

const path = require('path');
const { argv } = require('yargs');


exports.MONGDB = {
    uri: `mongodb://127.0.0.1:${argv.dbport || '27017'}/blogNode`,
    username: argv.db_username || 'DB_username',
    password: argv.db_password || 'DB_password'
}