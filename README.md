# 🛒 Little Marketplace - Backend API

Bienvenido al backend de **Little Marketplace**, una API RESTful diseñada para gestionar usuarios, tiendas, productos, inventarios, transacciones y movimientos. Este sistema está construido con Node.js y PostgreSQL, utilizando Sequelize como ORM para la base de datos. La API está documentada con Swagger y cuenta con un sistema de autenticación JWT basado en roles (SUPERUSER, SUPERVISOR, SELLER, CLIENT).

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una arquitectura **MVC (Modelo-Vista-Controlador)** con una capa de servicios para separar la lógica de negocio de los controladores. Esto garantiza un código limpio, mantenible y escalable.

- **Modelos (Models)**: Definen las entidades de la base de datos y sus relaciones (usuarios, tiendas, productos, inventarios, transacciones, movimientos).
- **Controladores (Controllers)**: Manejan las peticiones HTTP, invocan los servicios y devuelven las respuestas.
- **Servicios (Services)**: Contienen la lógica de negocio, validaciones, transacciones y operaciones con la base de datos.
- **Middlewares**: Gestionan la autenticación (`authorization`), autorización por roles (`authorize`), manejo de errores y otras tareas transversales.
- **Rutas (Routes)**: Definen los endpoints de la API y asocian los middlewares y controladores correspondientes.
- **Configuración**: Archivos de configuración para la base de datos, Swagger, variables de entorno, etc.
- **Utilidades (Utils)**: Clases y funciones auxiliares, como el manejador de errores personalizado.

### 🗄️ Base de Datos

Se utiliza **PostgreSQL** como motor de base de datos relacional. Las principales tablas y relaciones son:

- **users**: Almacena los usuarios del sistema, con roles definidos (SUPERUSER, CLIENT, SELLER, SUPERVISOR).
- **stores**: Tiendas físicas o virtuales.
- **products**: Productos disponibles en el sistema.
- **inventories**: Relación muchos a muchos entre tiendas y productos, con el stock actual.
- **transactions**: Registro de entradas (Inbound) y salidas (Sale) de productos en cada tienda.
- **movements**: Traslados de productos entre tiendas (origen y destino).

Las relaciones se gestionan mediante claves foráneas y están optimizadas con índices.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu sistema:

- **Node.js** (v20 o superior recomendado)  
- **PostgreSQL** (v12 o superior)  
- **npm** o **yarn** (incluido con Node.js)

## ⚙️ Configuración del Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables de entorno. **No compartas este archivo ni lo subas al repositorio** (ya está incluido en `.gitignore`).

```env
# Puerto en el que correrá el servidor
PORT=3000

# Configuración de la base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASS=tu_contraseña
DB_NAME=nombre_de_tu_base_de_datos

# Clave secreta para firmar los tokens JWT (cámbiala por una segura)
JWT_SECRET=Key

# Entorno de ejecución (development, production, etc.)
NODE_ENV=development
```

> **Nota de seguridad**: Nunca uses valores reales en el README. En producción, asegúrate de utilizar contraseñas fuertes y mantener las claves secretas en un lugar seguro.

## 🚀 Instalación y Ejecución

Sigue estos pasos para poner en marcha el proyecto:

1. **Clona el repositorio** (si no lo tienes local):
   ```bash
   git clone https://github.com/tu-usuario/little_marketplace.git
   cd little_marketplace
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Configura las variables de entorno** como se indicó anteriormente.

4. **Crea la base de datos** en PostgreSQL:
   ```sql
   CREATE DATABASE DB_NAME;
   ```

5. **Ejecuta las migraciones y seeders** (opcional, pero recomendado para desarrollo):
   ```bash
   npm run seeder
   ```
   Este comando iniciará un asistente interactivo que te permitirá crear el primer **SuperUsuario** del sistema. Si ya existe un superusuario, te preguntará si deseas sobrescribirlo.

6. **Inicia el servidor**:
   ```bash
   npm start
   ```
   Para desarrollo con autorecarga:
   ```bash
   npm run nodemon
   ```

El servidor estará disponible en `http://localhost:${process.env.PORT}`.

## 🌱 Seeder: Creación del SuperUsuario

El proyecto incluye un seeder interactivo para crear el primer usuario con rol **SUPERUSER**, necesario para gestionar el sistema. Para ejecutarlo:

```bash
npm run seeder
```

El script te guiará por un menú donde podrás:
- Crear o sobrescribir el superusuario por defecto.
- Crear usuarios personalizados.
- En el futuro, agregar datos de prueba (productos, tiendas, etc.).

**Importante**: El seeder solo debe ejecutarse en entornos de desarrollo o para la configuración inicial. En producción, se recomienda crear el superusuario mediante migraciones o scripts controlados.

## 📚 Documentación de la API (Swagger)

La API está completamente documentada con **Swagger**. Una vez que el servidor esté en ejecución, puedes acceder a la documentación interactiva en:

```
http://localhost:PORT/api-docs
```

Allí encontrarás todos los endpoints disponibles, los parámetros esperados, los esquemas de respuesta y podrás probar las peticiones directamente desde el navegador. Para las rutas protegidas, deberás autenticarte primero:

1. Haz clic en el botón **Authorize** (arriba a la derecha).
2. Ingresa el token JWT obtenido tras hacer login en `POST /api/auth/login`.
3. A partir de ese momento, todas las peticiones incluirán el token automáticamente.

## 🔐 Autenticación y Roles

El sistema utiliza **JSON Web Tokens (JWT)** para la autenticación. Los roles definidos son:

- **SUPERUSER**: Acceso total a todas las operaciones.
- **SUPERVISOR**: Puede consultar usuarios y ver información detallada, pero no crear, modificar ni eliminar.
- **SELLER** y **CLIENT**: Tienen permisos limitados (actualmente en desarrollo).

Para obtener un token, envía una petición `POST` a `/api/auth/login` con las credenciales de un usuario existente (por ejemplo, el superusuario creado con el seeder). El token recibido deberá incluirse en el header de las peticiones posteriores como:

```
Authorization: Bearer <tu_token>
```

## 📁 Estructura del Proyecto

```
little_marketplace/
├── config/                 # Configuración de BD, Swagger, servidor
├── controllers/            # Controladores (UserController, AuthController)
├── middlewares/            # Middlewares de autenticación y autorización
├── models/                 # Modelos de Sequelize (User, Store, Product, etc...)
├── routes/                 # Definición de rutas (UserRouter, AuthRouter, etc...)
├── seeders/                # Scripts para poblar la BD (seeder interactivo)
├── services/               # Lógica de negocio (UserService, TransactionService, etc...)
├── utils/                  # Utilidades (manejo de errores, etc.)
├── .env                    # Variables de entorno (no versionado)
├── .gitignore
├── app.js                  # Punto de entrada de la aplicación
├── package.json
└── README.md               # Este archivo
```

## 🛠️ Tecnologías y Librerías Utilizadas

- **Node.js** (v20) – Entorno de ejecución.
- **Express** – Framework web para Node.js.
- **PostgreSQL** – Base de datos relacional.
- **Sequelize** – ORM para la gestión de la base de datos.
- **jsonwebtoken** – Creación y verificación de tokens JWT.
- **bcryptjs** – Encriptación de contraseñas.
- **dotenv** – Manejo de variables de entorno.
- **cors** – Middleware para habilitar CORS.
- **swagger-jsdoc** y **swagger-ui-express** – Documentación interactiva de la API.
- **inquirer** – Creación de menús interactivos para el seeder.
- **colors** – Colores en la consola para una mejor experiencia.
- **pg** y **pg-hstore** – Drivers de PostgreSQL para Node.js.

## 📌 Notas Adicionales

- En **desarrollo**, la base de datos se sincroniza automáticamente con `{ force: true }` para recrear las tablas en cada inicio. Si deseas conservar datos, cambia a `{ alter: true }` en `server_config.js`.
- En **producción**, desactiva la sincronización automática y utiliza migraciones controladas con `sequelize-cli`.
- El proyecto está configurado para usar el puerto 3000, pero puedes cambiarlo mediante la variable `PORT` en el `.env`.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si encuentras algún error o deseas mejorar el proyecto, por favor abre un issue o envía un pull request.

---

¡Gracias por usar **Little Marketplace**! Si tienes alguna duda, no dudes en contactarme.

---