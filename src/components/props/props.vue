<template>
    <div>
        {{msg}}
        <button @click="handleClick">点我</button>
    </div>
</template>

<script>
export default {
    props: {
        msg: {
            type: String,
            required: true
        }
    },
    methods: {
        handleClick(){
            this.$emit('msgFunc')
        }
    }
}
</script>

