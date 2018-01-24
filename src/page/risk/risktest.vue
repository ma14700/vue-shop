<template>
  <div>
     <test @upup="change" :msg="msg" abc="msg1"></test> 
  </div>
</template>
<script>
import test from '../../components/test'
export default {
  data(){
      return{
          mull:null,
          msg:null
      }
  },
  components:{
      test
  },
  methods:{
      change(msg){
          console.log(msg);
          this.msg = msg;
          console.log(this.msg)
      }
  }
}
</script>