const { responseClient } = require('../util/util');
const Project = require('../models/project');

//获取全部项目内容
exports.getProjectList = (req, res) => {
    let keyword = req.query.keyword || null;
    let state = req.query.state || '';
    let pageNum = parseInt(req.query.pageNum) || 1;
    let pageSize = parseInt(req.query.pageSize) || 10;
    let conditions = {};
    if (!state) {
      if (keyword) {
        const reg = new RegExp(keyword, 'i'); //不区分大小写
        conditions = {
          $or: [{ title: { $regex: reg } }, { content: { $regex: reg } }],
        };
      }
    } else if (state) {
      state = parseInt(state);
      if (keyword) {
        const reg = new RegExp(keyword, 'i');
        conditions = {
          $and: [
            { $or: [{ state: state }] },
            { $or: [{ title: { $regex: reg } }, { content: { $regex: reg } }] },
          ],
        };
      } else {
        conditions = { state };
      }
    }
  
    let skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
    let responseData = {
      count: 0,
      list: [],
    };
    Project.countDocuments({}, (err, count) => {
      if (err) {
        console.error('Error:' + err);
      } else {
        responseData.count = count;
        let fields = {
          title: 1,
          content: 1,
          img: 1,
          url: 1,
          // state: 1,
          start_time: 1,
          end_time: 1,
          // update_time: 1,
        }; // 待返回的字段
        let options = {
          skip: skip,
          limit: pageSize,
          sort: { end_time: -1 },
        };
        Project.find(conditions, fields, options, (error, result) => {
          if (err) {
            console.error('Error:' + error);
            // throw error;
          } else {
            responseData.list = result;
            responseClient(res, 200, 0, '操作成功！', responseData);
          }
        });
      }
    });
  };

// 增加项目
exports.addProject = (req, res) => {
    let { title, state, content, img, url, start_time, end_time } = req.body;
    Project.findOne({
        title,
    })
        .then(result => {
            if(!result){
                let project = new Project({
                    title,
                    state,
                    content,
                    img,
                    url,
                    start_time,
                    end_time
                });
                project.save()
                    .then(data => {
                        responseClient(res, 200, 0, '操作成功', data);
                    })
                    .catch(err => {
                        console.error('err: ' + err);
                        // throw err;
                    });
            }else {
                responseClient(res, 200, 1, '该项目已存在');
            }
        })
        .catch(error => {
            console.error('error: ' + error);
            responseClient(res);
        });
};


// 修改项目
exports.updateProject = (req, res) => {
    let { id, title, state, content, img, url, start_time, end_time } = req.body;

    Project.updateOne(
        { _id: id },
        {
            title,
            state: Number(state),
            content,
            img,
            url,
            start_time,
            end_time,
            update_time: new Date(),
        },
    )
    .then(result => {
        // console.log(result);
        responseClient(res, 200, 0, '操作成功', result);
    });
};

