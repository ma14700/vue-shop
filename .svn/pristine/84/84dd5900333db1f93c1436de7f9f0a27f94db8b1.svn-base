<template>
  <div class="footGrab">
    <div class="footGrab-dot"  @click = "gotoAddress('/grabsingle/startindent')" >
      <img  v-bind:src="$route.path.indexOf('startindent') !== -1?foothome1:foothome" >
        <span v-bind:class="[$route.path.indexOf('startindent') !== -1?'footcolor':'footcolor1']">开始接单</span>
    </div>
    <div class="footGrab-dot" @click = "gotoAddress('/grabsingle/indenting')">
      <img  v-bind:src="$route.path.indexOf('indenting') !== -1?footparty:footparty1" >
        <span v-bind:class="[$route.path.indexOf('indenting') !== -1?'footcolor':'footcolor1']">进行中</span>
    </div>
    <div class="footGrab-dot" @click = "gotoAddress('/grabsingle/completeindent')">
      <img  v-bind:src="$route.path.indexOf('completeindent') !== -1?footshop:footshop1" >
        <span v-bind:class="[$route.path.indexOf('completeindent') !== -1?'footcolor':'footcolor1']">已完成</span>
    </div>
    <div class="footGrab-dot" @click = "gotoAddress('/grabsingle/indentcenter')">
      <img v-bind:src="$route.path.indexOf('indentcenter') !== -1?footshopcart:footshopcart1" >
        <span v-bind:class="[$route.path.indexOf('indentcenter') !== -1?'footcolor':'footcolor1']">我的</span>
    </div>
  </div>
</template>

<script>
import { Tabbar, TabItem } from 'mint-ui';
export default {
    data(){
        return {
          foothome:require('../../assets/icon/shadian.png'),
          foothome1:require('../../assets/icon/shadian1.png'),
          footparty:require('../../assets/icon/shalou1.png'),
          footparty1:require('../../assets/icon/shalou.png'),
          footshop:require('../../assets/icon/wan1.png'),
          footshop1:require('../../assets/icon/wan.png'),
          footshopcart:require('../../assets/icon/icon-wod.png'),
          footshopcart1:require('../../assets/icon/icon-wode.png'),
          footshopcenter1:require('../../assets/icon/icon-wod.png'),
          footcenter1:require('../../assets/icon/icon-wode.png'),
          footcenter:require('../../assets/icon/icon-wod.png'),
        }
    },
    methods:{
      gotoAddress(path){
        		this.$router.push(path)
        	}
    }
}
</script>
<style>
.footcolor{
  color: #d83061;
}
.footcolor1{
  color: #c2b6ca;
}
.footGrab{
  width: 10rem;
  height: 1.466667rem;
  display: flex;
  position: fixed;
  bottom: 0px;
  left: 0px;
  background: #fff;
}
.footGrab-dot{
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: #c2b6ca;
}
.footGrab-dot img{
  width: .533333rem;
  height: .533333rem;
  display: block;
  margin: 0 auto;
  margin-top: .32rem;
  margin-bottom: 6px;
}
</style>