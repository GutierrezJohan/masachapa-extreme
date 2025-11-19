const prisma = require('../config/prismaClient');

async function listAll() {
  const cats = await prisma.categoria.findMany({
    orderBy: { nombre: 'asc' },
    select: { id: true, nombre: true, descripcion: true }
  });
  return cats;
}

module.exports = { listAll };