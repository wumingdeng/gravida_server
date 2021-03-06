var multer = require('multer');
var mkdirp = require('mkdirp');
var fs = require('fs');
var g = require('../global')
var yxdDB = require('../models_yxd');
var mem = require('../memory')
var util = require('../util/uitl.js')
var UUID = require('uuid');

// var colors = []
// var times = 0 //上传的图片遍历的次数的标识
var storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    // var destDir = __dirname+'/../static/storage/'+req.body.pid+'/';
    var destDir = __dirname+'/../static/storage/'+req.body.pid+'/';
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
    // var name = file.originalname.substr(file.originalname.lastIndexOf('.'),file.originalname.length)
    // var uuid= UUID.v1()
    cb(null,file.originalname)
  }
})
var upload2 = multer({ storage: storage2})

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // var destDir = __dirname+'/../static/storage/'+req.body.id+'/';
        var destDir = __dirname+'/../static/produce/swiper/';
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
        var name = file.originalname.substr(file.originalname.lastIndexOf('.'),file.originalname.length)
        var uuid= UUID.v1()
        cb(null, uuid+name)
    }
})
var upload = multer({ storage: storage})

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
            console.log('修改')
        }
        var files = req.files
        var fileStr = ''
        console.log(_fileNames)
        if(_fileNames){
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
                var place =  file.path.indexOf('static')+'static'.length+1
                var name = file.path.substr(place)
                fileStr += name+','
            }
            filter.pictures = fileStr.substr(0,fileStr.length-1)
        }
        util.checkRedisSessionId(req.sessionID, res, function (object) {
            if (object.weight.indexOf('601')<0){
                res.json({ok: g.errorCode.WRONG_WEIGHT});
                return
            }
            yxdDB.gravida_storage_configs.upsert(filter).then((data)=>{
                mem.f.ReloadMemory('gravida_storage_configs',()=>{
                    res.json({ok: mem.m.gravida_storage_configs});
                })
            })
        })
    });

    // 带图片提交货号配置
    app.post('/saveProduceConfig',upload.array('cps'),function(req,res,next){
        var _id = req.body.id
        var _intro = req.body.intro
        var _showPrice = req.body.showPrice
        var _swipePic = req.body.swipePic
        var _smallPic = req.body.smallPic
        var _introNum = req.body.introNum
        var _showType = req.body.showType
        var _name = req.body.name || ''
        var _goods = req.body.goods
        var _del = req.body.del
        var _hashome = req.body.hasHome
        var filter = { intro: _intro, name: _name, showPrice:_showPrice,introNum:_introNum,showType:_showType,goods:_goods}
        var isModify = false
        var _swipePicArr = [] //更新后的轮播图片的字符串数组
        if (_id) { //没有传id 视为添加行为
            filter.id = _id
            isModify = true
            console.log('修改')
        }
        var fileStr = '' //轮播的字符串
        if(_del){
            var _delArr = _del.split(',')
            console.log('是删除求情...')
            _swipePicArr = _swipePic.split(',')
            for(var k in _delArr){
                var url = _delArr[k]
                var startIdx = url.indexOf('produce/swiper')
                var fileName = url.substr(startIdx,url.length)
                var delpp = _swipePicArr.indexOf(fileName) //是删除图片的位置
                if(delpp>=0){
                    _swipePicArr.splice(delpp,1)
                }
                fileName = './static/'+fileName
                util.deletefile(fileName)
            }
            fileStr = _swipePicArr.toString()
        }else if(_swipePic){
            fileStr = _swipePic
        }
        if(_hashome) {
            var startIdx = _smallPic.indexOf('produce/swiper')
            var _smallPic = _smallPic.substr(startIdx,_smallPic.length)
            _smallPic = './static/'+_smallPic
            console.log('替换首页图片...:'+_smallPic)
            util.deletefile(_smallPic)
        }
        var files = req.files
        var isAddImg = false //是是否有添加或者替换新的轮播图片
        if(isModify){
            if(files){
                var i = 0
                if(_hashome){ //是否有更新首页图片
                    var homeimg = files[i]
                    var place =  homeimg.path.indexOf('static')+'static'.length+1
                    filter.smallPic = homeimg.path.substr(place,homeimg.path.length)
                    console.log(filter.smallPic)
                    i++
                }
                for(;i<files.length;i++){
                    isAddImg = true
                    var file = files[i]
                    var place =  file.path.indexOf('static')+'static'.length+1
                    var name = file.path.substr(place,file.path.length)
                    fileStr += name+','
                }
            }
            if(isAddImg){
                filter.swipePic = fileStr.substr(0,fileStr.length-1)
            }else{
                filter.swipePic = fileStr
            }
        }else{
            var homeimg = files[0]
            var place =  homeimg.path.indexOf('static')+'static'.length+1
            filter.smallPic = homeimg.path.substr(place,homeimg.path.length)
            for(var i =1;i<files.length;i++){
                var file = files[i]
                var place =  file.path.indexOf('static')+'static'.length+1
                var name = file.path.substr(place,file.path.length)
                fileStr += name+','
            }
            filter.swipePic = fileStr.substr(0,fileStr.length-1)
        }
        util.checkRedisSessionId(req.sessionID, res, function (object) {
            if (object.weight.indexOf('602')<0){
                res.json({ok: g.errorCode.WRONG_WEIGHT});
                return
            }
            yxdDB.products.upsert(filter).then((data)=>{
                res.json({ok:1});
            })
        })
    });
}

module.exports = doInit
