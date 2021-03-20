import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
// 引入字体图标文件
import './assets/font/iconfont.css'
import './assets/css/global.less'
import SocketService from '@/utils/socket_service'

// 对服务端进行Websocket的连接
SocketService.Instance.connect()
// 其他的组件this.$socket
Vue.prototype.$socket = SocketService.Instance
// 请求基准路径的配置
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'
Vue.prototype.$http = axios
// 将全局的echarts对象挂载到Vue的原型对象上
// this.$echarts
Vue.prototype.$echarts = window.echarts
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
