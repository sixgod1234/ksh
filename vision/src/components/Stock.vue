<template>
    <div class="com-container">
      <div class="com-chart" ref="ref_stock"></div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      chartInstance: null,
      allData: null,
      titleFontSize: 0,
      currentIndex: 0,
      timeId: null
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  created () {
    // 在组件创建完成后，进行回调函数的注册
    this.$socket.registerCallBack('stockData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'stockData',
      chartName: 'stock'
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timeId)
    // 在组件进行销毁的时候，进行回调函数的取消
    this.$socket.unRegisterCallBack('stockkData')
  },
  watch: {
    theme () {
      this.chartInstance.dispose()
      this.initChart()
      this.screenAdapter()
      this.updateChart()
    }
  },
  methods: {
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.ref_stock, this.theme)
      const initOption = {
        title: {
          text: '▮ 库存和销量分析',
          left: 20,
          top: 20
        },
        series: [
          {
            type: 'pie'
          }
        ]
      }
      this.chartInstance.setOption(initOption)
      // 鼠标悬停时进行清除定时器，不再切换页面
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timeId)
      })
      // 鼠标移走时，开启定时器
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },

    getData (ret) {
      // 解构赋值
      // const { data: ret } = await this.$http.get('stock')

      this.allData = ret
      // console.log(ret)
      this.updateChart()
      this.startInterval()
    },

    updateChart () {
      const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ]
      const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF']
      ]
      const start = this.currentIndex * 5
      const end = (this.currentIndex + 1) * 5
      const showData = this.allData.slice(start, end)
      const seriesArr = showData.map((item, index) => {
        return {
          type: 'pie',
          // 中心点的坐标
          center: centerArr[index],
          hoverAnimation: false, // 关闭鼠标移到饼图上的效果
          labelLine: {
            show: false// 隐藏指示线
          },
          // 让文字显示到中间
          label: {
            position: 'center',
            color: colorArr[index][0]
          },
          data: [
            {
              name: item.name + '\n' + '\n' + item.sales,
              value: item.sales,
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: colorArr[index][0]
                  },
                  {
                    offset: 1,
                    color: colorArr[index][1]
                  }
                ])
              }
            },
            {
              value: item.stock,
              itemStyle: {
                color: '#333843'
              }
            }
          ]
        }
      })
      const dataOption = {
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },

    screenAdapter () {
      this.titleFontSize = (this.$refs.ref_stock.offsetWidth / 100) * 3.6
      const innerRadius = this.titleFontSize * 2.8
      const outterRadius = this.titleFontSize * 2.5
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        series: [
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: this.titleFontSize / 1.6
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: this.titleFontSize / 1.6
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: this.titleFontSize / 1.6
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: this.titleFontSize / 1.6
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: this.titleFontSize / 2
            }
          }
        ]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },

    startInterval () {
      if (this.timeId) {
        clearInterval(this.timeId)
      }
      this.timeId = setInterval(() => {
        this.currentIndex++
        if (this.currentIndex > 1) {
          this.currentIndex = 0
        }
        this.updateChart()// 在处理完currentIndex之后，需要更新界面
      }, 5000)
    }
  }
}
</script>

<style scoped lang="scss">

</style>
