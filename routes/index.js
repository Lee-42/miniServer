/**
 * 所有路由接口
 */
const user = require('./user');
const article = require('./article');
const tag = require('./tag');
const category = require('./category');
const comment = require('./comment');
const project = require('./project');
const message = require('./message');

module.exports = app => {
    app.post('/register', user.register);
    app.post('/login', user.login);
    app.post('/delUser', user.delUser);
    app.get('/getUserList', user.getUserList);

    app.post('/addArticle', article.addArticle);
    app.post('/updateArticle', article.updateArticle);
    app.post('/delArticle', article.delArticle);
    app.get('/getArticleLIst', article.getArticleList);
    app.get('/getArticleListAdmin', article.getArticleListAdmin);
    app.post('/getArticleDetail', article.getArticleDetail);
    app.post('/likeArticle', article.likeArticle);

    app.post('/addComment', comment.addComment);
    app.post('/addThirdComment', comment.addThirdComment);
    
    app.post('/addTag', tag.addTag);
    app.post('/delTag', tag.delTag);
    app.get('/getTagList', tag.getTagList);

    app.post('/addCategory', category.addCategory);
    app.post('/delCategory', category.delCategory);
    app.get('/getCategoryList', category.getCategoryList);

    app.get('/getProjectList', project.getProjectList);
    app.post('/addProject', project.addProject);
    app.post('/updateProject', project.updateProject);

    app.get('/getMessageLIst', message.getMessageList);
    app.post('/addMessage', message.addMessage);
    app.post('/addReplyMessage', message.addReplyMessage);
    app.post('/delMessage', message.delMessage);
    app.post('/getMessageDetail', message.getMessageDetail);
}