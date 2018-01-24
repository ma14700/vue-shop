<template>
  <div>
    <div class="qsearch">
      <div class="qsearch-head">
        <div class="head-left" @click="qsearchBack()">
          <i class="iconfont icon-fanhui"></i>
        </div>
        <div class="head-right">
          <input type="text" placeholder="请输入关键词" v-model="value" @blur="Seach" @keyup.enter="Seach">
          <i class="iconfont icon-sousuo2 qsearch-enter" @click="Seach"></i>
        </div>
      </div>
      <div class="qsearch-content">
        <p>热门搜索</p>
        <ul class="qsearch-content-title">
          <li v-for="(item,index) in hotGoods" :key="index" @click="searchH(item)">{{item}}</li>
        </ul>
      </div>
      <div class="qsearch-content qsearch-content2 " v-if="historySearch.length != 0">
        <p>历史搜索</p>
        <ul class="qsearch-content-title">
          <li v-for="(item,index) in historySearch" :key="index" @click="searchH(item)">{{item}}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex'
export default {
  data() {
    return {
      hotGoods: [],
      value: '',
      historySearch:[],
    }
  },

  computed: {
    // ...mapState([
    //         'searchword',
    // ]),
  },
  created() {
   this.hotData();
  },
  methods: {
    // ...mapMutations(['SEARCH_WORD','GET_SEARCH_WORD'
    // ]),
    Seach(){
      if (this.value != ' ' && this.value) {
        let id = this.value;
        this.$router.push({path:'/searchresult',query:{id}})
      }
      
    },
    qsearchBack() {
      this.$router.back()
    },
    //传输热门商品
    hotData() {
      this.$http.get('/api/search/hotsearch').then(res => {
             this.hotGoods = res.data.data;
            //  console.log(this.hotGoods)
      });
      this.$http.get('/api/search/mysearch').then(res => {
            this.historySearch = res.data.data
             if(res.data.data.length>11){
               this.historySearch = res.data.data.slice(0,10);
             }
              // console.log(this.historySearch,'hh');
      });
      
    },
    searchH(o) {
      this.value = o;
      this.Seach();
    },
    deleteSingle(){

    }
  },
  
}
</script>

<style scoped>
.head-left {
  width: 10%;
  float: left;
  height: .933333rem;
  line-height: .933333rem;
  margin-left: 2%;
}

.head-left i {
  font-size: .56rem;
  color: #afafaf
}

.head-right {
  width: 85%;
  float: right;
  height: .933333rem;
  line-height: .933333rem;
  position: relative;
  background: #f4f4f4;
  border-radius: 5px;
  margin-right: 3%;
  color: #afafaf
}

.head-right input {
  width: 90%;
  height: .8rem;
  padding: 0px;
  border: none;
  border-radius: 5px;
  padding-left: 10px;
  padding-right: 15%;
  background: #f4f4f4;
  box-sizing: border-box;
  color: #a8a8a8;
  font-size: 12px;
  line-height: 0.8rem;
}

.qsearch-head {
  margin-top: 10px;
  height: .933333rem;
}

.qsearch {
  width: 100%;
  height: 100%;
  position: fixed;
  background: #fff;
  box-sizing: border-box;
  padding:0 0.3rem;
}

.qsearch-enter {
  position: absolute;
  font-size: .453333rem;
}

.qsearch-content {
  margin-top: .533333rem;
  color: #a8a8a8;
  overflow: hidden;
}
.qsearch-content>p{
    font-size: .36rem;
}
.qsearch-content2{
  min-height: 3rem;
  overflow: visible;
  position: relative;
}
.qsearch-content-title {
  width: 100%;
  margin-top: .4rem;
  overflow: hidden;
  padding: .2rem  0 0 0 ;
}

.qsearch-content-title li {
  width: auto;
  margin-right: 4%;
  float: left;
  height: .666667rem;
  line-height: .666667rem;
  text-align: center;
  padding:0 .32rem;
  color: #a8a8a8;
  border-radius: 3px;
  margin-bottom: .266667rem;
  position: relative;
  background: #f4f4f4;
  font-size: .36rem;
}
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
</style>

