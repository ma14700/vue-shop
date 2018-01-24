import Vue from 'vue'
import Vuex from 'vuex'
import mutations from './mutations'
import actions from './action'
import getters from './getters'

Vue.use(Vuex)

const state = {
    userInfo: null, //用户信息
    login: true, //是否登录
    imgPath: null, //头像地址
    removeAddress: [], //移除地址
    addAddress: '', //新增地址
    address: {}, //地址
    placeOrder: [],
    goodList: [],
    riskquence: [],
    endquence: null
}
export default new Vuex.Store({
    state,
    getters,
    actions,
    mutations,
})