import App from '../App'
import Error from '@/components/Error'
const home = r => require.ensure([], () => r(require('../page/home')), 'home')
const classify = r => require.ensure([], () => r(require('../page/classify')), 'classify')
const shopcart = r => require.ensure([], () => r(require('../page/shopcart')), 'shopcart')
const center = r => require.ensure([], () => r(require('../page/center')), 'center')
const goodslist = r => require.ensure([], () => r(require('../page/goodslist')), 'goodslist')
const goodsdetail = r => require.ensure([], () => r(require('../page/goodsdetail')), 'goodsdetail')
const search = r => require.ensure([], () => r(require('../page/search')), 'search')
const submitorder = r => require.ensure([], () => r(require('../page/submitorder')), 'submitorder')
const order = r => require.ensure([], () => r(require('../page/order')), 'order')
const collect = r => require.ensure([], () => r(require('../page/collect')), 'collect')
const address = r => require.ensure([], () => r(require('../page/address')), 'address')
const editaddress = r => require.ensure([], () => r(require('../page/address/edit')), 'editaddress')
const author = r => require.ensure([], () => r(require('../page/author')), 'author')
const searchresult = r => require.ensure([], () => r(require('../page/searchresult')), 'searchresult')
const orderdetail = r => require.ensure([], () => r(require('../page/orderdetail')), 'orderdetail')
const refunddetail = r => require.ensure([], () => r(require('../page/refunddetail')), 'refunddetail')
const refundgooddetail = r => require.ensure([], () => r(require('../page/refundgooddetail')), 'refundgooddetail')
const refund = r => require.ensure([], () => r(require('../page/refund')), 'refund')
const myrefund = r => require.ensure([], () => r(require('../page/refund/children/myrefund')), 'myrefund')
const remoney = r => require.ensure([], () => r(require('../page/refund/children/remoney')), 'remoney')
const regood = r => require.ensure([], () => r(require('../page/refund/children/regood')), 'regood')
const risk = r => require.ensure([], () => r(require('../page/risk')), 'risk')
const tranparcel = r => require.ensure([], () => r(require('../page/tranparcel')), 'tranparcel')
const submit = r => require.ensure([], () => r(require('../page/submit')), 'submit')
const payFailed = r => require.ensure([], () => r(require('../components/payFailed')), 'payFailed')
const dingdang =  r => require.ensure([], () => r(require('../page/dingdang')), 'dingdang')

export default [{
        path: '/author',
        component: author,
        meta: {
            title: '正在登陆'
        },
    }, {
        path: '',
        redirect: '/home'
    },
    {
        path: '/dingdang',
        component: dingdang,
        meta: {
            title: '关于叮当互动'
        },
    },
    {
        path: '/submit',
        component: submit,
        meta: {
            title: '写评价'
        },
    },
    {
        path: '/home',
        component: home,
        meta: {
            title: '首页'
        },
    },
    {
        path: '/tranparcel',
        component: tranparcel,
        meta: {
            title: '物流运输'
        }
    },
    {
        path: '/risk',
        component: risk,
        meta: {
            title: '风险评估'
        }
    },
    {
        path: '/classify',
        component: classify,
        meta: {
            title: '分类'
        },
    },
    {
        path: '/goodslist',
        component: goodslist,
        meta: {
            title: '商品列表'
        },
    },
    {
        path: '/goodsdetail',
        component: goodsdetail,
        meta: {
            title: '商品详情'
        },
    },
    {
        path: '/shopcart',
        component: shopcart,
        meta: {
            title: '购物车'
        },
    },
    {
        path: '/center',
        component: center,
        meta: {
            title: '个人中心'
        },
    },
    {
        path: '/search',
        component: search,
        meta: {
            title: '搜索'
        },
    },
    {
        path: '/searchresult',
        component: searchresult,
        meta: {
            title: '搜索商品列表'
        },
    },
    {
        path: '/submitorder',
        component: submitorder,
        meta: {
            title: '确认订单'
        },
    },
    {
        path: '/order',
        component: order,
        meta: {
            title: '我的订单'
        },
    },
    {
        path: '/collect',
        component: collect,
        meta: {
            title: '收藏夹'
        },
    },
    {
        path: '/address',
        component: address,
        meta: {
            title: '管理收货地址'
        },
    },
    {
        path: '/editaddress',
        component: editaddress,
        meta: {
            title: '编辑收货地址'
        },
    },
    {
        path: '/orderdetail',
        component: orderdetail,
        meta: {
            title: '订单详情'
        },
    },
    {
        path: '/refunddetail',
        component: refunddetail,
        meta: {
            title: '退款详情'
        },
    },
    {
        path: '/refundgooddetail',
        component: refundgooddetail,
        meta: {
            title: '退换货详情'
        },
    },
    // {
    //     path: '/refund',
    //     component: refund,
    //     meta: {
    //         title: '退款/退货'
    //     },
    // },

    {
        path: '/refund',
        component: myrefund,
        meta: {
            title: '退款/退货'
        },
    },
    {
        path: '/remoney',
        component: remoney,
        meta: {
            title: '仅退款'
        }
    },
    {
        path: '/regood',
        component: regood,
        meta: {
            title: '退换货'
        }
    },
    {
        path:'/payFailed',
        component:payFailed,
        meta:{
            title:'支付失败'
        }
    },{
    
        path: '*',
        component: Error
    }
]
