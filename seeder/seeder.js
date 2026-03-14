const bcrypt = require('bcryptjs');
const { User } = require('../models/UserModel');
const { pause, inquirerMenu, inquirerReader, inquirerConfirm } = require("../config/inquirer.config");

const checkExistingSuperUser = async () => {
  return await User.findOne({ where: { role: 'SUPERUSER' } });
};

const createSuperUser = async (userData) => {
  try {
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await User.create({
      name: userData.name,
      role: 'SUPERUSER',
      password: hashedPassword,
      googleAuth: false,
      state: true,
      storeId: null
    });
    
    console.log('✅ SuperUsuario creado exitosamente'.green);
    return user;
  } catch (error) {
    console.error('❌ Error al crear SuperUsuario:', error.message.red);
    throw error;
  }
};

const updateSuperUser = async (existingUser, newData) => {
  try {
    const hashedPassword = await bcrypt.hash(newData.password, 10);
    
    await existingUser.update({
      name: newData.name,
      password: hashedPassword,
      state: true
    });
    
    console.log('✅ SuperUsuario actualizado exitosamente'.green);
    return existingUser;
  } catch (error) {
    console.error('❌ Error al actualizar SuperUsuario:', error.message.red);
    throw error;
  }
};

const seedSuperUser = async () => {
  console.clear();
  console.log('\n🛡️  CREACIÓN DE SUPERUSUARIO'.cyan.bold);
  console.log('═'.repeat(40).grey);

  // Verificar si ya existe
  const existingSuperUser = await checkExistingSuperUser();
  
  if (existingSuperUser) {
    console.log(`\n⚠️  Ya existe un SuperUsuario:`.yellow);
    console.log(`   Nombre: ${existingSuperUser.name}`.cyan);
    console.log(`   Creado: ${existingSuperUser.createdAt}`.cyan);
    
    const confirmOverwrite = await inquirerConfirm(
      '¿Ya existe un SuperUsuario. ¿Está seguro que desea reescribirlo?'
    );
    
    if (!confirmOverwrite) {
      console.log('\n🟡 Operación cancelada. El SuperUsuario existente no fue modificado.'.yellow);
      return;
    }
  }

  // Solicitar datos al administrador
  console.log('\n📝 Ingrese los datos del nuevo SuperUsuario:'.cyan);
  
  const name = await inquirerReader('Nombre de usuario:');
  const password = await inquirerReader('Contraseña:');
  const confirmPassword = await inquirerReader('Confirme la contraseña:');

  // Validar que las contraseñas coincidan
  if (password !== confirmPassword) {
    console.log('❌ Las contraseñas no coinciden'.red);
    return;
  }

  // Validar longitud mínima (opcional)
  if (password.length < 6) {
    console.log('❌ La contraseña debe tener al menos 6 caracteres'.red);
    return;
  }

  const confirmCreate = await inquirerConfirm(
    existingSuperUser 
      ? '¿Confirmar la reescritura del SuperUsuario?' 
      : '¿Confirmar la creación del SuperUsuario?'
  );

  if (!confirmCreate) {
    console.log('\n🟡 Operación cancelada.'.yellow);
    return;
  }

  // Crear o actualizar según corresponda
  if (existingSuperUser) {
    await updateSuperUser(existingSuperUser, { name, password });
  } else {
    await createSuperUser({ name, password });
  }

  console.log('\n✨ Operación completada.'.green);
};

const seeder = async () => {
  let option = -1;

  do {
    console.clear();
    console.log('\n🌱  SEEDER DE BASE DE DATOS'.cyan.bold);
    console.log('═'.repeat(40).grey);
    
    option = await inquirerMenu();

    switch (option) {
      case 1:
        await seedSuperUser();
        break;
      case 2:
        console.log("Case 2 - Crear Usuario de prueba");
        // Aquí iría la lógica para crear usuarios de prueba
        break;
      case 0:
        console.log('\n👋 ¡Hasta luego!'.green);
        break;
      default:
        console.log("❌ Opción inválida".red);
    }

    if (option !== 0) await pause();
  } while (option !== 0);
};

// Ejecutar solo si se llama directamente
if (require.main === module) {
  seeder();
}

module.exports = { seedSuperUser, seeder };