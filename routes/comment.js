const { responseClient } = require('../util/util');
const Comment = require('../models/comment');
const User = require('../models/user');
const Article = require('../models/article');


//获取全部评论


//添加一级评论
exports.addComment = (req, res) => {
    // if (!req.session.userInfo) {
    //   responseClient(res, 200, 1, '您还没登录,或者登录信息已过期，请重新登录！');
    //   return;
    // }
    
    let { article_id, user_id, content } = req.body;
    User.findById({
      _id: user_id,
    })
      .then(result => {
        // console.log('result :', result);
        if (result) {
          let userInfo = {
            user_id: result._id,
            name: result.name,
            type: result.type,
            avatar: result.avatar,
          };
          let comment = new Comment({
            article_id: article_id,
            content: content,
            user_id: user_id,
            user: userInfo,
          });
          comment
            .save()
            .then(commentResult => {
              Article.findOne({ _id: article_id }, (errors, data) => {
                if (errors) {
                  console.error('Error:' + errors);
                  // throw errors;
                } else {
                  data.comments.push(commentResult._id);
                  data.meta.comments = data.meta.comments + 1;
                  Article.updateOne(
                    { _id: article_id },
                    { comments: data.comments, meta: data.meta, is_handle: 0 },
                  )
                    .then(result => {
                      responseClient(res, 200, 0, '操作成功 ！', commentResult);
                    })
                    .catch(err => {
                      console.error('err :', err);
                      throw err;
                    });
                }
              });
            })
            .catch(err2 => {
              console.error('err :', err2);
              throw err2;
            });
        } else {
          responseClient(res, 200, 1, '用户不存在');
        }
      })
      .catch(error => {
        console.error('error :', error);
        responseClient(res);
      });
  };


// 添加第三者评论
exports.addThirdComment = (req, res) => {
  // if(!res.session.userInfo) {
  //   responseClient(res, 200, 1, '您还没有登录, 或者登录信息已经过期, 请重新登录');
  //   return;
  // }

  console.log(req.body);
  let { article_id, comment_id, user_id, content, to_user } = req.body;
  Comment.findById({ _id: comment_id })
      .then(commentResult => {
        User.findById({ _id: user_id })
            .then(userResult => {
                if(userResult) {
                  let userInfo = {
                    user_id: userResult._id,
                    name: userResult.name,
                    type: userResult.type,
                    avatar: userResult.avatar,
                  };
                  let item = {
                    user: userInfo,
                    content: content,
                    to_user: JSON.parse(to_user),
                  };
                  commentResult.other_comments.push(item);
                  Comment.updateOne(
                    { _id: comment_id },
                    {  
                      other_comments: commentResult.other_comments,
                      is_handle: 2
                    },
                  )
                  .then(result => {
                    // responseClient(res, 200, 0, '操作成功', result);
                    Article.findOne({ _id: article_id }, (errors, data) => {
                      if(errors) {
                        console.log('Error: ' + errors);
                        // throw errors;
                      }else {
                        data.meta.comments = data.meta.comments + 1;
                        Article.updateOne({ _id: article_id }, { meta: data.meta })
                          .then(ArticleResult => {
                            responseClient(res, 200, 0, '操作成功', ArticleResult);
                          })
                          .catch(err => {
                            console.log('err========:', err);
                            throw err;
                          });
                      }
                    });
                  })
                  .catch(err1 => {
                    console.error('err1: ', err1);
                    responseClient(res);
                  });
                } else {
                  responseClient(res, 200, 1, '用户不存在');
                }
            })
            .catch(error => {
              console.error('error: ', error);
              responseClient(res);
            });
      })
      .catch(error2 => {
        console.log('error2: ', error2);
        responseClient(res);
      });
};
