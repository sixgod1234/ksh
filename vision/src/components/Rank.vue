<template>
    <div class="com-container">
      <div class="com-chart" ref="ref_rank"></div>
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
      startValue: 0, // 区域缩放起点值
      endValue: 9,
      timeID: null// 定时器
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  created () {
  // 在组件创建完成后，进行回调函数的注册
    this.$socket.registerCallBack('rankData', this.getData)
  },
  mounted () {
    this.initchart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'rankData',
      chartName: 'rank'
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timeID)
    // 在组件进行销毁的时候，进行回调函数的取消
    this.$socket.unRegisterCallBack('rankData')
  },
  watch: {
    theme () {
      this.chartInstance.dispose()
      this.initchart()
      this.screenAdapter()
      this.updateChart()
    }
  },
  methods: {
    initchart () {
      this.chartInstance = this.$echarts.init(this.$refs.ref_rank, this.theme)
      const initOption = {
        title: {
          text: '▮ 地区销售排行',
          left: 20,
          top: 20
        },
        grid: {
          top: '20%',
          left: '3%',
          right: '6%',
          bottom: '3%',
          containLabel: true
        },
        // 工具提示
        tooltip: {
          show: true
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          type: 'bar'
        }]
      }
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.timeID)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },

    getData (ret) {
      // const { data: ret } = await this.$http.get('rank')
      this.allData = ret
      // 从大到小排序
      this.allData.sort((a, b) => {
        return b.value - a.value
      })
      // console.log(ret)
      this.updateChart()
      this.startInterval()
    },

    updateChart () {
      const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        ['#5052EE', '#AB6EE5']
      ]
      const provinceArr = this.allData.map(item => {
        return item.name
      })
      const valueArr = this.allData.map(item => {
        return item.value
      })
      const dataOption = {
        xAxis: {
          data: provinceArr
        },
        // 区域缩放
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue
        },
        series: [{
          data: valueArr,
          // 设置每一项的颜色
          itemStyle: {
            // arg代表每个柱子的数值
            color: (arg) => {
              let targetColorArr = null
              if (arg.value > 300) {
                targetColorArr = colorArr[0]
              } else if (arg.value > 200) {
                targetColorArr = colorArr[1]
              } else {
                targetColorArr = colorArr[2]
              }
              return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: targetColorArr[0]
                },
                {
                  offset: 1,
                  color: targetColorArr[1]
                }
              ])
            }
          }
        }]
      }
      this.chartInstance.setOption(dataOption)
    },

    screenAdapter () {
      this.titleFontSize = (this.$refs.ref_rank.offsetWidth / 100) * 3.6
      const adpaterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        series: [{
          barWidth: this.titleFontSize,
          itemStyle: {
            barBorderRadius: [this.titleFontSize / 2, this.titleFontSize / 2, 0, 0]
          }
        }]
      }
      this.chartInstance.setOption(adpaterOption)
      this.chartInstance.resize()
    },

    startInterval () {
      if (this.timeID) {
        clearInterval(this.timeID)
      }
      this.timeID = setInterval(() => {
        this.startValue++
        this.endValue++
        if (this.endValue > (this.allData.length - 1)) {
          this.startValue = 0
          this.endValue = 9
        }
        this.updateChart()
      }, 2000)
    }
  }
}
</script>

<style scoped lang="less">

</style>
