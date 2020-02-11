/**
 * 所有路由接口
 */
const user = require('./user');
const article = require('./article');
const tag = require('./tag');
const category = require('./category');

module.exports = app => {
    app.post('/register', user.register);
    app.post('/login', user.login);
    app.post('/delUser', user.delUser);
    app.get('/getUserList', user.getUserList);

    app.post('/addArticle', article.addArticle);
    // app.post('/updateArticle', article.updateArticle);
    
    
    app.post('/addTag', tag.addTag);
    app.post('/delTag', tag.delTag);
    app.get('//getTagList', tag.getTagList);

    app.post('/addCategory', category.addCategory);
    app.post('/delCategory', category.delCategory);
    app.get('/getCategoryList', category.getCategoryList);
}