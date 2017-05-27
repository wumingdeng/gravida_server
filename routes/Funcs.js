var express=require('express');
var tour_router=express.Router();
var process = require('process');
var db = require('../models')
var util = require('../uitl.js')

tour_router.route('/getAdmins').post(function(req,res){
    var os = req.body.offset
    var lmt = req.body.limit
    db.admins.findAndCountAll({offset:os,limit:lmt}).then(function(data){
        res.json({d:data});
    })
});

tour_router.route('/getAdminByName').post(function(req,res){
    var v = req.body.v
    var os = req.body.offset
    var lmt = req.body.limit
    db.admins.findAndCountAll({where:{familyname:{$like:'%'+v+'%'}},offset:os,limit:lmt}).then(function(data){
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
    if(id){
        uData = {id:id,username:un,password:pw,familyname:fn,weight:weight}
    }else{
        uData = {username:un,password:pw,familyname:fn,weight:weight}
    }
    util.checkRedisSessionId(req.sessionID,function(err,object){
        if(err){
            res.json({ok:-1})
        }else{
            db.admins.upsert(uData).then(function(data){
                res.json({ok:1,d:data});
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
    db.visits.findAndCountAll({where:{doctor_no:doctorNo},offset:os,limit:lmt}).then((data)=>{
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
    db.admins.findOne({where:{username:un,password:pw}}).then((data)=>{
        if(data){
            req.session.username = un
            req.session.weight = data.dataValues.weight
            req.session.login = true
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
    var uData = {}
    if(id){
        uData = {id:id,name:name}
    }else{
        uData = {name:name}
    }
    db.hospitals.upsert(uData).then(function(data){
        res.json({d:data});
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

module.exports=tour_router;