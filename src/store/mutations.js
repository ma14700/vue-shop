import {
    RECORD_USERINFO,
    GET_USERINFO,
    OUT_LOGIN,
    RETSET_NAME,
    ADD_RESS,
    CLEAR_ORDER,
    GET_PLACE_ORDER,
    PLACE_ORDER,
    QUENCE_END,
    GET_QUENCE
} from './mutation-types'
import { setStore, getStore, removeStore } from '../config/mUtils'
export default {
    [QUENCE_END](state, { start, end }) {
        state.riskquence = start;
        state.endquence = end;
        setStore('riskquence', state, riskquence);
        setStore('endquence', state.riskquence);
    },
    [GET_QUENCE](state) {
        state.riskquence = getStore('riskquence');
        state.endquence = getStore('endquence')
    },
    // 记录用户信息
    [RECORD_USERINFO](state, info) {
        state.userInfo = info;
        setStore('userInfo', state.userInfo)
    },
    //获取用户信息存入vuex
    [GET_USERINFO](state, info) {
        if (state.userInfo && (state.userInfo.username !== info.username)) {
            return;
        };
        if (!state.login) {
            return
        }
        if (!info.message) {
            state.userInfo = {...info };
        } else {
            state.userInfo = null;
        }
    },
    //下单
    [PLACE_ORDER](state, list) {
        state.placeOrder = list;
        setStore('placeOrder', state.placeOrder);
    },
    // [PLACE_ORDER](state,{
    //     shopId,
    //     shopImg,
    //     shopName,
    //     shopGoods,
    // }){
    //     let shop = state.placeOrder;
    //     shop[shopId] = {
    //         "shopId":shopId,
    //         "shopName":shopName,
    //         "shopImg":shopImg,
    //         "shopGoods":shopGoods,
    //     }
    //     setStore('placeOrder', state.placeOrder);
    // },
    [GET_PLACE_ORDER](state) {
        let test = getStore('placeOrder')
        if (test) {
            state.placeOrder = JSON.parse(test);
        }
    },
    //确认支付后清空列表
    [CLEAR_ORDER](state) {
        state.placeOrder = [];
        setStore('placeOrder', state.placeOrder);
    },

}