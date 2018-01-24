<template>
  <div class="comment">
      <div class="reviews">
        <!--  -->
        <div class="tran-head clearfix" v-if="flag == true">
            <div class="tran-head-left"><img :src="tranDetail.orderItem[0].itemPicUrl" alt="" ></div>
            <div class="tran-head-right">
                <p>订&ensp;单&ensp;号：{{tranDetail.orderDelivery.postNo}}</p>
                 <div class="pleased">描述相符：
                    <span class="all">
                        <input type="radio" name="b" value="0" v-model="inputdata" />
                        <span class="iconfont icon-huabanfuben"></span>
                        <input type="radio" name="b" value="1" v-model="inputdata" />
                        <span class="iconfont icon-huabanfuben"></span>
                        <input type="radio" name="b" value="2" v-model="inputdata" />
                        <span class="iconfont icon-huabanfuben"></span>
                        <input type="radio" name="b" value="3" v-model="inputdata" />
                        <span class="iconfont icon-huabanfuben"></span>
                        <input type="radio" name="b" value="4" v-model="inputdata" />
                        <span class="iconfont icon-huabanfuben"></span>
                        <input type="radio" name="b" value="5" v-model="inputdata" />
                        <span class="iconfont icon-huabanfuben"></span>
                    </span>
                </div>
            </div>
        </div>
        <div class="write">
            <textarea name="" id="" class="write-here" v-model="RateContent" placeholder="宝贝满足你的期待吗？说说你的购买心得，分享给想买的他们吧"></textarea>
            <ul class="picture">
                <li v-for="(item,index) in uploadFiles" :key="index">
                    <img v-lazy="item" alt="">
                    <span class="iconfont icon-guanbi little-button" @click="deleteImg(index)"></span>
                </li>
                <li v-if="uploadFiles.length < 6">
                    <i class="iconfont icon-xiangji"></i>
                    <p @click="uploadItem(file)">添加图片<br>{{uploadFiles.length}}/6</p>
                    <vue-file-upload url="/api/handler/upload" class="iconfont icon-right" name="imgFile" :auto-upload="true" :compress="uploadCompress" :filters="uploadFilters" :events="uploadEvents"></vue-file-upload>
                </li>

            </ul>
        </div>

    </div>
    <div class="confirm-reviews" @click="submitComment()">提交评论</div>
  </div>
</template>

<script>
import { Lazyload } from 'mint-ui';
import { Navbar, TabItem } from 'mint-ui';
import { Toast } from 'mint-ui';
import { Popup } from 'mint-ui';
import VueFileUpload from 'vue-file-upload-with-compress';
import { ImageCompress } from '../../config/mUtils';
import { MessageBox } from 'mint-ui';
export default {
    data() {
        var __this = this;
        return {
            tranList:[],
            tranDetail:[],
            flag:false,
            isLoading: true,
            selected: '0',
            myorder: [],
            waitPay: [],
            waitGoods: [],
            waitReceive: [],
            waitEvaluated: [],
            popupVisible: false,
            inputdata: '5',
            RateContent: null,
            commentLable: [],
            chooseLable: [],
            RateResult: '',
            RatePicture: '',
            OrderInfoId: '',
            file: [],
            files: [],
            uploadFiles: [],
            uploadEvents: {
                onCompleteUpload: function(file, res, status) {
                    if (res && res.success) {
                        __this.uploadFiles.push(res.url);
                        Toast({
                            message: res.success ? '上传成功' : res.message,
                            position: 'bottom',
                            duration: 1.5e3
                        });
                    }
                    __this.RatePicture = __this.uploadFiles.join(",");
                    console.log(__this.uploadFiles);
                },
                onBeforeUpload: function() {
                    Toast({
                        message: '正在上传..',
                        position: 'bottom',
                        duration: 1.5e3
                    });
                }
            },
            uploadFilters: [
                {
                    name: "imageFilter",
                    fn(file) {
                        var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                        if ('|jpg|png|jpeg|bmp|'.indexOf(type) == -1) {
                            //mui.toast('不支持的文件类型');
                            return false;
                        }
                        return true;
                    }
                }
            ],
            uploadCompress: {
                enable: true,
                compresor: function(file, callback) {
                    let instance = Toast({
                        message: '正在压缩..',
                        iconClass: 'compress'
                    });

                    ImageCompress(file, 0.8, 'height', function(nfile) {
                        callback(nfile);
                        instance.close();
                    });
                }
            },
        }
    },
    beforeMount() {

    },
    components: {
        VueFileUpload
    },
    created() {
        
    },
    mounted() {
        this.OrderInfoId = this.$route.query.id;
        this.transtart();
    },
    watch: {
        '$route'(to, from) {
            this.selected = this.$route.query.selected;
        },
      
    },
    computed: {

    },
    methods: {
        transtart(){
            let Id = this.$route.query.id;
            console.log(Id);
            this.$http.post('/api/neworder/detail/' + this.$route.query.id).then(res=>{
                if(res.data.message == 'success'){
                    this.tranDetail = res.data.data;
                    console.log(res);
                    let post = this.tranDetail.orderDelivery.postNo;
                    this.$http.post('/api/express',{
                        ComCode:'auto',
                        PostNo:post
                    }).then(res=>{
                        if(res.data.message == 'ok'){
                            this.tranList = res.data.data;
                            this.flag = true;
                        }else{
                            alert(res.data.message)
                        }
                    })
                }else{
                    alert(res.data.message);
                    this.$router.push('/home')
                }
            })

        },
        proData(pro) {
            pro = pro.split(";");
            let data = [];
            for (let i = 0; i < pro.length; i++) {
                data.push(pro[i].split(":")[1]);
            }
            return data.join(";");
        },
        deleteImg(index) {
            this.uploadFiles.splice(index, 1);
            this.RatePicture = this.uploadFiles.join(",");
        },
        // 评论标签列表
        getCommentLable() {
            this.$http.get('/api/ratelabel/list'+ this.$route.query.id).then(res => {
                this.commentLable = res.data.data
            })
        },
        // 评论
        submitComment() {
            if(this.RateContent != null){
                this.$http.post('/api/neworder/evaluate/'+this.$route.query.id, {
                "RateContent": this.RateContent,
                "OrderId": this.OrderInfoId,
                "RateScore": this.inputdata,
                "RatePicture": this.RatePicture,
            }).then(res => {
                if (res.data.success) {
                    MessageBox({
                        title: '评价成功',
                        message: '',
                        confirmButtonText: '完成',
                        closeOnClickModal:false
                    }).then(action => {
                       location.href="/order?selected=0";
                       //this.$router.push({ path: '/myorder?selected=4' });
                    });
                } else {
                    MessageBox({
                        title: '网络超时，请稍后重试',
                        message: '',
                        confirmButtonText: '好的',
                        closeOnClickModal:false
                    }).then(action => {

                    });
                }
            })
            this.popupVisible = false;
            }else{
                Toast({
                        message: '评价内容不能为空哦',
                        position: 'bottom',
                        duration: 1.5e3
                });
            }

        },
     

       

        //上传图片
        onStatus(file) {
            if (file.isSuccess) {
                return "上传成功";
            } else if (file.isError) {
                return "上传失败";
            } else if (file.isUploading) {
                return "正在上传";
            } else {
                return "待上传";
            }
        },
        onAddItem(files) {
            this.files = files;
        },
        uploadItem(file) {
            //单个文件上传
            file.upload();
        },
        uploadAll() {
            //上传所有文件
            this.$refs.vueFileUploader.uploadAll();
        },
        clearAll() {
            //清空所有文件
            this.$refs.vueFileUploader.clearAll();
        }

    },
    filters: {
        //保留两位小数点
        two: function(value) {
            if (!value) { return '' };
            return value.toFixed(2);
        },
        dot: function(value) {
            if (value.length > 18) {
                return value.slice(0, 18) + '...'
            } else {
                return value
            }

        }
    }
}
</script>

<style scoped>
.tran-head{
    box-sizing: border-box;
    background: #fff;
    overflow: hidden;
}
.tran-head:before{
  clear: both;
}
.tran-head-left{
    width: 1.92rem;
    margin-right:0.2rem;
    float: left;
    border: 1px solid #eee;
}
.tran-head-left>img{
    width: 1.92rem;
    height: 1.6rem;

}
.trans{
    width: 10rem;
    box-sizing: border-box;
}

.tran-head-right>p{
    font-size: .4rem;
    color: #333;
    font-weight: 500;
    margin-top: .2rem;
}
.tran-head-right div>p{
    line-height: .533333rem;
    font-size: .346667rem;
    color: #999999;
}
.comment{
    background: #fff;
}

.mint-tab-item-label {
    height: 1.17333rem !important;
    line-height: 1.17333rem !important;
}

.mint-toast {
    z-index: 99999;
}

.comment .reviews {
    padding: .32rem;
    width: 10rem;
    box-sizing: border-box;
}

.comment .reviews .pleased {
    font-size: .4rem;
    color: #333;
    margin-top: .2rem;
}

.comment .all>input {
    opacity: 0;
    position: absolute;
    width: .426667rem;
    height: .426667rem;
    margin: 0;
}

.comment .all>input:nth-of-type(1),
.comment .all>span:nth-of-type(1) {
    display: none;
}

.comment .all>span{
    font-size: .633333rem;
    color: #ec1019;
    -webkit-transition: color .2s;
    transition: color .2s;
}

.comment .all>input:checked~span {
    color: #999;
}

.comment .all>input:checked+span {
    color: #ec1019;
}


/*xie  */
.comment .write {
    box-sizing: border-box;
    color: #999;
    text-align: center;
    position: relative;
    overflow: hidden;
    padding-top: .32rem ;
}

.comment .write-here {
    width: 100%;
    height: 3rem;
    box-sizing: border-box;
    color: #999;
    font-size: .36rem;
    border: 0;
    line-height: .48rem;
}

.fileupload-button{
    opacity: .1 !important;
}
.comment .write .picture li {
    margin-right: .26rem;
    float: left;
    width: 1.6rem;
    height: 1.6rem;
    border: 1px dashed #999;
    position: relative;
    margin-bottom: .26rem;
    box-sizing: border-box;
}

.comment .picture li img {
    width: 100%;
    height: 100%;
}

.comment .picture li i {
    margin-top: 3px;
    display: block;
    font-size: .6rem;
}

.comment .picture .little-button {
    position: absolute;
    right: -.2rem;
    top: -.1rem;
    color: #999;
    font-size: .4rem;
}

/*  */
.comment .confirm-reviews {
    height: 1.306667rem;
    line-height: 1.306667rem;
    text-align: center;
    font-size: .48rem;
    color: #fff;
    background: #ec1019;
    position: fixed;
    bottom: 0%;
    width: 10rem;
}
::-webkit-input-placeholder {
    /* WebKit, Blink, Edge */
    color: #999;
    font-size: .4rem
}

:-moz-placeholder {
    /* Mozilla Firefox 4 to 18 */
    color: #999;
    font-size: .4rem
}

::-moz-placeholder {
    /* Mozilla Firefox 19+ */
    color: #999;
    font-size: .4rem
}

:-ms-input-placeholder {
    /* Internet Explorer 10-11 */
    color: #999;
    font-size: .4rem
}
/* messagebox */
.mint-msgbox-confirm{
    color: #ec1019;
    font-size: .4rem;
}
.mint-msgbox-cancel{
    font-size: .4rem;
}


</style>

