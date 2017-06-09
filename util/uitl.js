/**
 * Created by Fizzo on 17/5/23.
 */

var uitl = {}
var redis = require("redis")
var http = require("http");
var client = redis.createClient('6379', '127.0.0.1')

client.on("ready",function(error){
    console.log("ready")
})

client.on("error",function(error){
    console.log(error)
})

uitl.checkRedisSessionId = function(sid,cd){
    client.get("sess:"+sid, function(err, object) {
        console.log("sess:"+sid+':'+object)
        cd(err,JSON.parse(object))
    })
}

uitl.clearSession = function(sid){
    client.set("sess:"+sid,null)
}

uitl.accessOutUrl = function(host,port,method,path,data,sf,ef){
    data = JSON.stringify(data)
    var opt = {
        host:host,
        port:port,
        method:method,
        path:path,
        headers:{
            "Content-Type": 'application/json; charset=utf-8',
        }
    }
    var _req = http.request(opt, function(res) {
        res.setEncoding('utf8');
        var str = ""
        res.on('data',function(d){
            str += d;
        }).on('end', function(){
            var body=JSON.parse(str);
            sf(body)
        });
    }).on('error', function(e) {
        ef(e.message)
    })
    _req.write(data + "\n");
    _req.end();
}

module.exports = uitl