<template>
    <div class="com-container">
      <div class="com-chart" ref="ref_hot"></div>
      <span class="iconfont arr-left" @click="toLeft" :style="comStyle">&#xe6ef;</span>
      <span class="iconfont arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>
      <!-- 插值表达式 -->
      <span class="cat-name" :style="comStyle">{{this.catName}}</span>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'
export default {
  data () {
    return {
      chartInstance: null,
      allData: null,
      currentIndex: 0, // 当前图表展示的一级分类数据
      titleFontSize: 0
    }
  },
  computed: {
    ...mapState(['theme']),
    catName () {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.currentIndex].name
      }
    },
    comStyle () {
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    }
  },
  created () {
  // 在组件创建完成后，进行回调函数的注册
    this.$socket.registerCallBack('hotData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'hotData',
      chartName: 'hotproduct'
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    // 在组件进行销毁的时候，进行回调函数的取消
    this.$socket.unRegisterCallBack('hotData')
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
      this.chartInstance = this.$echarts.init(this.$refs.ref_hot, this.theme)
      const initOption = {
        title: {
          text: '▮ 热销商品的占比',
          left: 20,
          top: 20
        },
        legend: {
          top: '12%',
          icon: 'circle'
        },
        tooltip: {
          show: true,
          formatter: (arg) => {
            // console.log(arg.data.children)
            const thirdCategory = arg.data.children
            // 计算出所有三级分类的占比
            let total = 0
            thirdCategory.forEach(item => {
              total += item.value
            })
            let retStr = ''
            thirdCategory.forEach(item => {
              retStr += `${item.name}:${parseInt(item.value / total * 100) + '%'}
              </br>`
            })
            return retStr
          }
        },
        series: [
          {
            type: 'pie',
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true
              },
              labelLine: {
                show: false
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(initOption)
    },

    getData (ret) {
      // const { data: ret } = await this.$http.get('hotproduct')
      this.allData = ret
      // console.log(ret)
      this.updateChart()
    },

    updateChart () {
      const legendData = this.allData[this.currentIndex].children.map(item => {
        return { name: item.name }
      })
      const seriesData = this.allData[this.currentIndex].children.map(item => {
        return {
          name: item.name,
          value: item.value,
          children: item.children
        }
      })
      const dataOption = {
        legend: {
          data: legendData
        },
        series: [
          {
            data: seriesData
          }
        ]
      }
      this.chartInstance.setOption(dataOption)
    },

    screenAdapter () {
      this.titleFontSize = (this.$refs.ref_hot.offsetWidth / 100) * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        },
        series: [{
          radius: this.titleFontSize * 4.5,
          // 控制饼图的位置
          center: ['50%', '60%']
        }]
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },

    toLeft () {
      this.currentIndex--
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1
      }
      this.updateChart()
    },
    toRight () {
      this.currentIndex++
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0
      }
      this.updateChart()
    }
  }
}
</script>

<style scoped lang="less">
.arr-left{
  position: absolute;
  left: 10%;
  top: 55%;
  transform: translateY(-50%);
  cursor: pointer;
  color: aliceblue;
}
.arr-right{
  position: absolute;
  right: 10%;
  top: 55%;
  transform: translateY(-50%);
  cursor: pointer;
  color: aliceblue;
}
.cat-name{
  position: absolute;
  left: 80%;
  bottom:20px;
  color: aliceblue;
}
</style>
