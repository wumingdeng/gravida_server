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

tour_router.route('/getAdmins').post(function(req,res){
    var os = req.body.offset
    var lmt = req.body.limit
    var h_no = req.body.h_no
    var filter = {offset:os,limit:lmt}
    if(h_no){
        filter.hospital_no = h_no
    }
    db.admins.findAndCountAll(filter).then(function(data){
        res.json({d:data});
    })
});

tour_router.route('/getAdminByName').post(function(req,res){
    var v = req.body.v
    var os = req.body.offset
    var lmt = req.body.limit
    var h_no = req.body.h_no
    var filter = {familyname:{$like:'%'+v+'%'}}
    if(h_no){
        filter.hospital_no = h_no
    }
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
    var uData = {}
    var ID = UUID.v1();
    if(id){
        uData = {id:id,username:un,password:pw,familyname:fn,weight:weight}
    }else{
        uData = {id:ID,username:un,password:pw,familyname:fn,weight:weight}
    }
    util.checkRedisSessionId(req.sessionID,function(err,object){
        if(err){
            res.json({ok:-1})
        }else{
            db.admins.findOne({where:{username:un}}).then((data)=>{
                console.log(data)
                if(data){
                    res.json({ok:0});
                }else{
                    db.admins.upsert(uData).then(function(data){
                    res.json({ok:1,d:data});
                })
                }
            })
        }
    })
});

tour_router.route('/delAdmin').post(function(req,res){
    var id = req.body.id;
    util.checkRedisSessionId(req.sessionID,function(err,object){
        if(err){
            res.json({ok:-1})
        }else{
            db.admins.destroy({where: {id: id}}).then(function (data) {
                res.json({ok:1,d: data});
            })
        }
    })
});

tour_router.route('/getVisits').post(function(req,res){
    var os = req.body.offset
    var lmt = req.body.limit
    var doctorNo = req.body.dn
    var h_no = req.body.h_no
    var filter = {doctor_no:doctorNo}
    if(h_no){
        filter.hospital_no = h_no
    }
    db.visits.findAndCountAll({where:filter,offset:os,limit:lmt}).then((data)=>{
        res.json({d:data});
    })
});

tour_router.route('/getOrders').post(function(req,res){
    var os = req.body.offset
    var lmt = req.body.limit
    var s = req.body.status

    db.orders.findAndCountAll({where:{status:s},offset:os,limit:lmt,include: [{model: db.goods}]}).then(function(data){
        res.json({d:data});
    })

});


tour_router.route('/updateOrders').post(function(req,res){
    var oid = req.body.id
    var st = req.body.status
    util.checkRedisSessionId(req.sessionID,function(err,object){
        if(err){
            res.json({ok:-1})
        }else{
            db.orders.update({status:st},{where:{id:oid}}).then((data)=>{
                res.json({ok:1});
            })
        }
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
    }
    db.visits.findAndCountAll({where:ud,offset:os,limit:lmt}).then(function(data){
        res.json({d:data}); 
    })
});

tour_router.route('/getReportByNo').post(function(req,res){
    var no = req.body.no
    db.reports.findOne({where:{gravida_no:no}}).then((data)=>{
        res.json({d:data});
    })
});

tour_router.route('/getTodo').get(function(req,res){
    db.reports.findOne({where:{id:no}}).then((data)=>{
        res.json({d:data});
    })
});

tour_router.route('/login').post(function(req,res){
    console.log("session:"+req.sessionID)
    var un = req.body.username
    var pw = req.body.password
    var h_no = req.body.h_no
    var filterCol = {}
    if(h_no){
        filterCol = {username:un,password:pw,hospital_no:h_no}
    }else{
        filterCol = {username:un,password:pw}
    }
    db.admins.findOne({where:filterCol}).then((data)=>{
        if(data){
            req.session.username = un
            req.session.weight = data.dataValues.weight
            req.session.login = true
            req.session.h_no = h_no
            res.json({ok:1,d:data.dataValues});
        }else{
            res.json({ok:0})
        }
    })
});

tour_router.route('/signOut').get(function(req,res){
    console.log("signOut")
    util.checkRedisSessionId(req.sessionID,function(err,object){
        if(err){
            res.json({ok:-1})
        }else{
            util.clearSession(req.sessionID)
        }
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
    db.hospitals.findAndCountAll({offset:os,limit:lmt}).then(function(data){
        res.json({d:data});
    })
});

tour_router.route('/saveHospitals').post(function(req,res){
    var id = req.body.id
    var name = req.body.name
    var host = req.body.host
    var favicon = req.body.favicon
    var admin = req.body.username
    var password = req.body.password
    var uData = {}
    var hData = {}
    var ID = UUID.v1();
    var source = require('../hospital.json');
    if(id){
        console.log("更新数据")
        hData = {id:id,name:name,host:host,favicon:favicon}
        uData = {hospital_no:id,username:admin,password:password,familyname:admin,weight:'0,1,2'}
        source[id] ={name:name,host:host,favicon:favicon,username:admin,password:password,familyname:admin}
    }else{
        console.log("插入数据")
        hData = {id:ID,name:name,host:host,favicon:favicon}
        uData = {hospital_no:ID,username:admin,password:password,familyname:admin,weight:'0,1,2'}
        source[ID] ={name:name,host:host,favicon:favicon,username:admin,password:password,familyname:admin}
    }
    var destString = JSON.stringify(source);
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
                    })
                } else {
                    res.json({ok: 0});
                }
            })
        }
    })
});

tour_router.route('/delHospitals').post(function(req,res){
    var id = req.body.id
    db.hospitals.destroy({where:{id:id}}).then(function(data){
        res.json({d:data});
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
    })
});

tour_router.route('/delDoctors').post(function(req,res){
    var id = req.body.id
    db.doctors.destroy({where:{id:id}}).then(function(data){
        res.json({d:data});
    })
});

tour_router.route('/getExpInfo').post(function(req,respone){
    var expCode=req.body.expCode
    var expNo=req.body.expNo
    var orderCode=req.body.orderCode
    var data = api.getOrderTracesByJson("YTO",885315673857929159)
    data = querystring.stringify(data);
    var opt = {
        // host:'testapi.kdniao.cc',
        host:'api.kdniao.cc',
        port:'80',
        method:'POST',
        path:'/Ebusiness/EbusinessOrderHandle.aspx',
        headers:{
            "Content-Type": 'application/x-www-form-urlencoded;charset=utf-8',
            "Content-Length": data.length
        }
    }
    var req = http.request(opt, function(res) {
        res.setEncoding('utf8');
        console.log("response: " + res.statusCode);
        var str = ""
        res.on('data',function(d){
            str += d;
            console.log(d)

        }).on('end', function(){

            var body=JSON.parse(str);
            respone.json({ok:1,d:body})
            console.log(body)
        });
    }).on('error', function(e) {
        respone.json({ok:0,err:e.message})
        console.log("error: " + e.message);
    })

    req.write(data + "\n");
    req.end();
});

module.exports=tour_router;