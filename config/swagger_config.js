const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de gestión de puntos de venta',
      version: '1.0.0',
      description: 'Documentación de la API para gestión de puntos de venta',
    },
    servers: [
      {
        url: `http://${process.env.HOST}:${process.env.PORT}/`, // Ajusta según tu configuración
        description: 'Servidor local',
      },
    ],
    components: {
      //Esquema de seguridad para JWT
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      
    },
  },
  apis: ['./routes/*.js'], // Archivos donde buscar comentarios JSDoc
};

module.exports = swaggerJSDoc(options);