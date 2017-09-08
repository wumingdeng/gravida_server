'use strict';
module.exports = function(sequelize, DataTypes) {
  var gravida_storage_records = sequelize.define('gravida_storage_records', {
    pid:DataTypes.STRING,
    type:DataTypes.INTEGER,
    desc:DataTypes.INTEGER,
    color:DataTypes.STRING,
    size:DataTypes.INTEGER,
    desc_con:DataTypes.STRING,
    amount:DataTypes.INTEGER,
    createtime:DataTypes.BIGINT
  },{
    timestamps:false,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.gravida_storage_records.belongsTo(models.gravida_storage_configs,{foreignKey:'pid',targetKey:'pid',sourceKey:'pid'})
      }
    }
  });
  return gravida_storage_records;
};