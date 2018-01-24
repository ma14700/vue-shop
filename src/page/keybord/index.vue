<template>
  <div>
    132
    <child :msg="message" @msgFunc="func(1)"></child>
  </div>
</template>
<script>
  import child from '../../components/props/props'
  export default{
    components:{
      child
    },
    data () {
      return {
        message:'father'
      }
    },
    methods:{
      func(msg){
        console.log(msg)
      }
    }
  }
</script>





