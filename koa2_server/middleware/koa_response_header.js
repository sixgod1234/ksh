// 设置响应头中间价
module.exports = async (ctx,next) => {
    const contentType = 'application/JSON;chartset=utf-8'
    ctx.set('Content-Type',contentType)
    // 设置以下允许跨域的两个响应头可以跨域
    ctx.set('Access-Control-Allow-Origin','*')
    ctx.set('Access-Control-Allow-Methods','OPTIONS,GET,PUT,POST,DELETE')
    // ctx.response.body = '{"success": true}'
    await next()
}