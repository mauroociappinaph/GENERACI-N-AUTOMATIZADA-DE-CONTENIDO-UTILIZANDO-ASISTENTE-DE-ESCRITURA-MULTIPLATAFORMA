import { PrismaClient, UserRole } from '@prisma/client';
import { PasswordService } from '../src/services/password.service';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Verificar si ya existe un usuario admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: UserRole.ADMIN }
    });

    if (existingAdmin) {
      console.log('Ya existe un usuario administrador:', existingAdmin.email);
      return;
    }

    // Crear usuario administrador por defecto
    const adminEmail = 'admin@sistema040.com';
    const adminPassword = 'admin123';

    const hashedPassword = await PasswordService.hashPassword(adminPassword);

    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hashedPassword,
        firstName: 'Administrador',
        lastName: 'Sistema',
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 Nombre:', `${adminUser.firstName} ${adminUser.lastName}`);
    console.log('🛡️ Rol:', adminUser.role);

    // Crear algunos usuarios de prueba adicionales
    const testUsers = [
      {
        email: 'manager@sistema040.com',
        password: 'manager123',
        firstName: 'Gerente',
        lastName: 'Prueba',
        role: UserRole.MANAGER,
      },
      {
        email: 'user@sistema040.com',
        password: 'user123',
        firstName: 'Usuario',
        lastName: 'Prueba',
        role: UserRole.USER,
      },
    ];

    for (const userData of testUsers) {
      const hashedPassword = await PasswordService.hashPassword(userData.password);

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          isActive: true,
        },
      });

      console.log(`✅ Usuario ${userData.role.toLowerCase()} creado: ${userData.email} / ${userData.password}`);
    }

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
