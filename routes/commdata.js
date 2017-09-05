var express=require('express');
var common_router=express.Router()
var mem = require('../memory')
var g = require('../global')
var citys = require('../citys.json')
// 内存数据维护

// 获取仓库的配置信息
// input service id
common_router.route('/getStorageConfigs').post(function(req,res){
    var sid = req.body.sid
    if(sid === undefined){
        res.json({err:g.errorCode.WRONG_PARAM})
    }else{
        if (mem.m.services[sid]) {
            var swipes = []
            for(var idx in mem.m.swipe_configs){
                var swipe = mem.m.swipe_configs[idx]
                if(swipe.sid == sid){
                    swipes.push(swipe.url)
                }
            }
            mem.m.services[sid]['swipes'] = swipes
            res.json({ok:mem.m.services[sid]})
        } else {
            res.json({ok:0});
        }
    }
});

common_router.route('/getStorageConfigs').post(function(req,res){
    var sid = req.body.sid
    if(sid === undefined){
        res.json({err:g.errorCode.WRONG_PARAM})
    }else{
        if (mem.m.services[sid]) {
            var swipes = []
            for(var idx in mem.m.swipe_configs){
                var swipe = mem.m.swipe_configs[idx]
                if(swipe.sid == sid){
                    swipes.push(swipe.url)
                }
            }
            mem.m.services[sid]['swipes'] = swipes
            res.json({ok:mem.m.services[sid]})
        } else {
            res.json({ok:0});
        }
    }
});

common_router.route('/getStorageConfigs').post(function(req,res){
    var sid = req.body.sid
    if(sid === undefined){
        res.json({err:g.errorCode.WRONG_PARAM})
    }else{
        if (mem.m.services[sid]) {
            var swipes = []
            for(var idx in mem.m.swipe_configs){
                var swipe = mem.m.swipe_configs[idx]
                if(swipe.sid == sid){
                    swipes.push(swipe.url)
                }
            }
            mem.m.services[sid]['swipes'] = swipes
            res.json({ok:mem.m.services[sid]})
        } else {
            res.json({ok:0});
        }
    }
});

common_router.route('/freshConfig').get(function(req,res){
    mem.f.InitDbMemory()
    res.json({ok:0});
});

module.exports=common_router;