<template>
    <div class="shopcart">
        <div v-if="cartList.length != 0" style="min-height:13rem;">

            <div class="shop" v-for="(group,index) in cartList" :key="index" v-if="group.shopCartItems.length != 0 ">
                <h2><i class="iconfont icon-quan" @click="selectShop(group,index)" :class="group.isChecked?'icon-duigou':'icon-quan'"></i>{{group.goodSupplierName}}</h2>
                <ul>
                    <li v-for="(item,_index) in group.shopCartItems" :key="_index" :class="(item.goodStatus && item.skuQuantity!=0)?'':'ineffective'">
                        <div class="icon-wrp">
                            <i class="iconfont " @click="selectGood(item,index)" :class="item.isChecked?'icon-duigou':'icon-quan'" v-if="item.goodStatus && item.skuQuantity!=0"></i>
                            <span v-else>失效</span>
                        </div>
                        <img :src="item.goodFirstPicUrl" alt="">
                        <div class="good-info">
                            <p class="good-name">{{item.goodName | dot}}</p>
                            <p class="good-cly">{{proData(item.skuPropName)| dot}}</p>
                            <p class="input-wrp">
                                <i @click="reduceQuentity(item,index,_index)">－</i>
                                <input type="text" readonly unselectable="on" v-model="item.cartNum">
                                <i @click="addQuentity(item)">＋</i></p>
                        </div>
                        <div class="right">
                            <!-- <span>¥1018</span> -->
                            <p>¥{{item.skuPrice | two}}</p>
                            <p>&nbsp;</p>
                            <i class="iconfont icon-shanchu" @click="delGood(item,index,_index)"></i>
                        </div>
                    </li>

                </ul>
            </div>
            <p style="height:1.2rem"></p>
            <div class="count">
                <span>总计：¥{{totalPrice}}</span>
                <div @click="placeOrder" >结算（{{totalNum}}）</div>
            </div>
        </div>
        <div class="blank" v-else>
            购物车是空的
        </div>

        <footer></footer>
        <foot-Guide></foot-Guide>
    </div>
</template>

<script>
import footGuide from '../../components/footer/footGuide';
import { mapState, mapMutations } from 'vuex'
import { MessageBox } from 'mint-ui';
import { Toast } from 'mint-ui';
export default {
    data() {
        return {
            goodnum:1,
            isSelectAll:false,
            cartList:[],
            goods:[],//存入vuex的商品
            chooseShop:true
        }
    },
    computed:{
        totalPrice: function() {
            let totalprice = 0;
            this.cartList.forEach(function(s) {
                s.shopCartItems.forEach(g=>{
                    if (g.isChecked) {
                        totalprice += g.cartNum * g.skuPrice;
                    }
                })

            });
            return totalprice.toFixed(2);
        },
        totalNum: function() {
            let totalnum = 0;
            this.cartList.forEach(function(s) {
                s.shopCartItems.forEach(g=>{
                    if (g.isChecked) {
                        totalnum  += parseInt(g.cartNum);
                    }
                })
            })
            return totalnum;
        },

    },
    created(){
        this.getCartList();
    },
    watch:{
        cartList:function(curVal,oldVal){

        }
    },
    methods:{
        ...mapMutations(['PLACE_ORDER']),
        // 下单
        placeOrder(){
            if (this.totalNum != 0) {
                var submitCart = this.cartList.map(function(s){
                var obj = Object.assign({},s)
                var items = obj.shopCartItems.filter(function(i){
                    return !!i.isChecked;
                });
                if(items.length>0){
                    obj.shopCartItems = items;
                    return obj;
                }
                });
                this.PLACE_ORDER(submitCart);
                this.$router.push({ path: '/submitorder' });
            }else{
                Toast({
                    message: '还没有选择商品哦',
                    position: 'bottom',
                    duration: 1.5e3
                });
            }
        },
        getCartList(){
            this.$http.get('/api/shopCart/shopcartlist').then(res => {
                this.cartList = res.data.data;
            })
        },
        selectGood:function(good,index){
            var _this = this;
            this.cartList.map(function(shop,i){
                if(i != index){
                    shop.isChecked = false;
                    shop.shopCartItems.forEach((o) => {
                        _this.$set(o, "isChecked", false);
                    });
                }
            });

            this.$set(good, "isChecked", !!!good.isChecked);
            let flag = true;
            this.cartList[index].shopCartItems.forEach(function(g) {
                if(!g.isChecked){
                    flag = false;
                }
            });
            this.$set(this.cartList[index], "isChecked", flag);
        },
        selectShop:function(shop,index){
            var _this = this;
            this.cartList.map(function(s,i){
                if(index!=i){
                    if(s.isChecked){
                        s.isChecked = false;
                        s.shopCartItems.forEach((o) => {
                            _this.$set(o, "isChecked", false);
                        });
                    }
                }
            });
            this.$set(shop, "isChecked", !!!shop.isChecked);
            if(!!shop.isChecked){
                shop.shopCartItems.forEach((o) => {
                    if(o.goodStatus && o.skuQuantity !=0){
                        this.$set(o, "isChecked", true);
                    }
                })
            }else{
                shop.shopCartItems.forEach((o) => {
                this.$set(o, "isChecked", false);
                })
            }

        },

        addQuentity:function(item){
            item.cartNum++;
            this.$http.post('/api/shopCart/shopcart/', {
                "SkuInfoId": item.skuInfoId,
                "CartNum": item.cartNum,
                "CartGoodId": item.cartGoodId,
                "OperaType": 1,
                "CreateType": 0
            }).then(res => {
            })
        },
        reduceQuentity:function(item,index,_index){
            if(item.cartNum != 1){
                item.cartNum--;
                this.$http.post('/api/shopCart/shopcart/', {
                    "SkuInfoId": item.skuInfoId,
                    "CartNum": item.cartNum,
                    "CartGoodId": item.cartGoodId,
                    "OperaType": 2,
                    "CreateType": 0

                    }).then(res => {

                })
            }else{
                this.delGood();
            }


        },
        delGood:function(item,index,_index){
            MessageBox.confirm('确认要删除该商品么?', '确认删除').then(action => {
                this.cartList[index].shopCartItems.splice(_index, 1);
                this.$http.post('api/shopcart/shopcartdel?cartIds=' + item.id).then(res => {

                 })
            });
        },
        proData(pro) {
            pro = pro.split(";");
            let data = [];
            for (let i = 0; i < pro.length; i++) {
            data.push(pro[i].split(":")[1]);
            }
            return data.join(";");
        },
    },
    components:{
        footGuide,
    },

    filters:{
        dot: function(value) {
            if (!value) {
                return value
            } else {
                if (value.length > 12) {
                    return value.slice(0,12) + '...'
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

}
</script>

<style>

/* messagebox */
.mint-msgbox-confirm{
    color: #ec1019;
    font-size: .4rem;
}
.mint-msgbox-cancel{
    font-size: .4rem;
}
</style>

<style scoped>
.blank{
    text-align: center;
    font-size: .48rem;
    color: #333;
    min-height: 13.5rem;
    line-height: 12rem
}
.count{
    padding-left:  .32rem;
    background: #fff;
    height: 1.2rem;
    line-height: 1.2rem;
    font-size: .4rem;
    position: fixed;
    width: 10rem;
    box-sizing: border-box;
    bottom: 1.466667rem;
    border-top: 1px solid #eee;
}
.count>span>i{
    font-size: .48rem;
    margin-left:1px;
}
.count>span>i.icon-duigou{
    color: #ec1019;
}
.count>div{
    display: inline-block;
    float: right;
    width: 3rem;
    background: #ec1019;
    text-align: center;
    color: #fff;
}
.shopcart{
    background: #f7f7f7;
}
footer{
  height: 1.466667rem;
}
.shop{
    border-top: 1px solid #efefef;
    border-bottom: 1px solid #efefef;
    overflow: hidden;
    margin-bottom: .2rem;
    box-sizing: border-box;
    background: #fff;
}
.shop>h2{
    font-size: .4rem;
    color: #333333;
    height: .88rem;
    line-height: .88rem;
    box-sizing: border-box;
    border-bottom: 1px solid #efefef;
    padding: 0 .32rem;
}
.shop>h2>i{
    margin-right: .2rem;
    font-size: .48rem;
    margin-left:1px;
}
.shop>h2>i.icon-duigou{
    color: #ec1019;
}
.shop>ul{
    overflow: hidden;
    box-sizing: border-box;
}
.shop>ul>li:first-child{
    border: 0
}
.shop>ul>li{
    border-top: 1px solid #efefef;
    overflow: hidden;
    padding: .32rem;
}
.shop>ul>li.ineffective{
    background:#ddd;
}
.shop .icon-wrp>i{
    font-size: .48rem;
    color: #333333;
    float: left;
    margin-top: .52rem;
    margin-left:1px;
}
.shop .icon-wrp>span{
    display: block;
    float: left;
    margin-top: .52rem;
    color: #666;
}
.shop .icon-wrp>i.icon-duigou{
    color: #ec1019;
}
.shop>ul>li>img{
    width: 1.92rem;
    height: 1.6rem;
    float: left;
    margin: 0 .2rem;
}
.shop>ul>li .good-info{
    float: left;
    width: 4.6rem;
}
.good-info .good-name{
    font-size: .36rem;
    color: #333333;

}
.good-cly{
    color: #999999;
    font-size: .36rem;
    line-height: .62rem;
}
.input-wrp{

}
.input-wrp>i{
    display: block;
    width: .6rem;
    height: .6rem;
    background: #f7f7f7;
    float: left;
    line-height: .6rem;
    text-align: center;
    color: #ec1019;
}
.input-wrp>i:first-child{
    color: #333;
}
.input-wrp>input{
    width: .8rem;
    height: .6rem;
    background: #f7f7f7;
    float: left;
    border: none;
    text-align: center;
    margin: 0 2px;
    color: #333;
}
.good-name>span{
    color: #ec1019;
    float: right;
}
.shop>ul>li .right{
    float: right;
    text-align: right;
}
.shop>ul>li .right>span{
    text-decoration: line-through;
    color: #999
}
.shop>ul>li .right>p{
    line-height: .62rem;
    color: #ec1019;
    font-size: .4rem;
}
.shop>ul>li .right>i{
    font-size: .48rem;
    color: #999
}

</style>
