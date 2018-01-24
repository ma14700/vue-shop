<template>
  <div class="loading">
    <div class="loading-wraper">
      <img src="./loading.gif">
      <p class="desc">{{title}}</p>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">
export default {
  props: {
    title: {
      type: String,
      default: '正在载入...'
    }
  },
  methods:{
    
  }
}
</script>
<style scoped>
.loading {
  width: 100%;
  text-align: center;
}
.loading-wraper{
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
}
.loading-wraper img{
  height: 1rem;
  width: 1rem;
}
.desc {
  line-height: .533333rem;
  font-size: .4rem;
  color:#999;
}
</style>

