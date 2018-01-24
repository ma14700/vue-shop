<template>
    <div>123
        <div @click="up" style="background:red"><input type="text" v-model="upm"></div>   
    </div> 
</template>

<script>
export default {
    data(){
        return{
            upm:['123','3123']
        }
    },
    props:['abc'],
   
  methods: {
        up() {
            console.log(this.abc)
            console.log(123)
            this.$emit('upup',this.upm);
        }
    }
}
</script>

