// 服务器入口文文件
// 1.创建koa实力对象
const KOA = require('koa');
const app = new KOA();
// 2.绑定中间件
const respDurationMiddleware = require('./middleware/koa_response_duration')
const respHeaderMiddleware = require('./middleware/koa_response_header')
const respDataMiddleware = require('./middleware/koa_response_data')
app.use(respDurationMiddleware)
app.use(respHeaderMiddleware)
app.use(respDataMiddleware)
// 3.绑定端口号
app.listen(8888)

const webSocketService  = require('./service/web_socket_service')
// 开启服务端的监听，监听客户端的连接
// 当某一个客户端连接成功后，就会对中国客户端进行message事件的监听
webSocketService.listen()
function add(){

}

