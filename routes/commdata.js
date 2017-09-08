var express=require('express');
var common_router=express.Router()
var mem = require('../memory')
// 内存数据维护

// 获取仓库的配置信息
common_router.route('/getStorageConfigs').get(function(req,res){
    res.json({ok:mem.m})
});



common_router.route('/freshConfig').get(function(req,res){
    mem.f.InitDbMemory()
    res.json({ok:0});
});

module.exports=common_router;