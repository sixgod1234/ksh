const fs = require('fs')
// 读取文件的工具方法
module.exports.getFileJsonData = (filePath) => {
    // return 'jhh'
    // 根据文件路径读取文件内容new
    return new Promise((resolve,reject) => {
        fs.readFile(filePath,'utf-8',(error, data) => {
            if(error){
                // 读取文件失败
                reject(error)
            }else{
                // 读取文件成功
                resolve(data)
            }
        })
    })
    // fs.readFile(filePath,'utf-8',(error, data) => {
    //     if(error){
    //         // 读取文件失败
    //     }else{
    //         // 读取文件成功
    //         // return data;
    //         //1.返回的是(error, data) => {}调用者并不是getFileJsonData调用者,所以不可以返回
    //         // 2.读取文件是异步任务,异步任务是不可以return的
    //     }
    // })
}