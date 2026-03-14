// models/StoreModel.js
const { DataTypes, Model } = require('sequelize');
const { db } = require('../config/bd_config');
class Store extends Model {}
 Store.init({
  direction: { type: DataTypes.STRING, allowNull: false }
}, {
  sequelize: db,
  modelName: 'Store',
  tableName: 'stores',
  timestamps: true
});

module.exports = { Store };