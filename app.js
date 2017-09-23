var pm2 = require('pm2');

const numCPUs = require('os').cpus().length;

// sub forked process
var process_list = [];
function cacheApps() {
  function getProcList() {
    pm2.list(function(err, list) {
      if (err) {
        console.error(err);
        return;
      }
      process_list = list.map(function(proc) {
        return {
          name : proc.name,
          pm_id : proc.pm_id
        };
      });
    });
  }
  getProcList();
}

// start up
pm2.connect(function(err) {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.start({
    script    : 'index.js',       // Script to be run
    exec_mode : 'cluster',        // Allow your app to be clustered
    instances : numCPUs,          // Optional: Scale your app by 4
    max_memory_restart : '700M',  // Optional: Restart your app if it reaches 100Mo
    watch: [  // 监控变化的目录，一旦变化，自动重启
      "models",
      "models_yxd",
      "global",
      "routes"
    ],
    ignore_watch : [  // 从监控目录中排除
      "node_modules",
      "logs",
      "static"
    ],
    error_file    : "./err.log",
    out_file  : "./out.log",
    error: "./err.log",
    output: "./out.log",
    pid   : "/Users/Fizzo/logs/child.pid",
    mergeLogs      : true,
    logDateFormat : "YYYY-MM-DD HH:mm"
  }, function(err, apps) {
    pm2.disconnect();   // Disconnect from PM2
    if (err) throw err
  });
});

// pm2.launchBus(function(err, bus) {
//   cacheApps();
//   bus.on('process:msg', function(packet) {

//       console.log("here")
//     for(var i =0 ;i<len(process_list);i++){
//         pm2.sendDataToProcessId(process_list[i].pm_id, packet);
//     }
//   });
// });

// function exit() {
//   pm2.disconnect();
// }

// process.on('SIGINT', function() {
//   exit();
//   setTimeout(function() {
//     process.exit(0);
//   }, 200);
// });