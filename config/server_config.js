const express = require('express');
const cors = require("cors");
const { db, connectDB } = require("./bd_config.js");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger_config.js');
const { notFoundHandler, errorHandler } = require("../middlewares/error_handler.js");
const asociations = require('../models/asociations.js');


class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;

    // 1. Definir asociaciones (ANTES de conectar)
    this.asociate();

    // 2. Conectar y sincronizar base de datos (EN ORDEN MANUAL)
    this.db_listen();

    // 3. Middlewares y rutas
    this.middleware();
    this.routes();
    this.errorHandling();
  }

  middleware() {
    this.app.use(express.json());
    this.app.use(express.static("public"));
    this.app.use(cors());
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  routes() {
    this.app.use("/api/user", require("../routes/UserRouter.js"));
    this.app.use("/api/auth", require("../routes/AuthRouter.js"));
    this.app.use("/api/products", require("../routes/ProductRouter.js"));
    this.app.use("/api/stores", require("../routes/StoreRouter.js"));
    this.app.use("/api/transactions", require("../routes/TransactionRouter.js"));
    this.app.use("/api/movements", require("../routes/MovementRouter.js"));
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log("Escuchando puerto", this.port);
    });
  }

  errorHandling() {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  async db_listen() {
    await connectDB();

    console.log('🔄 Sincronizando tablas en orden...');
    await db.sync({ alter: true });        // Sincronizar tablas    
    console.log('✅ Tablas sincronizadas correctamente');
  }

  async asociate() {
    await asociations();
  }
}

module.exports = Server;