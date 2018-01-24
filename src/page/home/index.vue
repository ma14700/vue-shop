<template>
  <div style="background:#f7f7f7">

     <header :class="{'head-flag': topFlag==true}">
      <p>
        <router-link to="/classify" tag="i" class="iconfont icon-fenlei2"></router-link>
        <img src="../../assets/home/logo.png" alt="">
        <router-link to="/center" tag="i" class="iconfont  icon-icon2"></router-link>
      </p>
     </header>
     <div>
        <router-link to="/search" tag="div" class="wraper-input">
          <input type="text" placeholder="请输入关键词">
          <i class="iconfont icon-sousuo2"></i>
        </router-link>
       <mt-swipe :auto="4000">
        <mt-swipe-item v-for="(item,index) in carouselFigure" :key="index"> <a :href="item.linkUrl" @click="carouselClick(item)"><img :src="item.imageUrl" alt="" ></a></mt-swipe-item>
      </mt-swipe>
     </div>
      <ul class="classify">
        <li v-for="(item,index) in series" :key="index"><img :src="item.thumbImg" alt="" @click="goList(item.id)"> <span>{{item.name}}</span> </li>
        <!-- <router-link to="/classify" tag="li">
          <img src="../../assets/home/youchujin.png" alt=""> <span>分类</span>
        </router-link> -->
      </ul>
      <h2 class="title">
        <i class="iconfont icon-aixin2"></i>
        推荐商品
        <!-- <span>更多<i class="iconfont icon-right"></i></span> -->
      </h2>
      <div class="recommed">
        <div>
          <img :src="recomm.goodFirstPicUrl" alt="" @click="goDetail(recomm.id)">
        </div>
        <ul class="recommed-right">
          <li v-for="(item,index) in recommList" :key="index" @click="goDetail(item.id)"><img :src="item.goodFirstPicUrl+'.240x200.jpg'" alt=""></li>
        </ul>
      </div>
      <h2 class="title"><i class="iconfont icon-aixin2"></i>猜你喜欢</h2>
      <ul class="youlike">
          <li v-for="(item,index) in likeGood" :key="index" @click="goDetail(item.id)">
            <img :src="item.goodFirstPicUrl +'.240x200.jpg'" alt="">
            <p class="good-name">{{item.goodName}}</p>
            <p class="good-price">¥<i>{{item.goodSalePrice | two}}</i><span>销量：{{item.goodSalesCount}}</span></p>
          </li>
      </ul>
      <footer></footer>
      <foot-Guide></foot-Guide>
  </div>
</template>

<script>
import { Swipe, SwipeItem } from "mint-ui";
import footGuide from '../../components/footer/footGuide'
import { MessageBox } from "mint-ui";
export default {
  data() {
    return {
      likeGood:[],
      searchCondition:{
        catId:0,
        rows:1000,
        page: 1,
      },
      series:[],
      carouselFigure:[],
      recomm:[],
      recommList:[],
      topFlag:false
    };
  },
  components:{
    footGuide,
  },
  created(){
    this.getLikeGood();
    this.getSeries();
    this.getCarouselFigure();
    this.getRecomm();
  },
  beforeRouteEnter(to, from, next){
    next(vm=>{
      if(from.name === null || from.path=='/author' || from.path=='/'){
        vm.getUnPayOrder();
      }
    });
  },
  mounted(){
     window.addEventListener('scroll', this.handleScroll)
  },
  methods:{
    getUnPayOrder(){
      this.$http.post('/api/neworder/list/unpay').then(res => {
          if(res.data.data.length>0){
            MessageBox({
              title:"提示消息",
              message:  "有" + res.data.data.length + "个订单正在等待支付",
              confirmButtonText: "去支付",
              showCancelButton: true
            }).then(action => {
              if(action == "confirm"){
              this.$router.push('/order?selected=1');
              }
            });
          }
      })
    },
    carouselClick(item) {
      this.$http.get("/api/carousel/click/" + item.id).then(res => {});
      return true;
    },
    handleScroll () {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
      if(scrollTop>100){
        this.topFlag = true;
      }else{
        this.topFlag = false;
      }
    },
    getSeries(){
      this.$http.get('/api/goodcat/series/recomm').then(res => {
          this.series = res.data.data;
      })
    },
    getRecomm(){
      this.$http
        .post("api/good/goodlist", {
          catId: 0,
          recommend: true,
          rows: 5,
          page: 1
        })
        .then(res => {
          this.recomm = res.data.data[0];
          this.recommList =res.data.data.slice(1,5);
        });
    },
    getLikeGood:function(){
      this.$http.post('/api/good/goodlist', this.searchCondition).then(res => {
          this.likeGood = res.data.data;

      })
    },
    getCarouselFigure() {
      this.$http.post("/api/carousel/list", { useType: 1 }).then(res => {
        this.carouselFigure = res.data.data.rows;
      });

    },
    goDetail(id){
      this.$router.push({path:'/goodsdetail',query:{id}})
    },
    goList(id){
      this.$router.push({path:'/goodslist',query:{id}})
    }
  },
  filters:{
    dot: function(value) {
        if (!value) {
            return value
        } else {
            if (value.length > 20) {
                return value.slice(0,20) + '...'
            } else {
                    return value
            }
        }
    },
    two: function(value) {
            if (!value) { return '' };
            return value.toFixed(2);
    },
  }
};
</script>
<style>
.mint-msgbox-confirm{
    color: #ec1019;
    font-size: .4rem;
}
.mint-msgbox-cancel{
    font-size: .4rem;
}
</style>

<style scoped>
/* .head-flag{
  height: 3.466667rem !important;
} */
::-webkit-input-placeholder {
  /* WebKit, Blink, Edge */
  color: #999999;
  font-size: .36rem
}

 :-moz-placeholder {
  /* Mozilla Firefox 4 to 18 */
  color: #999999;
  font-size: .36rem
}

 ::-moz-placeholder {
  /* Mozilla Firefox 19+ */
  color: #999999;
  font-size: .36rem
}

:-ms-input-placeholder {
  /* Internet Explorer 10-11 */
  color: #999999;
  font-size: .36rem
}

footer{
  height: 1.466667rem;
}
/*  */
header {
  height:1.466667rem;
  background: #e63835;
  box-sizing: border-box;
  padding: 0.36rem 0.4rem;
  position: fixed;
  top: 0;
  z-index: 100;
  width: 10rem;
}

header > p {
  color: #fff;
  height: 0.733333rem;
  margin-bottom: 0.36rem;
}
header > p > i {
  font-size: 0.626667rem;
  position: relative;
  top: -0.1rem;
}
header >p>i:last-child{

  float: right;
  top: 0.1rem;
}
header > p > img {
  width: 4.213333rem;
  height: 0.733333rem;
  display: inline-block;
  margin: 0 1.5rem;
}
/*  */
/*  */
.wraper-input {
    position: absolute;
    top: 1.78rem;
    z-index: 1;
    width: 100%;
    padding: 0 0.4rem;
    box-sizing: border-box;
}
.wraper-input > input {
  height: 0.933333rem;
  background: rgba(255,255,255,0.72);
  border: none;
  width: 100%;
  box-sizing: border-box;
  padding: 0 0.36rem;
  border-radius: 5px;
  color:#fff;
}
.wraper-input > input::-webkit-input-placeholder {
  color:rgba(0,0,0,0.5);
}
.wraper-input > i {
  font-size: 0.493333rem;
  color: rgba(0,0,0,0.5);
  position: absolute;
  right: 0.72rem;
  top: 0.20rem;
}
.mint-swipe {
  width: 100%;
  background: #fff;
  margin-top: 1.466667rem;
  height:5.8rem;

}
.mint-swipe img{
  width: 100%;
  height:5.8rem;
}
/*  */
/* 分类 */
.classify {
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  padding: 0.32rem 1.12rem 0.32rem;
  background-color: #fff;
}
.classify > li {
  float: left;
  width: 2.5867rem;
  padding: 0 0.44rem;
  box-sizing: border-box;
  overflow: hidden;
  margin-bottom: .2rem;
  text-align: center;
}
.classify > li > img {
  width: 1.066667rem;
  height: 1.066667rem;
  border-radius: 50%;
  margin-bottom: 0.2rem;
}
.classify > li > span{
  display: block;
  text-align: center;
  font-size: 0.32rem;
  color: #666666;
  line-height: .4rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
/* 分类 end*/
/*  */
.title {
  height: 1.2rem;
  line-height: 1.2rem;
  font-size: 0.4rem;
  padding: 0 0.32rem;
  color: #333333;
  box-sizing: border-box;
  border-top: 1px solid #efefef;
  border-bottom: 1px solid #efefef;
  margin-top:0.32rem;background-color: #fff;
}
.title > i {
  color: #ef151f;
  font-size: 0.4rem;
  margin-right: 0.2rem;
}
.title > span {
  float: right;
  color: #666;
  font-size: 0.36rem;
}
/*  */
/* youlike */
.youlike {
  width: 100%;
  overflow: hidden;background-color: #fff;
}
.youlike > li {
  width: 50%;
  box-sizing: border-box;
  border-bottom: 1px solid #f4f4f4;
  border-right: 1px solid #f4f4f4;
  float: left;
  padding: 0.32rem;
}
.youlike > li:nth-child(even) {
  border-right: 0;
}
.youlike > li > img {
  width: 100%;
  height: 3.63rem;
}
.youlike .good-name{
  font-size: .4rem;
  margin-top: .2rem;
  line-height: .5rem;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}
.youlike .good-price{
  color: #ef151f;
  font-size: .32rem;
  margin-top: .2rem;
  line-height: .5rem;
}
.youlike .good-price>span{
  color: #999999;
  float: right;
}
.youlike .good-price > i{
  font-size: .45rem;
  margin-left: 6px
}
/* youlike end */
.recommed{
  width: 100%;
  height: 4.17rem;
  overflow: hidden;
  background-color: #fff;
}
.recommed>div{
  width: 5rem;
  height: 4.17rem;
  display: inline-block;
  float: left;
  position: relative;
}
.recommed>div>img{
  width:100%;
  height:100%;
}
.recommed>div::after{
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 4.17rem;
  content: '';
  background-color: #f4f4f4;
}
.recommed .recommed-right{
  float: left;
  width: 5rem;
  overflow: hidden;
}
.recommed-right >li{
  width: 2.5rem;
  height: 2.08rem;
  float: left;
  overflow: hidden;
  position: relative;
}
.recommed-right >li:nth-of-type(n)::after{
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 4.17rem;
  content: '';
  background-color: #f4f4f4;
}
.recommed-right >li:nth-of-type(1)::before,
.recommed-right >li:nth-of-type(2)::before{
  position: absolute;
  bottom: 0;
  right: 0;
  height: 1px;
  width:100%;
  content: '';
  background-color: #f4f4f4;
}
.recommed-right >li>img{
  width: 100%;
  height: 100%;
  display: inline-block;
}
</style>


