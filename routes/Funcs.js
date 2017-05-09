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

tour_router.route('/getOrders').get(function(req,res){
    db.orders.findAll().then(function(data){
        res.json({d:data});
    })
});

tour_router.route('/reloadDbStaticData').get(function(req,res){
    process.send({ type: 'reloadDbStaticData' });
});

module.exports=tour_router;