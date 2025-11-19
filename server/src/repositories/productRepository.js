const prisma = require('../config/prismaClient');

function toUI(p) {
  return {
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion || '',
    precio: Number(p.precio),
    stock: p.Inventario?.stock_actual ?? 0,
    categoria: p.Categoria?.nombre || '',
    imagen: p.imagen_url || '',
    creadoEn: p.fecha_creacion?.toISOString?.() || null,
  };
}

async function listAll() {
  const products = await prisma.producto.findMany({
    where: { activo: true },
    orderBy: { id: 'desc' },
    include: { Categoria: true, Inventario: true },
  });
  return products.map(toUI);
}

async function listByCategory(nombreCategoria) {
  if (!nombreCategoria) return listAll();
  const products = await prisma.producto.findMany({
    where: {
      activo: true,
      Categoria: { nombre: { equals: nombreCategoria } }
    },
    orderBy: { id: 'desc' },
    include: { Categoria: true, Inventario: true },
  });
  return products.map(toUI);
}

async function ensureCategoria(nombre) {
  const existing = await prisma.categoria.findFirst({ where: { nombre } });
  if (existing) return existing;
  return prisma.categoria.create({ data: { nombre } });
}

async function createProduct({ nombre, descripcion, precio, stock, categoria, imagen }) {
  return await prisma.$transaction(async (tx) => {
    const cat = await tx.categoria.findFirst({ where: { nombre: categoria } }) ||
                await tx.categoria.create({ data: { nombre: categoria } });

    const producto = await tx.producto.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        precio: precio,
        marca: 'Generico',
        modelo_compatibilidad: null,
        imagen_url: imagen || null,
        categoria_id: cat.id,
        activo: true,
      },
      include: { Categoria: true, Inventario: true },
    });

    await tx.inventario.create({
      data: {
        producto_id: producto.id,
        stock_actual: stock ?? 0,
      },
    });

    const withInv = await tx.producto.findUnique({
      where: { id: producto.id },
      include: { Categoria: true, Inventario: true },
    });
    return toUI(withInv);
  });
}

async function deleteById(id) {
  await prisma.producto.delete({ where: { id } });
}

async function getById(id) {
  const producto = await prisma.producto.findUnique({
    where: { id },
    include: { Categoria: true, Inventario: true },
  });
  if (!producto) return null;
  return toUI(producto);
}

async function listRelated(id, categoriaNombre, limit = 4) {
  if (!categoriaNombre) return [];
  const items = await prisma.producto.findMany({
    where: {
      activo: true,
      id: { not: id },
      Categoria: { nombre: { equals: categoriaNombre, mode: 'insensitive' } },
    },
    orderBy: { fecha_creacion: 'desc' },
    take: limit,
    include: { Categoria: true, Inventario: true },
  });
  return items.map(toUI);
}

module.exports = {
  listAll,
  listByCategory,
  createProduct,
  deleteById,
  getById,
  listRelated,
};
