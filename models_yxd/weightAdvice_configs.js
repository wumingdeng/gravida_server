'use strict';
// var Sequelize = require('sequelize')
// var sequelize = new Sequelize('yxdDB', 'root', '2932615qian', {
//   host: '121.40.254.174',
//   dialect: 'mysql',
//   pool: {
//     max: 5,
//     min: 0,
//     idle: 10000
//   },
//   logging: false
// });

// var weightAdvice_configs = sequelize.define('weightAdvice_configs', {
//   minWeek: Sequelize.INTEGER,
//   maxWeek: Sequelize.INTEGER,
//   normal: Sequelize.TEXT, //
//   skinny: Sequelize.TEXT, //
//   fat: Sequelize.TEXT,
//   tip_normal: Sequelize.TEXT, //
//   tip_skinny: Sequelize.TEXT, //
//   tip_fat: Sequelize.TEXT,
//   weight_size: Sequelize.INTEGER, //体重评估结果
//   type: Sequelize.INTEGER,
//   con_diet: Sequelize.TEXT, //饮食注意
//   con_sug: Sequelize.TEXT, //建议
//   },{timestamps:false});

// module.exports = weightAdvice_configs

'use strict';
module.exports = function(sequelize, DataTypes) {
  var weightAdvice_configs = sequelize.define('weightAdvice_configs', {
    minWeek: DataTypes.INTEGER,
    maxWeek: DataTypes.INTEGER,
    weight_size: DataTypes.INTEGER, //体重评估结果
    type: DataTypes.INTEGER,
    con_diet: DataTypes.TEXT, //饮食注意
    con_sug: DataTypes.TEXT, //建议
    con_sign: DataTypes.TEXT, //建议
  }, {
    timestamps:false,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return weightAdvice_configs;
};