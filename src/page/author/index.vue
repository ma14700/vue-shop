<template>
  <div>
  </div>
</template>
<script>
import { cookies } from "../../config/mUtils";
import { mapMutations, mapState } from "vuex";
import { setStore, getStore, removeStore } from "../../config/mUtils";
export default {
  // function GetQueryString(name) {
  //     var reg = new RegExp("(^|&)" + name.toLowerCase() + "=([^&]*)(&|$)");
  //     var url = window.location.search == "" ? window.location.hash : window.location.search;
  //     url.replace('?from=singlemessage', '').replace('?from=timeline', '').replace('?from=groupmessage', '')
  //         .replace('&isappinstalled=0', '').replace('&isappinstalled=1', '');
  //     var r = url.toLowerCase().substr(1).match(reg);
  //     if (r != null) return unescape(r[2]);
  //     return null;
  // }
  // var ua = navigator.userAgent.toLowerCase();
  // var isWeixin = ua.indexOf('micromessenger') != -1;
  // var isAndroid = ua.indexOf('android') != -1;
  // var isIos = (ua.indexOf('iphone') != -1) || (ua.indexOf('ipad') != -1);
  // var code = GetQueryString('code');
  // var s = GetQueryString('s');
  // if (isWeixin) {
  //     if (s != "callback") {
  //         if (code == null) {
  //             window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx55db828f70eaded0&redirect_uri=http%3A%2F%2Fpro.yunyiku.com%2Fapi%2Fcode.aspx" +
  //                 encodeURIComponent('?returnUrl=' + encodeURIComponent(window.location.href.replace('?from=singlemessage', '')
  //                     .replace('?from=timeline', '').replace('?from=groupmessage', '').replace('&isappinstalled=0', '')
  //                     .replace('&isappinstalled=1', ''))) + "&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect";
  //         }
  //     }
  // }
  data() {
    return {
      userInfo1: "123213213"
    };
  },
  created() {
    this.comelogin();
  },
  computed: {
    ...mapState(["userInfo"])
  },
  methods: {
    ...mapMutations(["RECORD_USERINFO"]),
    comelogin() {
      var _this = this;
      // 检测会员有没有登录
      if (
        !cookies.get("YQQParty") ||
        !getStore("userInfo") ||
        location.href.indexOf("clear") > -1
      ) {
        if (location.href.indexOf("code") == -1) {
          let ua = window.navigator.userAgent.toLowerCase();
          // 跳转到微信授权页面
          window.location.href =
            "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd8239120a84c19f4&redirect_uri=http%3A%2F%2Fh5.henandingdang.com%2fwxapi%2freturn.aspx" +
            encodeURIComponent(
              "?returnUrl=" +
                encodeURIComponent(
                  window.location.href
                    .replace("?from=singlemessage", "")
                    .replace("?from=timeline", "")
                    .replace("?from=groupmessage", "")
                    .replace("&isappinstalled=0", "")
                    .replace("&isappinstalled=1", "")
                )
            ) +
            "&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect";
        }
        if (location.href.indexOf("code") != -1) {
          let code = location.href.substring(location.href.indexOf("code") + 5);
          this.$http
            .post("/api/user/authorize?code=" + code)
            .then(res => {
              res = res.data.data;
              removeStore("userInfo");
              this.RECORD_USERINFO(res);
              setTimeout(() => {
                _this._goBeforeLoginUrl(); // 页面恢复(进入用户一开始请求的页面)
              }, 1000);
            })
            .catch(function(err) {
              alert(err);
            });
        }
      } else {
        setTimeout(() => {
          _this._goBeforeLoginUrl(); // 页面恢复(进入用户一开始请求的页面)
        }, 1000);
      }
    },
    _goBeforeLoginUrl() {
      let url = getStore("beforeLoginUrl");
      if (!url || url.indexOf("/author") != -1) {
        this.$router.push("/");
      } else {
        this.$router.push(url);
        setStore("beforeLoginUrl", "");
        if (location.href.indexOf("code") != -1) {
          let code = location.href.substring(location.href.indexOf("code") + 5);
          this.$http.post("/api/user/authorize?code=" + code).then(res => {
            console.log(res.message,res.data );
          });
        }
      }
    }
  }
};
</script>

<style scoped>

</style>

