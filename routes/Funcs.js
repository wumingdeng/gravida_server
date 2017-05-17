var express=require('express');
var tour_router=express.Router();
var process = require('process');
var db = require('../models')

var redis = require("redis")
var client = redis.createClient('6379', '127.0.0.1')

client.on("ready",function(error){
    console.log("ready")
})

client.on("error",function(error){
    console.log(error)
})

tour_router.route('/getAdmins').post(function(req,res){
    console.log("sess:"+req.sessionID)
    client.get("sess:"+req.sessionID, function(err, object) {
        if(err){
            console.log(err)
        }else{
            console.log(object)
        }

    })
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
    var weight = req.body.weight
    var uData = {}
    if(id){
        uData = {id:id,username:un,password:pw,familyname:fn,weight:weight}
    }else{
        uData = {username:un,password:pw,familyname:fn,weight:weight}
    }
    db.admins.upsert(uData).then(function(data){
        res.json({d:data});
    })
});

tour_router.route('/delAdmin').post(function(req,res){
    var id = req.body.id;
    db.admins.destroy({where:{id:id}}).then(function(data){
        res.json({d:data});
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
    db.orders.findAndCountAll({where:{status:s},offset:os,limit:lmt}).then(function(data){
        res.json({d:data});
    })
});


tour_router.route('/updateOrders').post(function(req,res){
    var oid = req.body.id
    var st = req.body.status
    db.orders.update({status:st},{where:{id:oid}}).then((data)=>{
        res.json({ok:1}); 
    })
});

tour_router.route('/getOrdersBylike').post(function(req,res){
    var os = req.body.offset
    var lmt = req.body.limit
    var value = req.body.v
    var key = req.body.k
    var ud = {}
    switch(key){
        case "exp_no":
            ud = {exp_no:value}
            break;
        case "name":
            ud = {name:value}
            break;
        case "status":
            ud = {status:value}
            break;
        case "pro_no":
            ud = {pro_no:value}
            break;
        default:
            break;
    }
    db.orders.findAndCountAll({where:ud,offset:os,limit:lmt}).then(function(data){
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
    db.reports.findOne({where:{id:no}}).then((data)=>{
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
            res.json({d:data.dataValues,sid:req.sessionID});
        }
    })
});

tour_router.route('/signOut').get(function(req,res){
    client.get("sess:"+req.sessionID, function(err, object) {
        if(err){
            console.log(err)
        }else{
            req.session.login = false
            console.log(object)
        }
    })
});

module.exports=tour_router;