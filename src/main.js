// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import VueRouter from 'vue-router'
import routes from './router/router'
import Mint from 'mint-ui'
import axios from 'axios'
import store from './store/'
import './style/font/iconfont.css'
import 'mint-ui/lib/style.css'
import './config/rem'
import './style/reset.css'
import VueLazyload from 'vue-lazyload'
import FastClick from 'fastclick'
import { cookies, getStore, setStore } from './config/mUtils'
import directives from './config/directives'
import VueProgress from 'vue-progress'
Vue.use(VueProgress)

Vue.use(Mint);
directives(Vue);

Vue.prototype.$http = axios


if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
        FastClick.attach(document.body);
    }, false);
}

Vue.use(VueRouter)
const router = new VueRouter({
    routes,
    mode: 'history',
    strict: process.env.NODE_ENV !== 'production',
    scrollBehavior(to, from, savedPosition) {
        console.log(savedPosition)
        if (savedPosition) {
            return savedPosition
        } else {
            if (from.meta.keepAlive) {
                from.meta.savedPosition = document.body.scrollTop;
            }
            return { x: 0, y: to.meta.savedPosition || 0 }
        }
    }
})

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
})