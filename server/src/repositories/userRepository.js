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
  // Update user and related records (Cliente/Administrador)
  async function updateUserWithRelations(id, { nombre, telefono, password, direccion, nivel_acceso, departamento, avatar_url }) {
    return prisma.$transaction(async (tx) => {
      // Fetch existing user with relations to know tipo
      const existing = await tx.usuario.findUnique({
        where: { id },
        include: { Cliente: true, Administrador: true }
      });
      if (!existing) return null;

      const usuarioData = {};
      if (typeof nombre === 'string' && nombre.trim().length) usuarioData.nombre = nombre.trim();
      if (typeof telefono === 'string') usuarioData.telefono = telefono;
      if (typeof password === 'string' && password.length) usuarioData.password = password; // already hashed upstream
      if (typeof avatar_url === 'string' && avatar_url.length) usuarioData.avatar_url = avatar_url;

      let updatedUser;
      if (Object.keys(usuarioData).length) {
        updatedUser = await tx.usuario.update({ where: { id }, data: usuarioData });
      } else {
        updatedUser = existing;
      }

      // Update Cliente info if user is cliente
      if (existing.tipo === 'cliente' && typeof direccion === 'string') {
        if (existing.Cliente) {
          await tx.cliente.update({ where: { id }, data: { direccion } });
        } else {
          // If record missing but direccion provided, create it
          await tx.cliente.create({ data: { id, direccion } });
        }
      }

      // Update Administrador info if user is administrador
      if (existing.tipo === 'administrador' && (nivel_acceso !== undefined || departamento !== undefined)) {
        const adminData = {};
        if (typeof nivel_acceso === 'string' && nivel_acceso.trim().length) adminData.nivel_acceso = nivel_acceso.trim();
        if (departamento !== undefined) adminData.departamento = departamento;
        if (Object.keys(adminData).length) {
          if (existing.Administrador) {
            await tx.administrador.update({ where: { id }, data: adminData });
          } else {
            await tx.administrador.create({ data: { id, ...adminData } });
          }
        }
      }

      // Return merged view similar to getUserByIdWithRelations
      return tx.usuario.findUnique({
        where: { id },
        include: { Cliente: true, Administrador: true }
      });
    });
  }


module.exports = {
  createUser,
  getUserByEmail,
  getUserByIdWithRelations,
  updateUserWithRelations
};
