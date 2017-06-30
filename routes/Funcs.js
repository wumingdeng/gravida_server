var express=require('express');
var tour_router=express.Router();
var process = require('process');
var db = require('../models')
var util = require('../util/uitl.js')
var api = require('../util/api.js')
var http = require("http");
var querystring = require('querystring');
var UUID = require('uuid');
var fs=require('fs');
var g = require('../global')
var yxdDB = require('../models_yxd');

tour_router.route('/getAdmins').post(function(req,res){
    var os = req.body.offset
    var lmt = req.body.limit
    var h_no = req.body.h_no || '1'
    var filter = {}
    filter.hospital_no = h_no
    db.admins.findAndCountAll({where:filter,offset:os,limit:lmt}).then(function(data){
        res.json({d:data});
    })
});

tour_router.route('/getAdminByName').post(function(req,res){
    var v = req.body.v
    var os = req.body.offset
    var lmt = req.body.limit
    var h_no = req.body.h_no || '1'
    var filter = {familyname:{$like:'%'+v+'%'}}
    filter.hospital_no = h_no
    db.admins.findAndCountAll({where:filter,offset:os,limit:lmt}).then(function(data){
        res.json({d:data});
    })
});

tour_router.route('/saveAdmin').post(function(req,res){
    var id = req.body.id
    var un = req.body.username
    var pw = req.body.password
    var fn = req.body.familyname
    var weight = req.body.weight.toString()
    var h_no = req.body.h_no || '1'
    var uData = {}
    if(id){
        uData = {id:id,username:un,password:pw,familyname:fn,weight:weight}
    }else{
        uData = {username:un,password:pw,familyname:fn,weight:weight}
    }
    uData.hospital_no = h_no
    util.checkRedisSessionId(req.sessionID,res,function(object){
        db.admins.findOne({where:{username:un}}).then((data)=>{
            console.log(data)
            if(data && !id){
                res.json({ok:g.errorCode.WRONG_USER_EXIST});
            }else{
                db.admins.upsert(uData).then(function(data){
                res.json({ok:1,d:data});
            })
            }
        })
    })
});

tour_router.route('/delAdmin').post(function(req,res){
    var id = req.body.id;
    util.checkRedisSessionId(req.sessionID,res,function(object){
        db.admins.destroy({where: {id: id}}).then(function (data) {
            res.json({ok:1,d: data});
        }).catch(function(err){
            res.json({error:g.errorCode.WRONG_SQL})
        })
    })
});



//获取医生报告
tour_router.route('/getVisits').post(function(req,respone){
    var p = req.body.p
    var s = req.body.s
    var did = req.body.did
    util.accessOutUrl(g.interface.addr,g.interface.port,'POST','/api/get_doctor_reportlist',{p:p,s:0,did:did},function(body){
        respone.json(body);
    },function(err){
        respone.json({error:err});
    })
});

tour_router.route('/getOrders').post(function(req,res){
    var os = req.body.offset
    var lmt = req.body.limit
    var s = req.body.status

    // db.orders.findAndCountAll({where:{status:s},offset:os,limit:lmt,include: [{model: db.goods}]}).then(function(data){
    //     res.json({d:data});
    // })
    yxdDB.orders.findAndCountAll({where:{status:s},offset:os,limit:lmt,include: [{model: yxdDB.products}]}).then(function(data){
        res.json({d:data});
    })

});


tour_router.route('/updateOrders').post(function(req,res){
    var oid = req.body.id
    var st = req.body.status
    util.checkRedisSessionId(req.sessionID,res,function(object){
        yxdDB.orders.update({status:st},{where:{id:oid}}).then((data)=>{
            res.json({ok:1});
        }).catch(function(err){
            res.json({error:g.errorCode.WRONG_SQL})
        })
    })
});

tour_router.route('/getOrdersBylike').post(function(req,res){
    var os = req.body.offset
    var lmt = req.body.limit
    var value = req.body.v
    var status = req.body.status
    var ud=[{custom_phone:{$like:'%'+value+'%'}},{custom:{$like:'%'+value+'%'}},{id:{$like:'%'+value+'%'}}]
    db.orders.findAndCountAll({where:{$or:ud,$and:{status:status}},offset:os,limit:lmt}).then(function(data){
        res.json({d:data}); 
    })
});


tour_router.route('/getVisitsBylike').post(function(req,res){
    var os = req.body.offset
    var lmt = req.body.limit
    var value = req.body.v
    var key = req.body.k
    var h_no = req.body.h_no
    var ud = {}
    switch(key){
        case "patient_no":
            ud = {patient_no:value}
            break;
        case "content":
            ud = {content:value}
            break;
        default:
            break;
    }
    if(h_no){
        ud.hospital_no = h_no
    }else{
        res.json({ok:0});
        return
    }
    db.visits.findAndCountAll({where:ud,offset:os,limit:lmt}).then(function(data){
        res.json({d:data}); 
    })
});

//获取用户报告
tour_router.route('/getUserReport').post(function(req,res){
    var no = req.body.rid
    var openid = req.body.openid
    util.accessOutUrl(g.interface.addr,g.interface.port,'POST','/api/get_user_reportlist',{rid:no,openid:openid},function(body){
        res.json(body);
    },function(err){
        res.json({error:err});
    })
});


//获取报告详情
tour_router.route('/getReportByNo').post(function(req,res){
    var no = req.body.rid
    var openid = req.body.openid
    util.accessOutUrl(g.interface.addr,g.interface.port,'POST','/api/getreport',{rid:no,openid:openid},function(body){
        res.json(body);
    },function(err){
        res.json({error:err});
    })
});

tour_router.route('/getTodo').get(function(req,res){
    db.reports.findOne({where:{id:no}}).then((data)=>{
        res.json({d:data});
    })
});

tour_router.route('/login').post(function(req,res){
    var un = req.body.username
    var pw = req.body.password
    var h_no = req.body.h_no || '1'
    var filterCol = {username:un,password:pw,hospital_no:h_no}
    db.admins.findOne({where:filterCol}).then((data)=>{
        if(data){
            if(req.session){
                req.session.username = un
                req.session.weight = data.dataValues.weight
                req.session.login = true
                req.session.h_no = h_no
            }
            res.json({ok:1,d:data.dataValues});
        }else{
            res.json({ok:0})
        }
    })
});

tour_router.route('/signOut').get(function(req,res){
    console.log("signOut")
    util.checkRedisSessionId(req.sessionID,res,function(object){
        util.clearSession(req.sessionID)
        req.session.destroy()
    })
    res.json({ok:1})
});

tour_router.route('/getHospitalsByName').post(function(req,res){
    var v = req.body.v
    var os = req.body.offset
    var lmt = req.body.limit
    db.hospitals.findAndCountAll({where:{name:{$like:'%'+v+'%'}},offset:os,limit:lmt}).then(function(data){
        res.json({d:data});
    })
});

tour_router.route('/getHospitals').post(function(req,res){
    var os = req.body.offset
    var lmt = req.body.limit
    db.hospitals.findAndCountAll({where:{id:{$ne:'1'}},offset:os,limit:lmt,include: [{model: db.admins,where: {weight:'0,1,2,3'}}]}).then(function(data){
        res.json({d:data});
    })
});

tour_router.route('/updateHospitalStatue').post(function(req,res){
    var id = req.body.id
    var st = req.body.st
    util.checkRedisSessionId(req.sessionID,res,function(object){
        if(object.weight.indexOf('2')<0){
            res.json({ok: g.errorCode.WRONG_WEIGHT});
            return
        }
        db.hospitals.update({statue:st},{where:{id:id}}).then(function(data) {
            if(data){
                res.json({ok: 1});
            }else {
                res.json({ok: 0});
            }
        }).catch(function(err){
            res.json({error:g.errorCode.WRONG_SQL})
        })
    })

})

tour_router.route('/saveHospitals').post(function(req,res){
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
    hData = {id:id,name:name,host:host,statue:0}
    uData = {hospital_no:id,username:admin,password:password,familyname:admin,weight:'0,1,2,3'}
    source[id] ={name:name,host:host,statue:0,username:admin,password:password,familyname:admin}
    var destString = JSON.stringify(source);
    util.checkRedisSessionId(req.sessionID,res,function(object){
        if(object.weight.indexOf('2')<0){
            res.json({ok: -1});
            return
        }
        db.hospitals.findOne({where:{host:host}}).then(function(data) {
            console.log(data)
            if(data){
                res.json({ok: -1});
            }else{
                db.hospitals.upsert(hData).then(function (data) {
                    if (data) {
                        db.admins.upsert(uData).then(function (data) {
                            if (data) {
                                console.log(destString)
                                fs.writeFileSync('./hospital.json', destString);
                                res.json({ok: 1, d: data});
                            } else {
                                res.json({ok: 0});
                            }
                        }).catch(function(err){
                            res.json({error:g.errorCode.WRONG_SQL})
                        })
                    } else {
                        res.json({ok: 0});
                    }
                }).catch(function(err){
                    res.json({error:g.errorCode.WRONG_SQL})
                })
            }
        })
    })
});

tour_router.route('/delHospitals').post(function(req,res){
    var id = req.body.id
    db.hospitals.destroy({where:{id:id}}).then(function(data){
        res.json({d:data});
    }).catch(function(err){
        res.json({error:g.errorCode.WRONG_SQL})
    })
});

tour_router.route('/getDoctors').post(function(req,res){
    var os = req.body.offset
    var lmt = req.body.limit
    var h_no = req.body.h_no
    db.doctors.findAndCountAll({where:{hospital_no:h_no},offset:os,limit:lmt}).then(function(data){
        res.json({d:data});
    })
});

tour_router.route('/saveDoctors').post(function(req,res){
    var id = req.body.id
    var name = req.body.name
    var h_no = req.body.h_no
    var sex = req.body.sex
    var job = req.body.job
    var uData = {}
    if(id){
        uData = {id:id,name:name,hospital_no:h_no,sex:sex,job:job}
    }else{
        uData = {name:name,hospital_no:h_no,sex:sex,job:job}
    }
    db.doctors.upsert(uData).then(function(data){
        res.json({d:data});
    }).catch(function(err){
        res.json({error:g.errorCode.WRONG_SQL})
    })
});

tour_router.route('/delDoctors').post(function(req,res){
    var id = req.body.id
    db.doctors.destroy({where:{id:id}}).then(function(data){
        res.json({d:data});
    }).catch(function(err){
        res.json({error:g.errorCode.WRONG_SQL})
    })
});
tour_router.route('/test').get(function(req,respone){
    var data = api.getOrderTracesByJson("YTO",'885315673857929159')
    var opt = {
        host:'api.kdniao.cc',
        port:'80',
        method:'POST',
        path:'/api/dist',
        headers:{
            "Content-Type": 'application/x-www-form-urlencoded;charset=utf-8',
            "Content-Length": data.length
        }
    }
    var _req = http.request(opt, function(res) {
        res.setEncoding('utf8');
        console.log("response: " + res.statusCode);
        var str = ""
        res.on('data',function(d){
            str += d;
        }).on('end', function(){
            var body=JSON.parse(str);
            respone.json({ok:1,d:body})
        });
    }).on('error', function(e) {
        console.log("error: " + e.message);
    })
    _req.write(data + "\n");
    _req.end();
});

tour_router.route('/getExpInfo').post(function(req,respone){
    var expCode=req.body.expCode
    var expNo=req.body.expNo
    var orderCode=req.body.orderCode
    var data = api.getOrderTracesByJson(expCode,expNo,orderCode)
    var opt = {
        host:'api.kdniao.cc',
        port:'80',
        method:'POST',
        path:'/api/dist',
        headers:{
            "Content-Type": 'application/x-www-form-urlencoded;charset=utf-8',
            "Content-Length": data.length
        }
    }
    var _req = http.request(opt, function(res) {
        res.setEncoding('utf8');
        console.log("response: " + res.statusCode);
        var str = ""
        res.on('data',function(d){
            str += d;
        }).on('end', function(){
            var body=JSON.parse(str);
            respone.json({ok:1,d:body})
            console.log(body)
        });
    }).on('error', function(e) {
        respone.json({ok:0,err:e.message})
        console.log("error: " + e.message);
    })
    _req.write(data + "\n");
    _req.end();
});


//体重评估标准配置
tour_router.route('/save_weight_config').post(function(req,res){
    var id = req.body.id 
    var start = req.body.minweek
    var end = req.body.maxweek
    var size = req.body.type
    var sug = req.body.sug
    var diet = req.body.diet
    var ud = {minweek:start,maxweek:end,type:size,con_sug:sug,con_diet:diet}
    if(id){ud.id = id}
    util.checkRedisSessionId(req.sessionID,res,function(object){
        yxdDB.weightAdvice_configs.upsert(ud).then(function (data) {
            res.json({ok:1,d: data});
        }).catch(function(err){
            res.json({error:g.errorCode.WRONG_SQL})
        })
    })
});

//饮食配置
tour_router.route('/save_diet_config').post(function(req,res){
    var id = req.body.id;
    var start = req.body.minweek
    var end = req.body.maxweek
    var content = req.body.sug
    var type = req.body.type
    var ud = {minweek:start,maxweek:end,type:type,con_sug:content}
    if(id)
        ud.id = id
    util.checkRedisSessionId(req.sessionID,res,function(object){
        yxdDB.weight_diet_configs.upsert(ud).then(function (data) {
            res.json({ok:1,d: data});
        }).catch(function(err){
            res.json({error:g.errorCode.WRONG_SQL})
        })
    })
});

//体重评估标准配置
tour_router.route('/find_config').post(function(req,res){
    var type = req.body.type;
    var os = req.body.offset
    var lmt = req.body.limit
    var filter_type = req.body.ft
    var option = {offset:os,limit:lmt}
    if(filter_type){
        option.where={type:filter_type}
    }
    util.checkRedisSessionId(req.sessionID,res,function(object){
        var db = {}
        if(type == 0){
            db =  yxdDB.weight_diet_configs
        }else{
            db =  yxdDB.weightAdvice_configs
        }
        db.findAndCountAll(option).then(function (data) {
            res.json({ok:1,d: data});
        }).catch(function(err){
            console.log(err)
            res.json({error:g.errorCode.WRONG_SQL})
        })
    })
});

//体重评估标准配置
tour_router.route('/del_config').post(function(req,res){
    var id = req.body.id;
    var type = req.body.type;
    var db = {}
    if(type == 0){
        db =  yxdDB.weight_diet_configs
    }else{
        db =  yxdDB.weightAdvice_configs
    }
    util.checkRedisSessionId(req.sessionID,res,function(object){
       db.destroy({where: {id: id}}).then(function (data) {
            res.json({ok:1,d: data});
        }).catch(function(err){
            res.json({error:g.errorCode.WRONG_SQL})
        })
    })
});

//更新配置文件
tour_router.route('/push_config').get(function(req,res){
    util.checkRedisSessionId(req.sessionID,res,function(object){
        console.log('push_config')
        util.accessOutUrl(g.interface.phoneSer_Addr,g.interface.phoneSer_port,'GET','/api/freshConfig',null,function(body){
            console.log('push success')
            res.json({ok:1});
        },function(err){
            res.json({error:err});
        })
    })
});

module.exports=tour_router;