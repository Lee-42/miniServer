// import crypto from 'crypto';

const crypto = require('crypto');

module.exports = {
    MD5_SUFFIX: 'www.biaochenxuying.cn*&^%$#',
    md5: function(pwd) {
        let md5 = crypto.createHash('md5');
        return md5.update(pwd).digest('hex');
    },
    // 响应客户端
    responseClient(res, httpCode = 500, code = 3, message = '服务端异常', data = {}) {
        let responseData = {};
        responseData.code = code;
        responseData.message = message;
        responseData.data = data;
        res.status(httpCode).json(responseData);
    }
};