var config = require('../config.json')
module.exports = {
    errorCode:{
        WRONG_SESSION_ERROR:-2, //session 异常
        WRONG_SQL:-1,
        WRONG_USER:101, //用户
        WRONG_PARAM:102, //错误参数
        WRONG_USER_EXIST:103,//用户名已存在
        WRONG_WEIGHT:104, //权限不足
        WRONG_WEIGHT:105, //权限不足
    },
    interface:{
        phoneSer_Addr:'121.40.254.174',
        phoneSer_port:'8092',
        addr:'180yxd.sujudao.com',
        port:'8097'
    },
    orderStatus:{
        NOTPAY:0,   //已下单 待支付
        PAYED_NO_DELIVER:1, //已支付 待备货
        DELIVER_NO_CHOICE:2,   //已备货 待发货
        DELIVER_NO_RECEIPT:3,   //已发货 待收货
        RECEIPT_NO_EVALUATE:4,  //已确认送达 待评价
        FINISH:5,    //已评价
        CANCELED:6,  //用户取消订单
        REFUND:7,    //已退款
        AUTO_RECEIPT:8,  //时间到默认收货
        AUTO_CANCELED:9  //时间到默认取消
      },
    cfg:config
}