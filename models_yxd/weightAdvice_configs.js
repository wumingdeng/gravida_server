'use strict';
var Sequelize = require('sequelize')
var sequelize = new Sequelize('yxdDB', 'root', '2932615qian', {
  host: '121.40.254.174',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
});

var weightAdvice_configs = sequelize.define('weightAdvice_configs', {
  minWeek: Sequelize.INTEGER,
  maxWeek: Sequelize.INTEGER,
  normal: Sequelize.TEXT, //
  skinny: Sequelize.TEXT, //
  fat: Sequelize.TEXT,
  tip_normal: Sequelize.TEXT, //
  tip_skinny: Sequelize.TEXT, //
  tip_fat: Sequelize.TEXT,
  weight_size: Sequelize.INTEGER, //体重评估结果
  type: Sequelize.INTEGER,
  con_diet: Sequelize.TEXT, //饮食注意
  con_sug: Sequelize.TEXT, //建议
  },{timestamps:false});

module.exports = weightAdvice_configs