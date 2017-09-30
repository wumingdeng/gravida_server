/**
 * Created by Fizzo on 17/9/26.
 */
var express = require('express');
var tour_router = express.Router();
var http = require("http");
var util = require('../util/uitl.js')
var yxdDB = require('../models_yxd');

tour_router.route('/getPlatforms').post(function (req, res) {
    var os = req.body.offset || ''
    var lmt = req.body.limit || ''
    var _v = req.body.v
    var filter
    if(os!=''&&lmt!=''){
        filter = { offset: os, limit: lmt,order: 'id DESC'}
    }
    if (_v && _v.name != '') {
        var ud = { name: { $like: '%' + _v.name + '%' } }
        filter.where = ud
    }
    yxdDB.gravida_platforms.findAndCountAll(filter).then((data) => {
        if(data){
            res.json({ d: data });
        }else{
            res.json({ err: 0 });
        }
    })
});

tour_router.route('/savePlatform').post(function (req, res) {
    var _id = req.body.id
    var _ip = req.body.ip
    var _port = req.body.port
    var _name = req.body.name || ''
    var filter = {name: _name, port:_port,ip:_ip }
    if (_id && _id!='') {
        filter.id = _id
    }
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        yxdDB.gravida_platforms.upsert(filter).then((data) => {
            res.json({ ok: 1 });
        })
    })
});

tour_router.route('/delPlatform').post(function (req, res) {
    var _id = req.body.id
    if (!_id) {
        res.json({ ok: 0 });
        return
    }
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        yxdDB.gravida_platforms.destroy({ where: { id: _id } }).then((data) => {
            res.json({ ok: 1 });
        })
    })
});

module.exports = tour_router;


