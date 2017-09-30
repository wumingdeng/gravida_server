var express = require('express');
var tour_router = express.Router();
var process = require('process');
var db = require('../models')
var util = require('../util/uitl.js')
var api = require('../util/api.js')
var http = require("http");
var querystring = require('querystring');
var UUID = require('uuid');
var fs = require('fs');
var g = require('../global')
var yxdDB = require('../models_yxd');

//获取医生报告
tour_router.route('/getVisits').post(function (req, respone) {
    var p = req.body.p
    var s = req.body.s
    var did = req.body.did
    util.accessOutUrl(g.cfg.yxd_addr, g.cfg.yxd_port, 'POST', '/api/get_doctor_reportlist', { p: p, s: 0, did: did }, function (body) {
        respone.json(body);
    }, function (err) {
        respone.json({ error: err });
    })
});

tour_router.route('/getOrders').post(function (req, res) {
    var os = req.body.offset
    var lmt = req.body.limit
    var s = req.body.status
    var order = s == 3?'DESC':'ASC'
    var ud = {offset: os, order:[['updatetime',order],['createtime',order]],limit: lmt}
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        if(s==4){
            if (object.weight.indexOf('105') < 0) {
                res.json({ok: g.errorCode.WRONG_WEIGHT});
                return
            }
            ud.where = {$or:[{status:8},{status:4}]}
        }else if(s==5){
            var shup = {where:{status:s}}
            var query = `select * from orders os join userComments uc ON os.id=uc.orderid and os.status=5 order by uc.time desc limit ? offset ?`
            var argArr = [lmt,os]
            if (object.weight.indexOf('106') < 0) {
                res.json({ok: g.errorCode.WRONG_WEIGHT});
                return
            }
            if(object.platform){
                shup.where['platform'] = object.platform
                argArr = [object.platform,lmt,os]
                query = `select * from orders os join userComments uc ON os.id=uc.orderid and os.status=5 and os.platform=? order by uc.time desc limit ? offset ?`
            }
            yxdDB.orders.count(shup).then(function (data) {
                yxdDB.sequelize.query(query, { replacements: argArr,type: yxdDB.sequelize.QueryTypes.SELECT }).then(function(records){
                    res.json({ d: records,count: data});
                })
            })
            return
        }else if(s==-1){
            if (object.weight.indexOf('107') < 0) {
                res.json({ok: g.errorCode.WRONG_WEIGHT});
                return
            }
        }else{
            ud.where={ status: s }
        }
        console.log(object.platform)
        if(object.platform){
            if(!ud.where) ud.where = {}
            ud.where['platform'] = object.platform
        }
        yxdDB.orders.findAndCountAll(ud).then(function (data) {
            res.json({ d: data });
        })
    })
});

tour_router.route('/getOrdersCount').get(function (req, res) {
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        var ud = {attributes: ['status'], group: 'status'}
        if (object.platform) {
            ud.where = {platform: object.platform}
        }
        yxdDB.orders.findAndCountAll(ud).then(function (data) {
            res.json({d: data});
        })
    })
});

tour_router.route('/fixExpress').post(function (req, res) {
    var oid = req.body.id||''
    var comNo = req.body.com_no || ''
    var _orderNo = req.body.exp_order_no ||''
    if(comNo===''||_orderNo===''||oid===''){
        res.json({error: g.errorCode.WRONG_PARAM })
        return
    }
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        if (object.weight.indexOf('104') < 0) {
            res.json({ok: g.errorCode.WRONG_WEIGHT});
            return
        }
        yxdDB.orders.update({exp_com_no: comNo, exp_no: _orderNo}, {where: {id: oid}}).then((data) => {
            if(data){
                res.json({ok: 1});
            }else{
                res.json({error: g.errorCode.WRONG_SQL})
            }
        }).catch(function (err) {
            res.json({error: g.errorCode.WRONG_SQL})
        })
    })
});

tour_router.route('/updateOrders').post(function (req, res) {
    var oid = req.body.id
    var st = req.body.status
    var _amount = req.body.amount
    var _color = req.body.color
    var _size = req.body.size
    var _pid = req.body.pid
    var update = { status: st,updatetime: Math.floor(Date.now() / 1000)}
    if (st == 3 && req.body.com_no && req.body.exp_order_no) {
        update.exp_com_no = req.body.com_no
        update.exp_no = req.body.exp_order_no
        update.delivertime = Math.floor(Date.now() / 1000)
    } else if (st == 3) {
        res.json({ ok: 10 });
        return
    }
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        if(st == 1 && object.weight.indexOf('102')<0){
            res.json({ ok: g.errorCode.WRONG_WEIGHT});
            return
        }
        if(st == 2 && object.weight.indexOf('103')<0){
            res.json({ ok: g.errorCode.WRONG_WEIGHT});
            return
        }
        if(st == 3 && object.weight.indexOf('104')<0){
            res.json({ ok: g.errorCode.WRONG_WEIGHT});
            return
        }
        if(st == 3){
            yxdDB.gravida_product_storages.findOne({ where: { color: _color, pid: _pid, size: _size } }).then((data) => {
                if (data && data.amount >= _amount) {
                    //出库的行为
                    data.decrement('amount', { by: _amount }).then(function (d) {
                        yxdDB.orders.update(update, { where: { id: oid } }).then((data) => {
                            if(data){
                                res.json({ ok: 1 });
                            }else{
                                res.json({ error: g.errorCode.WRONG_SQL })
                            }
                        }).catch(function (err) {
                            res.json({ error: g.errorCode.WRONG_SQL })
                        })
                        console.log('添加记录')
                        yxdDB.gravida_storage_records.create({ pid: _pid,color:_color,size:_size, type: 2, desc: 0, amount: -_amount, createtime: Math.floor(Date.now() / 1000) }).then((data) => {
                        })
                    })
                } else {
                    res.json({ ok: 11 })
                }
            })
        }else{
            yxdDB.orders.update(update, { where: { id: oid } }).then((data) => {
                res.json({ ok: 1 });
            }).catch(function (err) {
                res.json({ error: g.errorCode.WRONG_SQL })
            })
        }
    })
});

tour_router.route('/getOrdersBylike').post(function (req, res) {
    var os = req.body.offset
    var lmt = req.body.limit
    var value = req.body.v
    var status = req.body.status
    var _where = {}
    var ud = [{ tel: { $like: '%' + value + '%' } }, { contact: { $like: '%' + value + '%' } }, { id: { $like: '%' + value + '%' } }]
    _where.$or = ud
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        if(status==4){
            ud.push({status:8})
            ud.push({status:4})
            if (object.platform) {
                _where.$and = {platform:object.platform}
            }
        }else if(status==5) {
            yxdDB.orders.count({where: {$or: ud, status: status}}).then(function (data) {
                console.log(data)
                var query = `select * from orders os join userComments uc ON os.id=uc.orderid and os.status=5 and (os.tel like :tel or os.contact like :contact or os.id like :id) order by uc.time desc limit :lmt offset :os`
                yxdDB.sequelize.query(query, {
                    replacements: {
                        tel: '%' + value + '%',
                        contact: '%' + value + '%',
                        id: '%' + value + '%',
                        lmt: lmt,
                        os: os
                    }, type: yxdDB.sequelize.QueryTypes.SELECT
                }).then(function (records) {
                    res.json({d: records, count: data});
                })
            })
            return
        }else if(status != -1){
            _where.$and = { status: status }
            if (object.platform) {
                _where.$and['platform'] = object.platform
            }
        }
        yxdDB.orders.findAndCountAll({ where: _where, offset: os, limit: lmt ,include: [{ model: yxdDB.products }]}).then(function (data) {
            res.json({ d: data });
        })
    })
});


tour_router.route('/getVisitsBylike').post(function (req, res) {
    var os = req.body.offset
    var lmt = req.body.limit
    var value = req.body.v
    var key = req.body.k
    var h_no = req.body.h_no
    var ud = {}
    switch (key) {
        case "patient_no":
            ud = { patient_no: value }
            break;
        case "content":
            ud = { content: value }
            break;
        default:
            break;
    }
    if (h_no) {
        ud.hospital_no = h_no
    } else {
        res.json({ ok: 0 });
        return
    }
    db.visits.findAndCountAll({ where: ud, offset: os, limit: lmt }).then(function (data) {
        res.json({ d: data });
    })
});

//获取用户报告
tour_router.route('/getUserReport').post(function (req, res) {
    var no = req.body.rid
    var openid = req.body.openid
    util.accessOutUrl(g.cfg.yxd_addr, g.cfg.yxd_port, 'POST', '/api/get_user_reportlist', { rid: no, openid: openid }, function (body) {
        res.json(body);
    }, function (err) {
        res.json({ error: err });
    })
});


//获取报告详情
tour_router.route('/getReportByNo').post(function (req, res) {
    var no = req.body.rid
    var openid = req.body.openid
    util.accessOutUrl(g.cfg.yxd_addr, g.cfg.yxd_port, 'POST', '/api/getreport', { rid: no, openid: openid }, function (body) {
        res.json(body);
    }, function (err) {
        res.json({ error: err });
    })
});

tour_router.route('/getTodo').get(function (req, res) {
    db.reports.findOne({ where: { id: no } }).then((data) => {
        res.json({ d: data });
    })
});

tour_router.route('/getHospitalsByName').post(function (req, res) {
    var v = req.body.v
    var os = req.body.offset
    var lmt = req.body.limit
    db.hospitals.findAndCountAll({ where: { name: { $like: '%' + v + '%' } }, offset: os, limit: lmt }).then(function (data) {
        res.json({ d: data });
    })
});

tour_router.route('/getHospitals').post(function (req, res) {
    var os = req.body.offset
    var lmt = req.body.limit
    db.hospitals.findAndCountAll({ where: { id: { $ne: '1' } }, offset: os, limit: lmt, include: [{ model: db.admins, where: { weight: '0,1,2,3' } }] }).then(function (data) {
        res.json({ d: data });
    })
});

tour_router.route('/updateHospitalStatue').post(function (req, res) {
    var id = req.body.id
    var st = req.body.st
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        if (object.weight.indexOf('3') < 0) {
            res.json({ ok: g.errorCode.WRONG_WEIGHT });
            return
        }
        db.hospitals.update({ statue: st }, { where: { id: id } }).then(function (data) {
            if (data) {
                res.json({ ok: 1 });
            } else {
                res.json({ ok: 0 });
            }
        }).catch(function (err) {
            res.json({ error: g.errorCode.WRONG_SQL })
        })
    })

})

tour_router.route('/saveHospitals').post(function (req, res) {
    var name = req.body.name
    var host = req.body.host
    var admin = req.body.username
    var password = req.body.password
    var uData = {}
    var hData = {}
    var ID = UUID.v1();
    var id = req.body.id || ID
    var source = require('../hospital.json');
    console.log("更新数据")
    hData = { id: id, name: name, host: host, statue: 0 }
    uData = { hospital_no: id, username: admin, password: password, familyname: admin, weight: '0,1,2,3' }
    source[id] = { name: name, host: host, statue: 0, username: admin, password: password, familyname: admin }
    var destString = JSON.stringify(source);
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        if (object.weight.indexOf('3') < 0) {
            res.json({ ok:g.errorCode.WRONG_WEIGHT });
            return
        }
        db.hospitals.findOne({ where: { host: host } }).then(function (data) {
            console.log(data)
            if (data) {
                res.json({ ok: -1 });
            } else {
                db.hospitals.upsert(hData).then(function (data) {
                    if (data) {
                        db.admins.upsert(uData).then(function (data) {
                            if (data) {
                                console.log(destString)
                                fs.writeFileSync('./hospital.json', destString);
                                res.json({ ok: 1, d: data });
                            } else {
                                res.json({ ok: 0 });
                            }
                        }).catch(function (err) {
                            res.json({ error: g.errorCode.WRONG_SQL })
                        })
                    } else {
                        res.json({ ok: 0 });
                    }
                }).catch(function (err) {
                    res.json({ error: g.errorCode.WRONG_SQL })
                })
            }
        })
    })
});

tour_router.route('/delHospitals').post(function (req, res) {
    var id = req.body.id
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        if (object.weight.indexOf('3') < 0) {
            res.json({ ok:g.errorCode.WRONG_WEIGHT });
            return
        }
    })
    db.hospitals.destroy({ where: { id: id } }).then(function (data) {
        res.json({ d: data });
    }).catch(function (err) {
        res.json({ error: g.errorCode.WRONG_SQL })
    })
});

tour_router.route('/getDoctors').post(function (req, res) {
    var os = req.body.offset
    var lmt = req.body.limit
    var h_no = req.body.h_no
    db.doctors.findAndCountAll({ where: { hospital_no: h_no }, offset: os, limit: lmt }).then(function (data) {
        res.json({ d: data });
    })
});

tour_router.route('/saveDoctors').post(function (req, res) {
    var id = req.body.id
    var name = req.body.name
    var h_no = req.body.h_no
    var sex = req.body.sex
    var job = req.body.job
    var uData = {}
    if (id) {
        uData = { id: id, name: name, hospital_no: h_no, sex: sex, job: job }
    } else {
        uData = { name: name, hospital_no: h_no, sex: sex, job: job }
    }
    db.doctors.upsert(uData).then(function (data) {
        res.json({ d: data });
    }).catch(function (err) {
        res.json({ error: g.errorCode.WRONG_SQL })
    })
});

tour_router.route('/delDoctors').post(function (req, res) {
    var id = req.body.id
    db.doctors.destroy({ where: { id: id } }).then(function (data) {
        res.json({ d: data });
    }).catch(function (err) {
        res.json({ error: g.errorCode.WRONG_SQL })
    })
});
tour_router.route('/test').get(function (req, respone) {
    var data = api.getOrderTracesByJson("YTO", '885315673857929159')
    var opt = {
        host: 'api.kdniao.cc',
        port: '80',
        method: 'POST',
        path: '/api/dist',
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded;charset=utf-8',
            "Content-Length": data.length
        }
    }
    var _req = http.request(opt, function (res) {
        res.setEncoding('utf8');
        console.log("response: " + res.statusCode);
        var str = ""
        res.on('data', function (d) {
            str += d;
        }).on('end', function () {
            var body = JSON.parse(str);
            respone.json({ ok: 1, d: body })
        });
    }).on('error', function (e) {
        console.log("error: " + e.message);
    })
    _req.write(data + "\n");
    _req.end();
});

tour_router.route('/getExpInfo').post(function (req, respone) {
    var expCode = req.body.expCode
    var expNo = req.body.expNo
    var orderCode = req.body.orderCode
    var data = api.getOrderTracesByJson(expCode, expNo, orderCode)
    var opt = {
        host: 'api.kdniao.cc',
        port: '80',
        method: 'POST',
        path: '/api/dist',
        headers: {
            "Content-Type": 'application/x-www-form-urlencoded;charset=utf-8',
            "Content-Length": data.length
        }
    }
    var _req = http.request(opt, function (res) {
        res.setEncoding('utf8');
        console.log("response: " + res.statusCode);
        var str = ""
        res.on('data', function (d) {
            str += d;
        }).on('end', function () {
            var body = JSON.parse(str);
            respone.json({ ok: 1, d: body })
            console.log(body)
        });
    }).on('error', function (e) {
        respone.json({ ok: 0, err: e.message })
        console.log("error: " + e.message);
    })
    _req.write(data + "\n");
    _req.end();
});


//体重评估标准配置
tour_router.route('/save_weight_config').post(function (req, res) {
    var id = req.body.id
    var start = req.body.minweek
    var end = req.body.maxweek
    var size = req.body.type
    var sug = req.body.sug
    var diet = req.body.diet
    var ud = { minweek: start, maxweek: end, type: size, con_sug: sug, con_diet: diet }
    if (id) { ud.id = id }
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        if(object.weight.indexOf('402')<0){
            res.json({ ok: g.errorCode.WRONG_WEIGHT});
            return
        }
        yxdDB.weightAdvice_configs.upsert(ud).then(function (data) {
            res.json({ ok: 1, d: data });
        }).catch(function (err) {
            res.json({ error: g.errorCode.WRONG_SQL })
        })
    })
});

//饮食配置
tour_router.route('/save_diet_config').post(function (req, res) {
    var id = req.body.id;
    var start = req.body.minweek
    var end = req.body.maxweek
    var content = req.body.sug
    var type = req.body.type
    var ud = { minweek: start, maxweek: end, type: type, con_sug: content }
    if (id)
        ud.id = id
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        if(object.weight.indexOf('401')<0){
            res.json({ ok: g.errorCode.WRONG_WEIGHT});
            return
        }
        yxdDB.weight_diet_configs.upsert(ud).then(function (data) {
            res.json({ ok: 1, d: data });
        }).catch(function (err) {
            res.json({ error: g.errorCode.WRONG_SQL })
        })
    })
});

//体重评估标准配置
tour_router.route('/find_config').post(function (req, res) {
    var type = req.body.type;
    var os = req.body.offset
    var lmt = req.body.limit
    var filter_type = req.body.ft
    var option = { offset: os, limit: lmt }
    if (filter_type) {
        option.where = { type: filter_type }
    }
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        var db = {}
        if (type == 0) {
            db = yxdDB.weight_diet_configs
        } else {
            db = yxdDB.weightAdvice_configs
        }
        db.findAndCountAll(option).then(function (data) {
            res.json({ ok: 1, d: data });
        }).catch(function (err) {
            console.log(err)
            res.json({ error: g.errorCode.WRONG_SQL })
        })
    })
});

//体重评估标准配置
tour_router.route('/del_config').post(function (req, res) {
    var id = req.body.id;
    var type = req.body.type;
    var db = {}
    if (type == 0) {
        db = yxdDB.weight_diet_configs
    } else {
        db = yxdDB.weightAdvice_configs
    }
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        if(type==0 && object.weight.indexOf('401')<0){
            res.json({ ok: g.errorCode.WRONG_WEIGHT});
            return
        }else if( object.weight.indexOf('402')<0){
            res.json({ ok: g.errorCode.WRONG_WEIGHT});
            return
        }
        db.destroy({ where: { id: id } }).then(function (data) {
            res.json({ ok: 1, d: data });
        }).catch(function (err) {
            res.json({ error: g.errorCode.WRONG_SQL })
        })
    })
});

//更新配置文件
tour_router.route('/push_config').get(function (req, res) {
    util.checkRedisSessionId(req.sessionID, res, function (object) {
        console.log('push_config')
        util.accessOutUrl(g.cfg.phoneSer_Addr, g.cfg.phoneSer_port, 'GET', '/api/freshConfig', null, function (body) {
            console.log('push success')
            res.json({ ok: 1 });
        }, function (err) {
            res.json({ error: err });
        })
    })
});

module.exports = tour_router;