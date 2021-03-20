<template>
    <div class="com-container" @dblclick="revertMap">
      <div class="com-chart" ref="map_ref"></div>
    </div>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'
import { getProvinceMapInfo } from '@/utils/map_utils'
export default {
  data () {
    return {
      chartInstance: null,
      allData: null,
      mapData: {}// 所获取的地图省份的矢量数据
    }
  },
  created () {
  // 在组件创建完成后，进行回调函数的注册
    this.$socket.registerCallBack('mapData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'mapData',
      chartName: 'map'
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed () {
    window.removeEventListener('resize', this.screenAdapter)
    // 在组件进行销毁的时候，进行回调函数的取消
    this.$socket.unRegisterCallBack('mapData')
  },
  watch: {
    theme () {
      this.chartInstance.dispose()
      this.initChart()
      this.screenAdapter()
      this.updateChart()
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  methods: {
    async initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, this.theme)
      // 获取中国地图的矢量数据
      // http://localhost:8999/static/map/china.json
      // 由于我们现在地图矢量数据不在koa2后台不可以使用this.$http获取数据
      const ret = await axios.get('http://localhost:8999/static/map/china.json')
      this.$echarts.registerMap('china', ret.data)
      // console.log(ret.data)
      const initOption = {
        title: {
          text: '▮ 商家分布',
          left: 20,
          top: 20
        },
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            areaColor: '#2172bf',
            borderColor: '#333'
          }
        },
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical'
        }
      }
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('click', async arg => {
        // arg.name获取省份
        const provinceInfo = getProvinceMapInfo(arg.name)
        // console.log(provinceInfo)
        // 获取这个省份的地图矢量数据
        // 判断当前点击的省份数据是否存在mapData中，存在则不发起axios请求
        // console.log('mapdata', this.mapData)
        if (!this.mapData[provinceInfo.key]) {
          const ret = await axios.get(`http://localhost:8999${provinceInfo.path}`)
          this.mapData[provinceInfo.key] = ret.data
          this.$echarts.registerMap(provinceInfo.key, ret.data)
        }
        const changeOption = {
          geo: {
            map: provinceInfo.key
          }
        }
        this.chartInstance.setOption(changeOption)
      })
    },

    getData (ret) {
      // const { data: ret } = await this.$http.get('map')
      this.allData = ret
      // console.log(ret)
      this.updateChart()
    },

    updateChart () {
      // 处理图表需要的数据
      // 图例的数据
      const legendArr = this.allData.map(item => {
        return item.name
      })
      const seriesArr = this.allData.map(item => {
        // return 的这个对象就代表一个类别下的所有散点数据
        // 如果想在地图中显示散点的数据，所以我们需要给散点的图增加一个设置，coordinateSystem:geo
        return {
          type: 'effectScatter',
          // 设置涟漪效果
          rippleEffect: {
            scale: 4,
            // 空心涟漪效果
            brushType: 'stroke'
          },
          name: item.name,
          data: item.children,
          coordinateSystem: 'geo'
        }
      })
      const dataOption = {
        series: seriesArr,
        legend: {
          data: legendArr
        }
      }
      this.chartInstance.setOption(dataOption)
    },

    screenAdapter () {
      const titleFontSize = this.$refs.map_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            // 标题字体大小
            fontSize: titleFontSize
          }
        },
        // 图例图标大小
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2
          }
        }
      }
      this.chartInstance.setOption(adapterOption)
      this.chartInstance.resize()
    },

    // 回到中国地图
    revertMap () {
      const revertOption = {
        geo: {
          map: 'china'
        }
      }
      this.chartInstance.setOption(revertOption)
    }
  }
}
</script>

<style scoped lang="less">

</style>
