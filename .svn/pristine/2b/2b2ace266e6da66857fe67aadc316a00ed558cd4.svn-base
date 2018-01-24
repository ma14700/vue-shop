<template>
  <div>
    <div class="riskhead"></div>
    <mt-popup v-model="popupVisible"  >
        <div class="model-risk">
            <h1>重要提示</h1>
            <h2>请仔细阅读然后填写本报告</h2>
            <div class="model-risk-content">1.向本行第一次申请任何理财投资产品前，请填写本评估问卷，并定期进行重新评估。<br>以下11个问题将根据您的财务状况、投资经验、投资风格、投资目的、风险偏好和风险承受能力等对您进行风险评估，我们将根据评估结果为您更好的配置资产。请您认真作答，感谢您的配合！（每个问题请选择唯一选项，不可多选）<br>3.如有可能影响您自身风险承受能力的情形发生，请您在再次购买我行理财产品时主动要求重新填写风险承受能力评估问卷。<br>风险提示：投资需要承担各类风险，可能遭受资金损失。同时，投资时还应考虑本金兑付风险、市场风险、流动性风险、信用风险等各类风险。</div>
            <div class="model-risk-foot" @click="start1()">开始测试</div>
        </div>
    </mt-popup>
    <div class="riskcontent" v-for="(items,indexs) in riskList" v-if="flag==indexs && write == true">
        <p>{{items.sequence}}</p>
        <ul>
            <li class="clearfix" v-for="(item,index) in items.children"><span>{{item}}</span><span @click="contchance(index)"><i class="iconfont " :class="[bodyStatus==index ? 'icon-xuanzhong' : 'icon-quan']"></i></span></li>
        </ul>
        <div class="nextrisk" @click="nextquestion()">下一题</div>
    </div>
    <div class="riskfoot" v-if="flag == 11 && !!quence ">
        <p>您的总得分是:<span>{{quence}}分</span></p>
        <p>根据您所填的信息，我们认为您的风险承受力为：</p>
        <div class="quence-content" v-if="quence <= 15">
            <p>保守型</p>
            <!-- <div>您是一个相对保守的投资者，风险承受力较低。我们建议您配置资产时以低风险或无风险的保本型投资产品为主，如定期存款、国债、保本型理财产品、分红险、货币型/保本型基金等。</div> -->
        </div>
       <div class="quence-content" v-else-if="quence>15 && quence<36">
           <p>进取型</p>
           <!-- <div>
               您是一个比较稳健的投资者，能够承担较低的投资风险和波动，我们建议您可以购买一些风险中低等的投资产品，如财富系列人民币理财产品、万能险、债券型基金等，也可配置一定资金购买低风险投资产品。
           </div> -->
       </div>
       <div class="quence-content" v-else-if="quence>36 && quence<60">
           <p>稳健型</p>
           <!-- <div>
               您是一个比较稳健的投资者，能够承担一定的投资风险和波动，我们建议您可以购买一些风险中等的投资产品，如天富系列人民币理财产品、混合型/偏股型基金、代理金交所贵金属现货实盘合约，也可配置一定资金购买较高风险的投资产品。但请根据自身情况，合理配置购买金额，避免将生活所需流动性资金投资于期限较长的产品。
           </div> -->
       </div>
       <div class="quence-content" v-else-if="quence>60 && quence<80">
           <p>进取型</p>
           <!-- <div>您是一个积极的投资者，愿意通过承担较高的风险来换取更高的投资回报。我们建议您可适当购买一些风险较高的投资产品，如创富系列人民币理财产品、投连险、股票型基金、代理金交所贵金属现货延期交收合约等，也可配置一定资金购买中低风险投资产品以分散风险。但请根据自身财务状况合理购买高风险投资产品的金额，避免错过投资其他产品的机会。</div> -->
       </div>
       <div class="quence-content" v-else-if="quence>80">   
           <p>激进型</p>
           <!-- <div>您是一个激进的投资者，愿意通过承担高风险、高投资波动性来换取高投资回报。我们建议您可根据自身财务状况适当购买一些高风险投资产品。</div> -->
       </div>
       <div class="riskfoot-content">
                <p>评估提示：</p>
                <div>以上测评仅供参考，并未完全包括所有影响风险承受力的因素；</div>
                <div>评估结果不应视为具体的投资品种推荐，也不应作为您投资决策的最终依据;</div>
                <div>购买投资产品需要您自己判断、做出决策，并承担投资风险，投资有风险，请谨慎购买；</div>
                <div>您可根据需要，随时申请对风险承受能力做重新评估;</div>
                <div>在购买基金、本外币理财产品或者保险产品时请核对您的风险承受能力，并审慎选择相匹配的产品。</div>
        </div>
    </div>
  </div>
</template>

<script>
import { Popup } from 'mint-ui';
import { Toast } from 'mint-ui';
import { mapState, mapMutations } from 'vuex'
import { setStore, getStore, removeStore } from '../../config/mUtils'
export default {
    data(){
        return{
            popupVisible:false,
            bodyStatus:-1,
            roll:1,
            quence:null,
            flag:0,
            riskList:[{
                sequence:'1．您的年龄是:',
                children:['A.18-24岁','B. 25-50岁 ', 'C.51-60岁' , 'D.61-64岁','E.65岁及以上']
            },{
                sequence:'2. 您的家庭总资产净值为（折合人民币）（不包括自用住宅和私营企业等实业投资，包括储蓄、保险、金融投资、实物投资，并需扣除未结清贷款、信用卡账单等债务）。',
                children:['A.15万元及以下 ','B.15万元（不含）-50万元（含）','C.50万元（不含）-100万元（含）','D.100万元（不含）-600万元（含）','E.600万元（不含）以上']
            },{
                sequence:'3．在您的家庭总资产净值中，可用于金融投资(储蓄存款除外)的比例为？',
                children:['A.小于10%',' B.10%（含）至25%（不含）',' C.25%（含）至50%（不含）','D.50%及以上']
            },{
                sequence:'4．下列哪项最能说明您的投资经验：',
                children:['A.除存款、国债外，我几乎不投资其他金融产品','B.大部分投资于存款、国债等，较少投资于股票、基金等风险产品','C.资产均衡地分布于存款、国债、银行理财产品、信托产品、股票、基金等','D.大部分投资于股票、基金、外汇等高风险产品，较少投资于存款、国债']
            },{
                sequence:'5．您有多少年投资股票、基金、外汇、金融衍生产品等风险投资品的经验？',
                children:['A.没有经验','B.有经验，但少于2年','C.2（含）至5年（不含）','D.5（含）至8年（不含）','E.8年以上']
            },{
                sequence:'6．以下哪项描述最符合您的投资态度？',
                children:['A.厌恶风险，不能容忍本金损失，希望获得较低的绝对回报','B.保守投资，不希望本金损失，希望获得适度偏低的稳定回报,但是愿意承担一定幅度的收益波动','C.寻求资金的较高收益和成长性，愿意为此承担有限本金损失 ','D.希望赚取高回报，愿意为此承担较大本金损失']
            },{
                sequence:'7．本金100万元，不提供保本承诺且投资期限相同的情况下，您会选择哪一种投资机会?',
                children:['A.有100%的机会赢取1000元现金，并保证归还本金','B.有50%的机会赢取5万元现金，并有较高可能性归还本金','C.有25%的机会赢取50万元现金，并有一定的可能性损失本金','D.有10%的机会赢取100万元现金，并有较高可能性损失本金']
            },{
                sequence:'8．投资于理财、股票、基金等金融投资品(不含存款和国债)时，您可接受的最长投资期限是多久？',
                children:['A.1年以下','B.1（含）-3年（不含）','C.3（含）-5年（不含）','D.5 年及以上']
            },{
                sequence:'9．您的投资目的是？',
                children:['A.资产保值','B.资产稳健增值','C.资产迅速增值']
            },{
                sequence:'10．您的投资出现何种程度的波动时，会对您的生活造成较大影响?',
                children:['A.本金无损失，但收益未达预期','B.出现轻微本金损失','C.本金20%以内的损失','D.本金20-50% 的损失','E.本金50%以上损失']
            },{
                sequence:'11．对您而言，保本比高收益更为重要',
                children:['A.本金无损失，但收益未达预期','B.出现轻微本金损失','C.本金20%以内的损失','D.本金20-50% 的损失','E.本金50%以上损失']
            }],
            endQuence:[],
            write:null
        }
    },
    created(){
        this.start();
    },
    watch:{
       
    },
    methods:{
        start1(){
            this.popupVisible = false;
        },
        start(){
            this.$http.get('/api/risk/check').then(res=>{
                console.log(res.data.data);
                if(res.data.data == true){
                    this.startQuence();
                    this.write = false;
                    this.flag = 11;
                    this.popupVisible = false;
                }else{
                    this.popupVisible = true;
                    this.write = true;
                }   
            })
        },
        startQuence(){
            this.$http.get('/api/risk/last').then(res=>{
                console.log(res.data.data);
                this.quence = res.data.data.appraisalScore;
            })
        },
        endRoll(){
            console.log("'"+this.endQuence+"'",this.quence)
            this.$http.post('/api/risk/record',{
                AppraisalItems:"["+this.endQuence.join(',')+"]",
                AppraisalScore:this.quence,
                AppraisalResult:'D'
            }).then(res=>{
                console.log(res)
            })
        },
        contchance(index){
            this.bodyStatus = index;
            this.roll = index;
            console.log(this.roll,1)
        },
        nextquestion(){
            if(this.bodyStatus <0 || this.bodyStatus >4){
                alert('请选择')
            }else{
                this.endQuence.push(this.roll)
                this.flag ++; 
                console.log(this.roll,this.flag)
                if(this.flag == 11){
                    this.roll==0?this.roll=-2:this.roll==1?this.roll=0:this.roll==2?this.roll=2:this.roll==3?this.roll=4:this.roll==4?this.roll=5:this.roll=999;
                    this.quence = this.roll + this.quence;
                    this.endQuence = this.endQuence.reverse();
                    this.endRoll();
                }else if(this.flag == 3){
                    this.roll==0?this.roll=2:this.roll==1?this.roll=4:this.roll==2?this.roll=8:this.roll==3?this.roll=10:this.roll==4?this.roll=-10:this.roll=999;
                    this.quence = this.roll + this.quence;
                }else if(this.flag == 4){
                    this.roll==0?this.roll=0:this.roll==1?this.roll=2:this.roll==2?this.roll=6:this.roll==3?this.roll=10:this.roll==4?this.roll=-10:this.roll=999;
                    this.quence = this.roll + this.quence;
                }else if(this.flag == 1){
                    this.roll==0?this.roll=-2:this.roll==1?this.roll=0:this.roll==2?this.roll=-2:this.roll==3?this.roll=-3:this.roll==4?this.roll=-10:this.roll=999;
                    this.quence = this.roll + this.quence;
                }else if(this.flag == 2){
                    this.roll==0?this.roll=0:this.roll==1?this.roll=2:this.roll==2?this.roll=6:this.roll==3?this.roll=8:this.roll==4?this.roll=10:this.roll=999;
                    this.quence = this.roll + this.quence;
                }else if(this.flag == 5){
                    this.roll==0?this.roll=0:this.roll==1?this.roll=2:this.roll==2?this.roll=6:this.roll==3?this.roll=8:this.roll==4?this.roll=10:this.roll=999;
                    this.quence = this.roll + this.quence;
                }else if(this.flag == 6){
                    this.roll==0?this.roll=-5:this.roll==1?this.roll=4:this.roll==2?this.roll=8:this.roll==3?this.roll=10:this.roll==4?this.roll=10:this.roll=999;
                    this.quence = this.roll + this.quence;
                }else if(this.flag == 7){
                    this.roll==0?this.roll=0:this.roll==1?this.roll=4:this.roll==2?this.roll=6:this.roll==3?this.roll=10:this.roll==4?this.roll=10:this.roll=999;
                    this.quence = this.roll + this.quence;
                }else if(this.flag == 8){
                    this.roll==0?this.roll=4:this.roll==1?this.roll=6:this.roll==2?this.roll=8:this.roll==3?this.roll=10:this.roll==4?this.roll=10:this.roll=999;
                    this.quence = this.roll + this.quence;
                }else if(this.flag == 9){
                    this.roll==0?this.roll=2:this.roll==1?this.roll=6:this.roll==2?this.roll=10:this.roll==3?this.roll=10:this.roll==4?this.roll=10:this.roll=999;
                    this.quence = this.roll + this.quence;
                }else if(this.flag == 10){
                    this.roll==0?this.roll=-5:this.roll==1?this.roll=0:this.roll==2?this.roll=5:this.roll==3?this.roll=10:this.roll==4?this.roll=15:this.roll=999;
                    this.quence = this.roll + this.quence;
                }
                console.log('分数:'+this.quence);
                this.bodyStatus = -1;
                }
                console.log(this.endQuence,123);
        }
    }
}
</script>

<style scoped>
.riskhead{
    width: 10rem;
    height: 3.786667rem;
    background: url('../../assets/home/risk.png') no-repeat;
    background-size: 100% 100%;
}
.model-risk{
    width: 7.733333rem;
    height: 10.933333rem;
    background: #fff;
     border-radius: .266667rem;
}
.mint-popup{
    border-radius: .266667rem;
}
.model-risk h1,.model-risk h2{
    text-align: center;
}
.model-risk h1{
    line-height: .666667rem;
    font-size: .533333rem;
    margin-top: .4rem;
    color: #000;
}
.model-risk h2{
    line-height: .666667rem;
    font-size: .32rem;
    color: #171717;
}
.model-risk-content{
    box-sizing: border-box;
    padding: 0 .666667rem;
    line-height: .533333rem;
    color: #979797;
}
.model-risk-foot{
    margin:0 auto;
    width: 4.6rem;
    height: .933333rem;
    background: #ff6969;
    border-radius:.666667rem;
    font-size: .48rem;
    color: #fff;
    line-height: .933333rem;
    text-align: center;
    margin-top: .533333rem;
}
.riskcontent{
    box-sizing: border-box;
    padding: 0 1.293333rem;
    margin-top: .4rem;
}
.riskcontent>p{
    text-align: center;
    line-height: .8rem;
    font-size: .373333rem;
    color: #000;
    font-weight: 500;
}
.riskcontent li{
    line-height: .533333rem;
    font-size: .373333rem;
    margin-top: .533333rem;
}
.riskcontent li>span:last-child{
    float: right;
}
.riskcontent li>span:first-child{
    width: 80%;
    float: left;
}
.nextrisk{
    width: 2.4rem;
    height: .733333rem;
    line-height: .733333rem;
    text-align: center;
    font-size: .346667rem;
    color: #fff;
    margin:0 auto;
    margin-top: .666667rem;
    border-radius: .266667rem;
    background: #ff7f7f;
}
.riskfoot{
    box-sizing: border-box;
    padding: 0 1.293333rem;
    margin-top: .4rem;
}
.riskfoot>p{
    font-size: .16rem;
    color: #333;
}
.riskfoot>p:first-child{
    line-height:.666667rem;
}
.riskfoot>p>span{
    padding-left:.266667rem;
}
.quence-content>p{
    margin-top: .533333rem;
    font-size: .4rem;
    color: red;
    font-weight: 500;
    text-align: center;
}
.quence-content>div{
    line-height: .6rem;
    font-size: 12px;
    margin-top: .4rem;
    text-indent: 2em;
    color: #666;
}
.riskfoot-content>p{
    font-size: 12px;
    color: red;
}
.riskfoot-content{
    font-size: 12px;
    line-height: .4rem;
    margin-top: 0.4rem;
    margin-bottom: 0.4rem;
}
.riskfoot-content>div{
    text-indent: 2em;
    font-size: 12px;
    line-height: 0.5rem;
    color: #333;
}
</style>
