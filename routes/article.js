const Article = require('../models/article');
const { responseClient } = require('../util/util');

exports.addArticle = (req, res) => {
    // if (!req.session.userInfo) {
    // 	responseClient(res, 200, 1, '您还没登录,或者登录信息已过期，请重新登录！');
    // 	return;
    // }
    const {
        title,
        author,
        keyword,
        content,
        desc,
        img_url,
        tags,
        category,
        state,
        type,
        origin,
    } = req.body;
    let tempArticle = null;
    if (img_url) {
        tempArticle = new Article({
            title,
            author,
            keyword: keyword ? keyword.split(',') : [],
            content,
            numbers: content.length,
            desc,
            img_url,
            tags: tags ? tags.split(',') : [],
            category: category ? category.split(',') : [],
            state,
            type,
            origin,
        });
    } else {
        tempArticle = new Article({
            title,
            author,
            keyword: keyword ? keyword.split(',') : [],
            content,
            numbers: content.length,
            desc,
            tags: tags ? tags.split(',') : [],
            category: category ? category.split(',') : [],
            state,
            type,
            origin,
        });
    }

    tempArticle
        .save()
        .then(data => {
            // let article = JSON.parse(JSON.stringify(data));
            // console.log('article :', article);
            // article.create_time = timestampToTime(article.create_time);
            // article.update_time = timestampToTime(article.update_time);
            // console.log('timestampToTime :', timestampToTime(data.create_time));
            responseClient(res, 200, 0, '保存成功', data);
        })
        .catch(err => {
            console.log(err);
            responseClient(res);
        });
};