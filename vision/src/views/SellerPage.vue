// 针对于/sellerpage这条路径而显示出来的
// 通过组件注册的方式，要显示出Seller.vue这个组件
<template>
    <div class="com-page">
      <seller></seller>
    </div>
</template>

<script>
import Seller from '@/components/Seller'
export default {
  components: { seller: Seller },
  props: {

  },
  data () {
    return {

    }
  },
  computed: {

  },
  created () {

  },
  mounted () {

  },
  watch: {

  },
  methods: {

  }
}
</script>

<style scoped lang="less">

</style>
