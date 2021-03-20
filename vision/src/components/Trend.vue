<template>
    <div class="com-container">
      <div class="title" :style='comStyle'>
        <span style="font-weight:800">▮ {{showTitle}}</span>
        <span class="iconfont title-icon" @click="showChoice = !showChoice" :style='comStyle'>&#xe6eb;</span>
        <div class="select-icon" v-show="showChoice" :style="marginStyle">
          <div class="select-item" v-for="item in selectTypes" :key="item.key" @click="handleSelect(item.key)">
            {{item.text}}
          </div>
        </div>
      </div>
      <div class="com-chart" ref="trend_ref"></div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'
export default {
  props: {

  },
  components: {

  },
  data () {
    return {
      chartInstance: null,
      allData: null,
      showChoice: false, // 是否显示可选项
      choiceType: 'map',
      titleFontSize: 0// 指明标题的字体大小
    }
  },
  computed: {
    ...mapState(['theme']),
    selectTypes () {
      if (!this.allData) {
        return []
      } else {
        // 不返回已选中的到下拉列表中
        return this.allData.type.filter(item => {
          return item.key !== this.choiceType
        })
      }
    },
    showTitle () {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.choiceType].title
      }
    },
    // 给标题设置样式
    comStyle () {
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
    // 设置左边的|后下拉框应该左移
    marginStyle () {
      return {
        marginLeft: this.titleFontSize + 'px'
      }
    }
  },
  created () {
    // 在组件创建完成后，进行回调函数的注册
    this.$socket.registerCallBack('trendData', this.getData)
  },
  mounted () {
    this.initChart()
    this.$socket.send({
      action: 'getData',
      socketType: 'trendData',
      chartName: 'trend'
    })
    // this.getData()
    // 非要有页面大小发生变化
    window.addEventListener('resize', this.screenAdapter)
    // 刚刚加载页面自己主动触发一下页面适配
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    // 在组件进行销毁的时候，进行回调函数的取消
    this.$socket.unRegisterCallBack('trendData')
  },
  watch: {
    theme () {
      this.chartInstance.dispose()// 当前图表销毁
      // 重新初始化图表
      this.initChart()// 重新以最新的主题名称初始化图表对象
      this.screenAdapter() // 重新适配
      this.updateChart()// 更新图表
    }
  },
  methods: {
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme)
      const initOption = {
        xAxis: {
          type: 'category',
          // 使线条与y轴紧贴
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        },
        // 工具提示
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          top: '25%',
          left: '2%',
          right: '6%',
          bottom: '3%',
          containLabel: true
        },
        // 示例位置和样式
        legend: {
          left: '5%',
          top: '15%',
          icon: 'circle'
        }
      }
      this.chartInstance.setOption(initOption)
    },

    getData (ret) {
      // const { data: ret } = await this.$http.get('trend')
      this.allData = ret
      console.log(ret)
      this.updateChart()
    },

    updateChart () {
      // 半透明颜色值
      const colorArr1 = [
        'rgba(11,168,44,0.5)',
        'rgba(44,110,255,0.5)',
        'rgba(22,242,217,0.5)',
        'rgba(254,33,30,0.5)',
        'rgba(250,105,0,0.5)'
      ]
      // 全透明颜色值
      const colorArr2 = [
        'rgba(11,168,44,0)',
        'rgba(44,110,255,0)',
        'rgba(22,242,217,0)',
        'rgba(254,33,30,0)',
        'rgba(250,105,0,0)'
      ]
      // 类目轴的数据
      const timeArr = this.allData.common.month
      // y轴的数据 series下的数据
      // const valueArr = this.allData.map.data
      const valueArr = this.allData[this.choiceType].data
      const seriesArr = valueArr.map((item, index) => {
        return {
          name: item.name,
          type: 'line',
          data: item.data,
          // 堆叠图，下一条线是基于上一条的基础上进行叠加
          stack: this.choiceType,
          // 面积颜色填充
          areaStyle: {
            // 从上往下
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              // 0%
              {
                offset: 0,
                color: colorArr1[index]
              },
              // 100%
              {
                offset: 1,
                color: colorArr2[index]
              }
            ])
          }
        }
      })
      // 图例的数据
      const legendArr = valueArr.map(item => {
        return item.name
      })
      const dataOption = {
        xAxis: {
          data: timeArr
        },
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },

    screenAdapter () {
      this.titleFontSize = (this.$refs.trend_ref.offsetWidth / 100) * 3.6
      const adpaterOption = {
        legend: {
          itemWidth: this.titleFontSize / 1.5,
          itemHeight: this.titleFontSize / 1.5,
          itemGap: this.titleFontSize / 1.5,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        }

      }
      this.chartInstance.setOption(adpaterOption)
      this.chartInstance.resize()
    },

    handleSelect (currenType) {
      this.choiceType = currenType
      this.updateChart()
      this.showChoice = false
    }
  }
}
</script>

<style scoped lang="less">
.title {
  position: absolute;
  left: 2%;
  top:2%;
  z-index:10;
  color:aliceblue;
}
.title-icon{
  margin-left:10px;
  cursor: pointer;
}
.select-icon{
  cursor: pointer;
}
.select-icon{
  background-color: #222733;
}
</style>
