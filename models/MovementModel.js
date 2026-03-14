const { DataTypes, Model } = require('sequelize');
const { db } = require('../config/bd_config');
class Movement extends Model {}
Movement.init({
  stock: {
    type: DataTypes.DECIMAL,
    allowNull: false
  },
  fromStoreId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'stores', key: 'id' }
  },
  toStoreId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'stores', key: 'id' }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'products', key: 'id' }
  },
correctionOfId: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: { model: 'transactions', key: 'id' }
}
}, {
  sequelize: db,
  modelName: 'Movement',
  tableName: 'movements',
  timestamps: true
});

module.exports = { Movement };