var redis = require("redis");
var f = require('./commonFunc');
var cf = require('../controllers/commonController');
var sub = redis.createClient() ,pub = redis.createClient();
sub.psubscribe("__keyspace@0__:*");
sub.subscribe("memory-channel");
// config set notify-keyspace-events Kx
sub.on("pmessage", function (channel, message) {
    var key = message.split(":")
    if(key.length<3){
        return
    }
    var tablename = key[1];
    var idNumber = parseInt(key[2]);
    if(tablename === 'pe'){
        var uid = parseInt(key[3])
        cf.OnPayIdExpired(idNumber,uid)
    }else if(tablename === 'ae'){ // 用户选择技师无响应
        cf.OnAssignIdExpired(idNumber)
    }else if(tablename === 'aes'){ // 系统派单
        cf.OnAssignIdSystemExpired(idNumber)
    }else if(tablename === 'eie'){ // 通知产检触发
        cf.OnExamReadyConfirm(idNumber)
    }else if(tablename === 'ee'){ // 用户无响应通知产检
        cf.OnExamConfirmExpired(idNumber)
    }
    console.log("expired channel " + tablename + ": " + idNumber);
});

sub.on("message", function (channel, message) {
    if(message.indexOf(':')!=-1){
        var fs = message.split(':')
        if(fs.length>1){
            f.ReloadWorkersMemory(parseInt(fs[1]))
        }
    }else{
        if(message === "cat_s"){
            f.ReloadCatServicesMemory()
        }else{
            f.ReloadMemory(message);
        }
    }
});
var redis = {
    pub:pub
    // sub:sub
}
module.exports = redis;