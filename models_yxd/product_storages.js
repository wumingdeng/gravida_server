'use strict';
module.exports = function(sequelize, DataTypes) {
  var gravida_product_storages = sequelize.define('gravida_product_storages', {
    pid:DataTypes.STRING,
    color:DataTypes.INTEGER,
    size:DataTypes.INTEGER,
    amount: DataTypes.INTEGER
  },{
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.gravida_product_storages.belongsTo(models.gravida_storage_configs,{foreignKey:'pid',targetKey:'pid',sourceKey:'pid'})
      }
    }
  });
  return gravida_product_storages;
};