/**
 * Created by Fizzo on 17/5/23.
 */

var uitl = {}
var redis = require("redis")
var client = redis.createClient('6379', '127.0.0.1')

client.on("ready",function(error){
    console.log("ready")
})

client.on("error",function(error){
    console.log(error)
})


uitl.checkRedisSessionId = function(sid){
    client.get("sess:"+sid, function(err, object) {
        if(err){
            return false
        }else{
            if(object){
                return object
            }else{
                return false
            }
        }
    })
}

uitl.clearSession = function(sid){
    client.set("sess:"+sid,null)
}

module.exports = uitl