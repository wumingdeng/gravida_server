var express = require('express');
var tour_router = express.Router();
var process = require('process');
var db = require('../models')
var util = require('../util/uitl.js')
var api = require('../util/api.js')
var http = require("http");
var querystring = require('querystring');
var fs = require('fs');
var g = require('../global')

tour_router.route('/getAdmins').post(function (req, res) {
    var os = req.body.offset
    var lmt = req.body.limit
    var h_no = req.body.h_no || '1'
    var filter = {}
    filter.hospital_no = h_no
    db.admins.findAndCountAll({ where: filter, offset: os, limit: lmt }).then(function (data) {
        res.json({ d: data });
    })
});

tour_router.route('/getAdminByName').post(function (req, res) {
    var v = req.body.v
    var os = req.body.offset
    var lmt = req.body.limit
    var h_no = req.body.h_no || '1'
    var filter = { familyname: { $like: '%' + v + '%' } }
    filter.hospital_no = h_no
    db.admins.findAndCountAll({ where: filter, offset: os, limit: lmt }).then(function (data) {
        res.json({ d: data });
    })
});

tour_router.route('/saveAdmin').post(function (req, res) {
    var id = req.body.id
    var un = req.body.username
    var pw = req.body.password
    var fn = req.body.familyname
    var weight = req.body.weight.toString()
    var h_no = req.body.h_no || '1'
    var uData = {}
    if (id) {
        uData = { id: id, username: un, password: pw, familyname: fn, weight: weight }
    } else {
        uData = { username: un, password: pw, familyname: fn, weight: weight }
    }
    uData.hospital_no = h_no
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        if(object.weight.indexOf('2')<0){
            res.json({ ok: g.errorCode.WRONG_WEIGHT});
            return
        }
        db.admins.findOne({ where: { username: un } }).then((data) => {
            console.log(data)
            if (data && !id) {
                res.json({ ok: g.errorCode.WRONG_USER_EXIST });
            } else {
                db.admins.upsert(uData).then(function (data) {
                    res.json({ ok: 1, d: data });
                })
            }
        })
    })
});

tour_router.route('/delAdmin').post(function (req, res) {
    var id = req.body.id;
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        if(object.weight.indexOf('2')<0){
            res.json({ ok: g.errorCode.WRONG_WEIGHT});
            return
        }
        db.admins.destroy({ where: { id: id } }).then(function (data) {
            res.json({ ok: 1, d: data });
        }).catch(function (err) {
            res.json({ error: g.errorCode.WRONG_SQL })
        })
    })
});

tour_router.route('/login').post(function (req, res) {
    var un = req.body.username
    var pw = req.body.password
    var h_no = req.body.h_no || '1'
    var filterCol = { username: un, password: pw, hospital_no: h_no }
    db.admins.findOne({ where: filterCol }).then((data) => {
        if (data) {
            if (req.session) {
                req.session.username = un
                req.session.weight = data.dataValues.weight
                req.session.platform = data.dataValues.platform
                req.session.h_no = h_no
                req.session.login = true
            }
            res.json({ ok: 1, d: data.dataValues });
        } else {
            res.json({ ok: 0 })
        }
    })
});

tour_router.route('/signOut').get(function (req, res) {
    console.log("signOut")
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        util.clearSession(req)
    })
    res.json({ ok: 1 })
});

tour_router.route('/savePlatformUser').post(function (req, res) {
    var id = req.body.id || ''
    var un = req.body.username
    var pw = req.body.password
    var fn = req.body.familyname
    var platform = req.body.platform || ''
    if(platform===''){
        res.json({ ok: g.errorCode.WRONG_PARAM});
        return
    }
    var weight = req.body.weight.toString()
    var uData = {}
    if (id === '') {
        uData = { hospital_no:1,username: un, password: pw, familyname: fn, weight: weight,platform:platform }
    } else {
        uData = {hospital_no:1,id: id, username: un, password: pw, familyname: fn, weight: weight,platform:platform }
    }
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        if(object.weight.indexOf('2')<0){
            res.json({ ok: g.errorCode.WRONG_WEIGHT});
            return
        }
        db.admins.findOne({ where: { username: un } }).then((data) => {
            if (id==='' && data) {
                res.json({ ok: g.errorCode.WRONG_USER_EXIST });
            } else {
                db.admins.upsert(uData).then(function (data) {
                    res.json({ ok: 1, d: data });
                })
            }
        })
    })
});

tour_router.route('/getPlatformUsers').post(function (req, res) {
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        var os = req.body.offset
        var lmt = req.body.limit
        var _v = req.body.v
        var filter = {}
        filter.platform = {$not:null}
        if(_v.name != ''){
            filter.name = {$like:'%'+_v.name+'%'}
        }
        db.admins.findAndCountAll({ where: filter, offset: os, limit: lmt }).then(function (data) {
            res.json({ d: data });
        })
    })
});

module.exports = tour_router;