const path = require('path')
const fileUtils = require('../utils/file_utils')
const WebSocket = require('ws')

// 后端向前端发送请求的代码
// 创建WebSocket服务端的对象，绑定的端口号是9998
const wss = new WebSocket.Server({
    port: 9998
})

// 服务端开启了监听
module.exports.listen = ()=>{
    // 对客户端的连接事件进行监听
// client:代表的是客户端的连接socket对象
wss.on('connection',client=>{
    console.log('有客户端连接成功了。。');
    // 对客户端的连接对象进行message事件的监听
    // msg：由客户端发送给服务端的数据
    client.on('message',async msg=>{
        console.log('接收了客户端发送的数据了：'+msg);
        let payload = JSON.parse(msg)
        const action = payload.action
        if(action === 'getData'){
            let filePath = '../data/'+payload.chartName+'.json'
            filePath = path.join(__dirname,filePath)
            const ret = await fileUtils.getFileJsonData(filePath)
            // 需要在服务端获取数据的基础之上增加data字段
            // data所对应的值就是某个json文件的内容
            payload.data = ret
            client.send(JSON.stringify(payload))
        }else{
            // 原封不动的将接收到数据转发到每一个处于连接的客户端
            // wss.clients //所有客户端的连接
           wss.clients.forEach(client =>{
               client.send(msg)
           })
        }
        // 由服务端向客户端发送数据
        // client.send('hello socket from backend')
    })
})
}

   