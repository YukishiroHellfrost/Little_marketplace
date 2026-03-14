// Importar modelos (el orden no es crítico aquí)
const { User } = require("../models/UserModel.js");
const { Inventory } = require("../models/InventoryModel.js");
const { Movement } = require("../models/MovementModel.js");
const { Product } = require("../models/ProductModel.js");
const { Store } = require("../models/StoreModel.js");
const { Transaction } = require("../models/TransactionModel.js");

const asociations=async()=>{
    console.log('🔍 Verificando modelos en asociations:');
    console.log('User:', User ? '✅' : '❌');
    console.log('Product:', Product ? '✅' : '❌');
    console.log('Store:', Store ? '✅' : '❌');
    console.log('Transaction:', Transaction ? '✅' : '❌');
    console.log('Movement:', Movement ? '✅' : '❌');
    console.log('Inventory:', Inventory ? '✅' : '❌');

    // Store ↔ User
    Store.hasMany(User, { foreignKey: 'storeId', as: 'users' });
    User.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

    // Store ↔ Product (N:M) a través de Inventory
    Store.belongsToMany(Product, {
      through: Inventory,
      foreignKey: 'storeId',
      otherKey: 'productId',
      as: 'products'
    });
    Product.belongsToMany(Store, {
      through: Inventory,
      foreignKey: 'productId',
      otherKey: 'storeId',
      as: 'stores'
    });

    // Relaciones directas con Inventory
    Inventory.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
    Inventory.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
    Store.hasMany(Inventory, { foreignKey: 'storeId', as: 'inventoryItems' });
    Product.hasMany(Inventory, { foreignKey: 'productId', as: 'inventoryItems' });

    // Transaction
    Transaction.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });
    Transaction.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
    Store.hasMany(Transaction, { foreignKey: 'storeId', as: 'transactions' });
    Product.hasMany(Transaction, { foreignKey: 'productId', as: 'transactions' });

    // Movement
    Movement.belongsTo(Store, { foreignKey: 'fromStoreId', as: 'fromStore' });
    Movement.belongsTo(Store, { foreignKey: 'toStoreId', as: 'toStore' });
    Movement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
    Store.hasMany(Movement, { foreignKey: 'fromStoreId', as: 'outgoingMovements' });
    Store.hasMany(Movement, { foreignKey: 'toStoreId', as: 'incomingMovements' });
    Product.hasMany(Movement, { foreignKey: 'productId', as: 'movements' });

    console.log('✅ Asociaciones definidas correctamente');
}
module.exports=asociations