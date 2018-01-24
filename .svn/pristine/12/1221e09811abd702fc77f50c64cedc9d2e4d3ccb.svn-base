<template>
  <div>
       <i class="iconfont icon-zhifushibai " id="payfalse"></i>
       <p class="payP">支付失败，请返回后重试！</p>
       <div class="payBotton" @click="payReturn">返回我的订单</div>
  </div>
</template>

<script>
import { setStore, getStore, removeStore } from "../config/mUtils";
export default {
    data () {
        return {
            
        }
    },
    created () {
        
    },
    methods: {
        payReturn(){
         setStore('selected',1);
            this.$router.push('/order?selected='+ 1)
        }
    }
}
</script>
<style scoped>
#payfalse{
    width: 2.13rem;
    margin: 0 auto;
    margin-top: 2rem;
    display: block;
    font-size: 2.133333rem;
    color: #999;
}
.payP{
    width: 100%;
    text-align: center;
    font-size: 0.36rem;
    color: #999;
    letter-spacing: 2px;
}
.payBotton{
    width: 10rem;
    height: 1.333333rem;
    background:red;
    position: fixed;
    bottom: 0px;
    line-height:1.333333rem;
    text-align: center;
    font-size: 0.34rem;
    color: #fff;
}
</style>


