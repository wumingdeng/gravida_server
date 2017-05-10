var express=require('express');
var tour_router=express.Router();
var process = require('process');
var db = require('../models')
tour_router.route('/getAdmins').get(function(req,res){
    db.admins.findAll().then(function(data){
        res.json({d:data});
    })
});

tour_router.route('/saveAdmin').post(function(req,res){
    var un = req.body.un
    var pw = req.body.pw
    db.admins.upsert().then(function(data){
        res.json({d:data});
    })
});

tour_router.route('/delAdmin').get(function(req,res){
    var un = req.query.un;
    db.admins.destroy({where:{username:un}}).then(function(data){
        res.json({d:data});
    })
});

tour_router.route('/getVisits').get(function(req,res){
    db.visits.findAll().then(function(data){
        res.json({d:data});
    })
});

tour_router.route('/getOrders').post(function(req,res){
    var os = req.body.offset
    var lmt = req.body.limit
    db.orders.findAndCountAll({offset:os,limit:lmt}).then(function(data){
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


module.exports=tour_router;