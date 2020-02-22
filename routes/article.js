const Article = require('../models/article');
const { responseClient } = require('../util/util');

// 添加文章
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


// 前台文章列表
exports.getArticleList = (req, res) => {
    let keyword = req.query.keyword || null;
    let state = req.query.state || "";
    let likes = req.query.likes || "";
    let tag_id = req.query.tag_id || "";
    let category_id = req.query.category_id || "";
    let article = req.query.article || "";
    let pageNum = parseInt(req.query.pageNum) || 1;
    let pageSize = parseInt(req.query.pageSize) || 10;

    // 如果是文章归档, 返回全部文章
    if(article) {
        pageSize = 1000;
    }
    let conditions = {};
    if(!state) {  // 草稿
        if(keyword) {
            const reg = new RegExp(keyword, 'i'); // 不区分大小写
            conditions = {
                $or: [{ title: { $regex: reg } }, { desc: { $regex: reg } }],
            };
        }
    }else if (state){  //已发布
        state = parseInt(state);
        if(keyword){
            const reg = new RegExp(keyword, 'i');
            conditions = {
                $and: [
                    { $or: [{ state: state }] },
                    {
                        $or: [
                            { title: { $regex: reg } },
                            { desc: { $regex: reg } },
                            { keyword: { $regex: reg } },
                        ],
                    },
                ],
            };
        }else {
            conditions = { state };
        }
    }

    let skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
    let responseData =  {
        count: 0,
        list: [],
    };

    Article.countDocuments({}, (err, count) => {
        if(err){
            console.log('Error: ' + err);
        }else {
            responseData.count = count;
            console.log("article count: " + count);
            // 待返回字段
            let fields = {
                title: 1,
                desc: 1,
                img_url: 1,
                tags: 1,
                category: 1,
                meta: 1,
                create_time: 1,
            };
            if(article){
                fields = {
                    title: 1,
                    create_time: 1,
                };
            }
            let options = {
                skip: skip,
                limit: pageSize,
                sort: { create_time: -1 },
            }
            Article.find(conditions, fields, options, (error, result) => {
                if(err){
                    console.log('Error: ' + error);
                    // throw error;
                }else {
                    let newList = [];
                    if(likes){
                        //根据热度likes 返回数据
                        result.sort((a, b) => {
                            return b.meta.likes - a.meta.likes;
                        });
                        responseData.list = result;
                    }else if(category_id) {
                        console.log('category_id: ', category_id);
                        // 根据 分类ID 返回数据
                        result.forEach(item => {
                            if(item.category.indexOf(category_id) > -1){
                                newList.push(item);
                            }
                        });
                        let len = newList.length;
                        responseData.count = len;
                        responseData.list = newList;
                    }else if(tag_id){
                        console.log('tag_id: ', tag_id);
                        // 根据标签 id 返回数据
                        result.forEach(item => {
                            if(item.tag.indexOf(tag_id) > -1){
                                newList.push(item);
                            }
                        });
                        let len = newList.length;
                        responseData.count = len;
                        responseData.list = newList;
                    }else if(article){
                        const archiveList = [];
                        let obj = {}
                        /// 按年份归档 文章数组
                        result.forEach((e) => {
                            let year = e.create_time.getFullYear();
                            // let month = e.create_time.getMonth();
                            if(!obj[year]){
                                obj[year] = [];
                                obj[year].push(e);
                            }else {
                                obj[year].push(e);
                            }
                        })
                        for(const key in obj){
                            if(obj.hasOwnPropwety(key)){
                                const element = obj[key];
                                let item = {};
                                item.year = element;
                                item.list = element;
                                archiveList.push(item);
                            }
                        }
                        archiveList.sort((a, b) => {
                            return b.year - a.year;
                        });
                        responseData.list = archiveList;
                    }else {
                        responseData.list = result;
                    }
                    console.log('responseData: ', responseData);
                    responseClient(res, 200, 0, '操作成功', responseData);
                }
            })
        }
    })
}


// 后台文章列表 
exports.getArticleListAdmin = (req, res) => {
    let keyword = req.query.keyword || null;
    let state = req.query.state || '';
    let likes = req.query.likes || '';
    let pageNum = parseInt(req.query.pageNum) || 1;
    let pageSize = parseInt(req.query.pageSize) || 10;
    let conditions = {};
    if (!state) {
        if (keyword) {
            const reg = new RegExp(keyword, 'i'); // 不区分大小写
            conditions = {
                $or: [{ title: { $regex: reg } }, { desc: { $regex: reg } }],
            };
        }
    } else if (state) {
        state = parseInt(state);
        if (keyword) {
            const reg = new RegExp(keyword, 'i');
            conditions = {
                $and: [
                    { $or: [{ state: state }] },
                    {
                        $or: [
                            { title: { $regex: reg } },
                            { desc: { $regex: reg } },
                            { keyword: { $regex: reg } },
                        ]
                    },
                ]
            }
        } else {
            conditions = { state };
        }
    }

    let skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
    let responseData = {
        count: 0,
        list: [],
    };
    Article.countDocuments({}, (err, count) => {
        if (err) {
            console.log('Error: ' + err);
        } else {
            responseData.count = count;
            //待返回字段
            let fields = {
                title: 1,
                author: 1,
                keyword: 1,
                // content: 1,
                desc: 1,
                img_url: 1,
                tags: 1,
                category: 1,
                state: 1,
                type: 1,
                origin: 1,
                comments: 1,
                like_User_id: 1,
                meta: 1,
                create_time: 1,
                // update_time: 1                
            };
            let options = {
                skip: skip,
                limit: pageSize,
                sort: { create_time: -1 },
            };
            Article.find(conditions, fields, options, (error, result) => {
                    if (err) {
                        console.error("Error: " + error);
                        // throw error;
                    } else {
                        if (likes) {
                            result.sort((a, b) => {
                                return b.meta.likes - a.meta.likes;
                            });
                        }
                        responseData.list = result;
                        responseClient(res, 200, 0, '操作成功!', responseData);
                    }
                })
                .catch(err => {
                    console.log(err);
                    responseClient(res);
                })
                // .populate([
                //     { path: 'tags' },
                //     { path: 'comments' },
                //     { path: 'category' }
                // ])
                // .exec((err, doc) => {

            // });
        }
    })
}


//删除文章
exports.delArticle = (req, res) => {
    let { id } = req.body;
    Article.deleteMany({ _id: id })
        .then(result => {
            if (result.n === 1) {
                responseClient(res, 200, 0, '删除成功!');
            } else {
                responseClient(res, 200, 1, '文章不存在');
            }
        })
        .catch(err => {
            console.log('err: ', err);
            responseClient(res);
        })
}

// 获取文章详情 
exports.getArticleDetail = (req, res) => {
    let { id } = req.body;
    let type = Number(req.body.type) || 1; //文章类型 => 1: 普通文章，2: 简历，3: 管理员介绍
    let filter = Number(req.body.filter) || 1; //文章的评论过滤 => 1: 过滤，2: 不过滤
    if (type === 1) {
        if (!id) {
            responseClient(res, 200, 1, '文章不存在');
            return;
        }
        Article.findOne({ _id: id }, (error, data) => {
                if (error) {
                    console.error('Error: ' + error);
                    // throw error;
                } else {
                    data.meta.views = data.meta.views + 1;
                    Article.updateOne({ _id: id }, { meta: data.meta })
                        .then(result => {
                            // console.log('data: ', data);
                            if (filter === 1) {
                                const arr = data.comments;
                                for (let i = arr.length - 1; i >= 0; i--) {
                                    const e = arr[i];
                                    if (e.state !== 1) {
                                        arr.splice(i, 1);
                                    }
                                    const newArr = e.other_comments;
                                    const length = newArr.length;
                                    if (length) {
                                        for (let j = length - 1; j >= 0; j--) {
                                            const item = newArr[j];
                                            if (item.state !== 1) {
                                                newArr.splice(j, 1);
                                            }
                                        }
                                    }
                                }
                            }
                            responseClient(res, 200, 0, '操作成功!', data);
                        })
                        .catch(err => {
                            console.log('err: ', err);
                            throw err;
                        });
                }
            })
            // .populate([{ path: 'tags' }, { path: 'category' }, { path: 'commentss' }])
            // .exec((err, doc) => {
            //     //
            // });
    } else {
        Article.findOne({ type: type }, (error, data) => {
                if (error) {
                    console.log('Error: ' + error);
                    // throw error;
                } else {
                    if (data) {
                        data.meta.views = data.meta.views + 1;
                        Article.updateOne({ type: type }, { meta: data.meta })
                            .then(result => {
                                if (filter === 1) {
                                    const arr = data.comments;
                                    for (let i = arr.length; i >= 0; i--) {
                                        const e = arr[i];
                                        if (e.state !== 1) {
                                            arr.splice(i, 1);
                                        }
                                        const newArr = e.other_comments;
                                        const length = newArr.length;
                                        if (length) {
                                            for (let j = length - 1; j >= 0; j--) {
                                                const item = newArr[j];
                                                if (item.state !== 1) {
                                                    newArr.splice(j, 1);
                                                }
                                            }
                                        }
                                    }
                                }
                                responseClient(res, 200, 0, '操作成功!', data);
                            })
                            .catch(err => {
                                console.error('err: ', err);
                                throw err;
                            });
                    } else {
                        responseClient(res, 200, 1, '文章不存在！');
                        return;
                    }
                }
            })
            // .populate([{ path: 'tags' }, { path: 'category' }, { path: 'commentss' }])
            // .exec((err, doc) => {
            //     //
            // });
    }
}

// 更新文章
exports.updateArticle = (req, res) => {
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
        id,
    } = req.body;
    Article.update({ _id: id }, {
            title,
            author,
            keyword: keyword ? keyword.split(',') : [],
            content,
            desc,
            img_url,
            tags: tags ? tags.split(',') : [],
            category: category ? category.split(',') : [],
            state,
            type,
            origin,
        }, )
        .then(result => {
            responseClient(res, 200, 0, '操作成功', result);
        })
        .catch(err => {
            console.error(err);
            responseClient(res);
        });
};