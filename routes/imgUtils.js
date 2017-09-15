var multer = require('multer');
var mkdirp = require('mkdirp');
var fs = require('fs');
var yxdDB = require('../models_yxd');
var mem = require('../memory')
var util = require('../util/uitl.js')

// var colors = []
// var times = 0 //上传的图片遍历的次数的标识
var storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    var destDir = './static/storage/'+req.body.pid+'/';
     // 判断文件夹是否存在
    fs.stat(destDir, (err)=> {
        if (err) {
            // 创建文件夹
            mkdirp(destDir, (err)=>{
                if (err) {
                    cb(err);
                } else {
                    cb(null, destDir);
                }
            });
        } else {
            cb(null, destDir);
        }
    });
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload2 = multer({ storage: storage2})


function doInit(app){
    // 带图片提交货号配置
    app.post('/saveGoodCps',upload2.array('cps'),function(req,res,next){
        var _id = req.body.id
        var _pid = req.body.pid
        var _color = req.body.color.toString()
        var _size = req.body.size.toString()
        var _name = req.body.name || ''
        var _fileNames = req.body.fileNames
        var filter = { pid: _pid, name: _name, color:_color,size:_size }
        var isModify = false
        if (_id) { //没有传id 视为添加行为
            filter.id = _id
            isModify = true
        }
        var files = req.files
        var fileStr = ''
        if(isModify && _fileNames){
            var _fileNameArr = _fileNames.split(",")
            for(var key in _fileNameArr){
                var file = _fileNameArr[key]
                console.log(file)
                fileStr += file+','
            }
            filter.pictures = fileStr.substr(0,fileStr.length-1)
        }else{
            for(var key in files){
                var file = files[key]
                //file.path.indexOf('static')+'static'.length+1 固定长度7
                var name = file.path.substr(7)
                fileStr += name+','
            }
            filter.pictures = fileStr.substr(0,fileStr.length-1)
        }
        util.checkRedisSessionId(req.sessionID, res, function (object) {
            yxdDB.gravida_storage_configs.upsert(filter).then((data)=>{
                mem.f.ReloadMemory('gravida_storage_configs',()=>{
                    res.json({ok: mem.m.gravida_storage_configs});
                })
            })
        })
    });
}

module.exports = doInit
