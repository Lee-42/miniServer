/**
 * 所有路由接口
 */
const user = require('./user');

module.exports = app => {
    app.post('/register', user.register);
    app.post('/login', user.login);
    app.post('/delUser', user.delUser);
    app.get('/getUserList', user.getUserList);
}