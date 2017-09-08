/**
 * Created by Fizzo on 17/5/23.
 */

var uitl = {}
var redis = require("redis")
var http = require("http");
var g = require('../global')
var config = g.cfg

if (config.native == 1) {
    var client = redis.createClient('6379', '127.0.0.1')
    client.on("ready", function (error) {
        console.log("ready")
    })

    client.on("error", function (error) {
        console.log(error)
    })
}




uitl.checkRedisSessionId = function (sid, res, cd) {
    if (config.native == 1) {
        client.get("sess:" + sid, function (err, object) {
            if (err) {
                res.json({ ok: g.errorCode.WRONG_SESSION_ERROR })
            } else if (object) {
                cd(JSON.parse(object))
            } else {
                res.json({ ok: g.errorCode.WRONG_SESSION_ERROR })
            }
        })
    } else {
        cd({})
    }


}

uitl.clearSession = function (req) {
    if(config.native == 1){
        client.set("sess:" + req.sessionID,'')
        req.session.destroy()
    }
        
}

uitl.accessOutUrl = function (host, port, method, path, data, sf, ef) {
    if (data) {
        data = JSON.stringify(data)
    }
    var opt = {
        host: host,
        port: port,
        method: method,
        path: path,
        headers: {
            "Content-Type": 'application/json; charset=utf-8',
        }
    }
    var _req = http.request(opt, function (res) {
        res.setEncoding('utf8');
        var str = ""
        res.on('data', function (d) {
            str += d;
        }).on('end', function () {
            var body = JSON.parse(str);
            sf(body)
        });
    }).on('error', function (e) {
        ef(e.message)
    })
    if (method == "POST") {
        _req.write(data + "\n");
    }
    _req.end();
}

module.exports = uitl