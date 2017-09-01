var express = require('express');
var tour_router = express.Router();
var http = require("http");
var util = require('../util/uitl.js')
var api = require('../util/api.js')
var UUID = require('uuid');
var g = require('../global')
var yxdDB = require('../models_yxd');

tour_router.route('/getStorage_records').post(function (req, res) {
    var os = req.body.offset
    var lmt = req.body.limit
    var value = req.body.v
    var filter = { offset: os, limit: lmt, order: 'createtime DESC' }
    if (value) {
        var ud = { $or: [{ pid: { $like: '%' + value.pid + '%' } }] }
        if (value.type != '') {
            ud.type = value.type
        }
        if (value.desc != '') {
            ud.desc = value.desc
        }
        filter.where = ud
    }
    yxdDB.gravida_storage_records.findAndCountAll(filter).then(function (data) {
        res.json({ d: data });
    })
});

tour_router.route('/getStorages').post(function (req, res) {
    var os = req.body.offset
    var lmt = req.body.limit
    var value = req.body.v
    var filter = { offset: os, limit: lmt, order: 'createdAt DESC' }
    if (value) {
        var ud = { $or: [{ pid: { $like: '%' + value.pid + '%' } }] }
        filter.where = ud
    }
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
            console.log(data);
            if (data) {
                console.log(data.amount);
                //出库 且 库存量小于出库的需求量
                if(_type == 2&&Math.abs(_amount)>data.amount){
                    res.json({ ok: 0 });
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
            yxdDB.gravida_storage_records.create({ pid: _pid, type: _type, desc: _desc, amount: _amount, createtime: Math.floor(Date.now() / 1000) }).then((data) => {
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
    if (_v) {
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
    var _name = req.body.name || ''
    var _desc = req.body.desc || ''
    var filter = { pid: _pid, name: _name, desc: _desc }
    if (_id) {
        filter.id = _id
    }
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        yxdDB.gravida_storage_configs.upsert(filter).then((data) => {
            console.log(data)
            res.json({ ok: 1 });
        })
    })
});

tour_router.route('/delGoodsConfig').post(function (req, res) {
    var _id = req.body.id
    console.log(_id)
    if (!_id) {
        res.json({ ok: 0 });
        return
    }
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        yxdDB.gravida_storage_configs.destroy({ where: { id: _id } }).then((data) => {
            res.json({ ok: 1 });
        })
    })
});
module.exports = tour_router;