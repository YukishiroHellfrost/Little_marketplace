// models/TransactionModel.js
const { DataTypes, Model } = require('sequelize');
const { db } = require('../config/bd_config');
class Transaction extends Model {}
 Transaction.init({
  tag: { type: DataTypes.ENUM('Sale', 'Inbound'), allowNull: false },
  price: { type: DataTypes.DECIMAL, allowNull: false }, // precio total de la operación
  quantity: { type: DataTypes.DECIMAL, allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
  storeId: {  // ← FK
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'stores', key: 'id' }
  },
  productId: { // ← FK
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'products', key: 'id' }
  },
correctionOfId: {//Corrector de transacciones
  type: DataTypes.INTEGER,
  allowNull: true,
  references: { model: 'transactions', key: 'id' }
}
},
 
{
  sequelize: db,
  modelName: 'Transaction',
  tableName: 'transactions',
  timestamps: true
});

module.exports = { Transaction };