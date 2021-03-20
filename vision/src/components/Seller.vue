// 商家销量统计的横向柱状图
<template>
    <div class="com-container">
      <div class="com-chart" ref="seller_ref"></div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: {

  },
  components: {
  },
  data () {
    return {
      chartInstance: null,
      allData: null, // 服务器返回的数据
      currentPage: 1, // 当前页
      totalPage: 0, // 一共多少页
      timeId: null// 定时器标识
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  watch: {
    theme () {
      // console.log('切换主题了')
      this.chartInstance.dispose()// 当前图表销毁
      // 重新初始化图表
      this.initChart()// 重新以最新的主题名称初始化图表对象
      this.screenAdapter() // 重新适配
      this.updateChart()// 更新图表
    }
  },
  created () {
    // 在组件创建完成后，进行回调函数的注册
    this.$socket.registerCallBack('sellerData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'sellerData',
      chartName: 'seller'
    })
    window.addEventListener('resize', this.screenAdapter)
    // 页面加载完成后主动进行页面大小适配
    this.screenAdapter()
  },
  destroyed () {
    // 清除定时器
    clearInterval(this.timeId)
    // 避免内存泄漏
    window.removeEventListener('resize', this.screenAdapter)
    // 在组件进行销毁的时候，进行回调函数的取消
    this.$socket.unRegisterCallBack('sellerData')
  },
  methods: {
    // 1.初始化echartInstance对象
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, this.theme)
      // 对图表初始化配置的控制
      const initOption = {
        title: {
          text: '▮ 商家销售统计',
          textStyle: {
            fontSize: 36
          },
          left: 20,
          top: 20
        },
        // 坐标轴大小调整
        // 设置坐标轴位置，但是不包括坐标轴的文字,可以设置containLabel:true包含坐标轴文字
        grid: {
          top: '15%',
          left: '3%',
          right: '6%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category'
        },
        // 悬浮上去后每项的背景
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              width: 50,
              color: '#2D3443'
            }
          }
        },
        series: [
          {
            type: 'bar',
            barWidth: 50,
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: 'white'
              }
            },
            itemStyle: {
              barBorderRadius: [0, 33, 33, 0],
              // 指明颜色渐变方向x1,y1   x2,y2（0，0）（1，0）确定是从左往右的渐变方向
              // 指明不同百分比之下的颜色的值
              // x1,y1   x2,y2
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                // 0%状态的颜色
                {
                  offset: 0,
                  color: '#5052ee'
                },
                // 100%
                {
                  offset: 1,
                  color: '#AB6EE5'
                }
              ])
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
      // 对图表事件对象进行鼠标事件的监听
      // 鼠标悬停时进行清除定时器，不再切换页面
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timeId)
      })
      // 鼠标移走时，开启定时器
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },

    // 2.获取服务器数据
    getData (ret) {
      // http://127.0.0.1:8888/api/seller
      // 因为设置了基准路径 axios得到的对象是promise对象所以使用await
      // 解构赋值
      // const { data: ret } = await this.$http.get('seller')
      this.allData = ret
      // 对数据排序.从小到大
      this.allData.sort((a, b) => {
        return a.value - b.value
      })
      // console.log(this.allData)
      // 每5个元素显示一页
      this.totalPage = this.allData.length % 5 === 0 ? (this.allData.length) / 5 : (this.allData.length / 5 + 1)
      this.updateChart()
      // 启动定时器
      this.startInterval()
    },

    // 3.更新图表,即设置option的过程
    updateChart () {
      const start = (this.currentPage - 1) * 5 // 0
      const end = this.currentPage * 5
      // slice包含start不包含end
      const showData = this.allData.slice(start, end)
      const sellerNames = showData.map((item) => {
        return item.name
      })
      const sellerValues = showData.map((item) => {
        return item.value
      })
      const dataOption = {
        yAxis: {
          data: sellerNames
        },
        series: [
          {
            data: sellerValues
          }
        ]
      }
      // option可以设置多次且是每次进行整合，不是相互覆盖i过程
      this.chartInstance.setOption(dataOption)
    },

    startInterval () {
      // 保险操作
      if (this.timeId) {
        clearInterval(this.timeId)
      }
      this.timeId = setInterval(() => {
        this.currentPage++
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1
        }
        this.updateChart()
      }, 3000)
    },

    // 当浏览器的大小发生变化时，会调用的方法，来完成屏幕的适配
    screenAdapter () {
      // console.log(this.$refs.seller_ref.offsetWidth)
      const titleFontSize = this.$refs.seller_ref.offsetWidth / 100 * 3.6
      const adapteOption = {
        title: {
          text: '▮ 商家销售统计',
          textStyle: {
            fontSize: titleFontSize
          },
          left: 20,
          top: 20
        },
        // 坐标轴大小调整
        // 设置坐标轴位置，但是不包括坐标轴的文字,可以设置containLabel:true包含坐标轴文字
        grid: {
          top: '15%',
          left: '3%',
          right: '6%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category'
        },
        // 悬浮上去后每项的背景
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0,
            lineStyle: {
              width: titleFontSize,
              color: '#2D3443'
            }
          }
        },
        series: [
          {
            type: 'bar',
            barWidth: titleFontSize,
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: 'white'
              }
            },
            itemStyle: {
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
              // 指明颜色渐变方向x1,y1   x2,y2（0，0）（1，0）确定是从左往右的渐变方向
              // 指明不同百分比之下的颜色的值
              // x1,y1   x2,y2
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                // 0%状态的颜色
                {
                  offset: 0,
                  color: '#5052ee'
                },
                // 100%
                {
                  offset: 1,
                  color: '#AB6EE5'
                }
              ])
            }
          }
        ]
      }
      this.chartInstance.setOption(adapteOption)
      // 手动的调用图表对象resize才能产生效果
      this.chartInstance.resize()
    }
  }
}
</script>

<style scoped lang="scss">

</style>
