var express = require('express');
var tour_router = express.Router();
var http = require("http");
var util = require('../util/uitl.js')
var api = require('../util/api.js')
var UUID = require('uuid');
var g = require('../global')
var yxdDB = require('../models_yxd');
var mem = require('../memory')
var fs = require('fs');

tour_router.route('/getStorage_records').post(function (req, res) {
    var os = req.body.offset
    var lmt = req.body.limit
    var value = req.body.v
    var filter = { offset: os, limit: lmt, order: 'createtime DESC' }
    var ud = {}
    if(value.pid != ''){
        ud.$or =  [{ pid: { $like: '%' + value.pid + '%' } }] 
    }
    if (value.type != '') {
        ud.type = value.type
    }
    if (value.desc !== '') {
        ud.desc = value.desc
    }
    filter.where = ud
    filter.include = [{model: yxdDB.gravida_storage_configs}]
    yxdDB.gravida_storage_records.findAndCountAll(filter).then(function (data) {
        res.json({ d: data });
    })
});

tour_router.route('/getStorages').post(function (req, res) {
    var os = req.body.offset
    var lmt = req.body.limit
    var value = req.body.v
    var filter = { offset: os, limit: lmt, order: 'updatedAt DESC' }
    if (value.pid!='') {
        var ud = { $or: [{ pid: { $like: '%' + value.pid + '%' } }] }
        filter.where = ud
    }
    filter.include = [{model: yxdDB.gravida_storage_configs}]
    yxdDB.gravida_product_storages.findAndCountAll(filter).then(function (data) {
        res.json({ d: data });
    })
});

tour_router.route('/saveGoods').post(function (req, res) {
    var _id = req.body.id
    var _pid = req.body.pid
    var _name = req.body.name || ''
    var _color = req.body.color
    var _size = req.body.size
    var _amount = Number(req.body.amount)
    var _desc_con = req.body.desc_con || ''
    var _desc = req.body.desc
    var _type = _amount > 0 ? 1 : 2 //数量负数为出库类型

    util.checkRedisSessionId(req.sessionID, res, function (object) {
        yxdDB.gravida_product_storages.findOne({ where: { color: _color, pid: _pid, size: _size } }).then((data) => {
            if (data) {
                console.log(data.amount);
                //出库 且 库存量小于出库的需求量
                if(_type == 2&&Math.abs(_amount)>data.amount){
                    res.json({ ok: 0 });
                    return
                }else{
                    data.increment('amount', { by: _amount }).then(function (user) {
                        res.json({ ok: 1 });
                    })
                }
            } else if (_type == 1 && data == null) {
                yxdDB.gravida_product_storages.create({ pid: _pid, name: _name, color: _color, size: _size, amount: _amount, desc: _desc_con }).then((data) => {
                    res.json({ ok: 1 });
                })
            } else if (_type == 2 && data == null) {
                res.json({ ok: 0 });
                return
            } else {
                res.json({ ok:-1 });
                return
            }
            yxdDB.gravida_storage_records.create({ pid: _pid, type: _type, desc: _desc, color:_color,size:_size,amount: _amount,desc_con:_desc_con,createtime: Math.floor(Date.now() / 1000) }).then((data) => {
                console.log("添加记录");
            })
        })
    })
});


tour_router.route('/getGoodsConfig').post(function (req, res) {
    var os = req.body.offset
    var lmt = req.body.limit
    var _v = req.body.v
    var filter = { offset: os, limit: lmt }
    if (_v.pid != '') {
        var ud = { $or: [{ pid: { $like: '%' + _v.pid + '%' } }, { name: { $like: '%' + _v.pid + '%' } }] }
        filter.where = ud
    }
    yxdDB.gravida_storage_configs.findAndCountAll(filter).then((data) => {
        res.json({ d: data });
    })
});

tour_router.route('/saveGoodsConfig').post(function (req, res) {
    var _id = req.body.id
    var _pid = req.body.pid
    var _color = req.body.color.toString() 
    var _size = req.body.size.toString() 
    var _name = req.body.name || ''
    var _desc = req.body.desc || ''
    var filter = { pid: _pid, name: _name, color:_color,size:_size }
    if (_id) {
        filter.id = _id
    }
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        yxdDB.gravida_storage_configs.upsert(filter).then((data) => {
            mem.f.ReloadMemory('gravida_storage_configs',()=>{
                res.json({ok: mem.m.gravida_storage_configs});
            })
        })
    })
});

tour_router.route('/delGoodsConfig').post(function (req, res) {
    var _id = req.body.id
    var _pid = req.body.pid
    if (!_id) {
        res.json({ ok: 0 });
        return
    }
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        yxdDB.gravida_product_storages.findOne({where:{pid:_pid}}).then((produce)=>{
            if(produce){
                console.log('存在')
                res.json({ok: g.errorCode.WRONG_EXIST});
            }else{
                yxdDB.gravida_storage_records.findOne({where:{pid:_pid}}).then((record)=>{
                    if(record){
                        console.log('存在')
                        res.json({ok: g.errorCode.WRONG_EXIST});
                    }else{
                        console.log('不存在')
                        yxdDB.gravida_storage_configs.destroy({ where: { id: _id } }).then((data) => {
                            mem.f.ReloadMemory('gravida_storage_configs',()=>{
                                res.json({ok: mem.m.gravida_storage_configs});
                            })
                        })
                    }
                })
            }
        })
    })
});
//
// // 获取颜色的配置信息
// tour_router.route('/getColorConfigs').post(function(req,res){
//     var os = req.body.offset
//     var lmt = req.body.limit
//     var _v = req.body.v
//     var filter = { offset: os, limit: lmt }
//     if (_v) {
//         var ud = {}
//         if (_v.color != '') {
//             ud.color = { $like: '%' + _v.color + '%' }
//             filter.where = ud
//         }
//     }
//     yxdDB.gravida_color_configs.findAndCountAll(filter).then((data) => {
//         res.json({ d: data });
//     })
// });
//
// tour_router.route('/saveColorConfig').post(function (req, res) {
//     var _id = req.body.id
//     var _color = req.body.color
//     var filter = {color:_color}
//     if (_id) {
//         filter.id = _id
//     }
//     util.checkRedisSessionId(req.sessionID, res, function (object) {
//         yxdDB.gravida_color_configs.upsert(filter).then((data) => {
//             mem.f.ReloadMemory('gravida_color_configs',()=>{
//                 res.json({ ok: mem.m.gravida_color_configs});
//             })
//         })
//     })
// });
//
// tour_router.route('/delColorConfig').post(function (req, res) {
//     var _id = req.body.id
//     console.log(_id)
//     if (!_id) {
//         res.json({ ok: 0 });
//         return
//     }
//     util.checkRedisSessionId(req.sessionID, res, function (object) {
//         yxdDB.gravida_color_configs.destroy({ where: { id: _id } }).then((data) => {
//             mem.f.ReloadMemory('gravida_color_configs',()=>{
//                 res.json({ ok: mem.m.gravida_color_configs});
//             })
//
//         })
//     })
// });

// 获取原因的配置信息
tour_router.route('/getDescConfigs').post(function(req,res){
    var os = req.body.offset
    var lmt = req.body.limit
    var _v = req.body.v
    var filter = { offset: os, limit: lmt }
    if (_v) {
        var ud = {}
        if (_v.type != '') {
            ud.type = _v.type
        }
        if (_v.desc != '') {
            ud.desc = { $like: '%' + _v.desc + '%' } 
        }
        filter.where = ud
    }
    yxdDB.gravida_desc_configs.findAndCountAll(filter).then((data) => {
        res.json({ d: data });
    })
});


tour_router.route('/saveDescConfig').post(function (req, res) {
    var _id = req.body.id
    var _type = req.body.type
    var _index = Number(req.body.index)
    var _desc = req.body.desc || ''
    var filter = {desc: _desc}
    if (_id) {
        filter.id = _id
    }else{
        filter.index = ++_index
        filter.type = _type
    }
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        yxdDB.gravida_desc_configs.upsert(filter).then((data) => {
            mem.f.ReloadMemory('gravida_desc_configs',()=>{
                res.json({ ok: mem.m.gravida_desc_configs});
            })
        })
    })
});

tour_router.route('/delDescConfig').post(function (req, res) {
    var _id = req.body.id
    var _type = req.body.type
    var _idx = req.body.index
    if (!_id) {
        res.json({ ok: 0 });
        return
    }
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        yxdDB.gravida_storage_records.findOne({where:{type:_type,desc:_idx}}).then((data)=>{
            if(data){
                res.json({ err:0 });
            }else{
                yxdDB.gravida_desc_configs.destroy({ where: { id: _id } }).then((data) => {
                    mem.f.ReloadMemory('gravida_desc_configs',()=>{
                        res.json({ ok: mem.m.gravida_desc_configs });
                    })
                })
            }
        })
    })
});


//删除图片
tour_router.route('/delimgs').post(function (req, res) {
    var _id = req.body.id
    var _fileNames = req.body.fileNames
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        for(var idx in _fileNames){
            var file = _fileNames[idx]
            var fileName = './static/'+file
            fs.exists(fileName,(exists)=>{
                if(exists){
                    fs.unlink(fileName,(err)=>{
                        if(err){
                            console.log('文件:'+fileName+'删除失败！');
                            res.json({ok:0})
                        }else{
                            console.log('文件:'+fileName+'删除成功！');
                            res.json({ok:1})
                        }
                    })
                }else{
                    console.log("该文件不存在："+fileName)
                    res.json({ok:1})
                }
            })
        }
    })
});

tour_router.route('/getProduceConfigs').post((req,res)=>{
    var os = req.body.offset
    var lmt = req.body.limit
    var _v = req.body.v
    var filter = { offset: os, limit: lmt }
    var ud = {}
    if (_v.name != '') {
        ud.name = { $like: '%' + _v.name + '%' }
        filter.where = ud
    }
    yxdDB.products.findAndCountAll(filter).then((data) => {
        res.json({ d: data });
    })
})


module.exports = tour_router;


