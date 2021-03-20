// 业务逻辑中间件,读取某个json文件的数据
const path = require('path')
const fileUtils = require('../utils/file_utils')
module.exports = async (ctx,next)=>{
    // 根据url
    const url = ctx.request.url; // /api/seller  他的完整路径  ../data/seller.json
    let filePath = url.replace('/api',''); //去掉/api
    filePath = '../data'+filePath+'.json' //可以对应到路径../data/seller.json
    filePath = path.join(__dirname,filePath) //D:\ksh\koa2_project\data\seller.json
try{
  // 设置响应体
//   fileUtils.getFileJsonData(filePath)得到的是一个promise对象
  const ret = await fileUtils.getFileJsonData(filePath)
  ctx.response.body = ret
}catch (error){
    const errorMsg = {
        message:'读取文件内容失败，文件资源不存在',
        status:404
    }
    ctx.response.body = JSON.stringify(errorMsg)
}
  
    // console.log(filePath)
   await next()
}