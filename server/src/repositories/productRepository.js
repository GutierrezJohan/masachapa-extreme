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
  updateProduct,
};

async function updateProduct(id, { nombre, descripcion, precio, stock, categoria, imagen, activo }) {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.producto.findUnique({ where: { id }, include: { Categoria: true, Inventario: true } });
    if (!existing) throw new Error('NOT_FOUND');

    let categoriaId = existing.categoria_id;
    if (categoria && categoria.trim() && categoria.trim() !== existing.Categoria?.nombre) {
      const cat = await tx.categoria.findFirst({ where: { nombre: categoria.trim() } }) ||
        await tx.categoria.create({ data: { nombre: categoria.trim() } });
      categoriaId = cat.id;
    }

    const updateData = {};
    if (typeof nombre === 'string' && nombre.trim()) updateData.nombre = nombre.trim();
    if (typeof descripcion === 'string') updateData.descripcion = descripcion.trim() || null;
    if (precio !== undefined) {
      const p = Number(precio);
      if (Number.isNaN(p) || p < 0) throw new Error('INVALID_PRICE');
      updateData.precio = p;
    }
    if (imagen !== undefined) updateData.imagen_url = imagen ? imagen.trim() : null;
    if (activo !== undefined) updateData.activo = !!activo;
    if (categoriaId !== existing.categoria_id) updateData.categoria_id = categoriaId;

    if (Object.keys(updateData).length) {
      await tx.producto.update({ where: { id }, data: updateData });
    }

    if (stock !== undefined) {
      const s = Number(stock);
      if (Number.isNaN(s) || s < 0) throw new Error('INVALID_STOCK');
      const inv = await tx.inventario.findUnique({ where: { producto_id: id } });
      if (inv) {
        await tx.inventario.update({ where: { producto_id: id }, data: { stock_actual: s, fecha_actualizacion: new Date() } });
      } else {
        await tx.inventario.create({ data: { producto_id: id, stock_actual: s } });
      }
    }

    const updated = await tx.producto.findUnique({ where: { id }, include: { Categoria: true, Inventario: true } });
    return toUI(updated);
  });
}
