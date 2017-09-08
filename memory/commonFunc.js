
var m = require('./memoryVarible')
var db = require('../models_yxd')
var mod = {
    ReloadMemory :function(tbl,fb){
        // reload all
        // configs,swipe_configs,services,catalogs,work_services
        if(tbl=='gravida_storage_configs'){
            db[tbl].findAll().then(function(data){
                m[tbl] = {}
                for(var i = 0;i<data.length;i++){
                    m[tbl][data[i].pid]=data[i].dataValues
                }
                fb()
            })
        }else{
            db[tbl].findAll().then(function(data){
                m[tbl] = {}
                for(var i = 0;i<data.length;i++){
                    m[tbl][data[i].id]=data[i].dataValues
                }
                fb()
            })
        }
    },
    InitDbMemory :function(){
        db.gravida_storage_configs.findAll().then(function(data){
            for(var i = 0;i<data.length;i++){
                m.gravida_storage_configs[data[i].pid]=data[i].dataValues
            }
            db.gravida_desc_configs.findAll().then(function(data2){
                for(var i = 0;i<data2.length;i++){
                    m.gravida_desc_configs[data2[i].id]=data2[i].dataValues
                }
                db.gravida_color_configs.findAll().then(function(data3){
                    for(var i = 0;i<data3.length;i++){
                        m.gravida_color_configs[data3[i].id]=data3[i].dataValues
                    }
                })
            })
        })
    }
}

module.exports = mod