const prisma = require('../config/prismaClient');

// Create a user with optional telefono and related Cliente/Administrador records
async function createUser({ nombre, email, password, tipo = 'cliente', telefono, direccion, nivel_acceso, departamento }) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.usuario.create({
      data: { nombre, email, password, tipo, telefono }
    });

    if (tipo === 'cliente' && direccion) {
      await tx.cliente.create({
        data: { id: user.id, direccion }
      });
    }

    if (tipo === 'administrador') {
      await tx.administrador.create({
        data: {
          id: user.id,
          nivel_acceso: nivel_acceso || 'basico',
          departamento: departamento || null,
        }
      });
    }

    return user;
  });
}

async function getUserByEmail(email) {
  return prisma.usuario.findUnique({ where: { email } });
}

async function getUserByIdWithRelations(id) {
  return prisma.usuario.findUnique({
    where: { id },
    include: {
      Cliente: true,
      Administrador: true,
    }
  });
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserByIdWithRelations
};
