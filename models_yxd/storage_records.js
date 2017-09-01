'use strict';
module.exports = function(sequelize, DataTypes) {
  var storage_records = sequelize.define('gravida_storage_records', {
    pid:DataTypes.STRING,
    type:DataTypes.INTEGER,
    desc:DataTypes.INTEGER,
    desc_con:DataTypes.STRING,
    amount:DataTypes.INTEGER,
    createtime:DataTypes.BIGINT
  },{
    timestamps:false,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return storage_records;
};