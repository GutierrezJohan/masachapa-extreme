const prisma = require('../config/prismaClient');

async function ensureCategory(nombre, descripcion = null) {
  const existing = await prisma.categoria.findFirst({ where: { nombre } });
  if (existing) return existing;
  return prisma.categoria.create({ data: { nombre, descripcion } });
}

async function createProduct({ nombre, descripcion, precio, categoria, stock, imagen }) {
  const cat = await ensureCategory(categoria);
  const producto = await prisma.producto.create({
    data: {
      nombre,
      descripcion,
      precio,
      marca: 'Generico',
      modelo_compatibilidad: null,
      imagen_url: imagen || null,
      categoria_id: cat.id,
      activo: true,
    },
  });
  await prisma.inventario.create({
    data: {
      producto_id: producto.id,
      stock_actual: stock,
    }
  });
  return producto.id;
}

async function main() {
  const samples = [
    { nombre: 'Filtro de aceite', descripcion: 'Filtro OEM de alta eficiencia', precio: 8.99, categoria: 'Motor', stock: 30 },
    { nombre: 'Pastillas de freno', descripcion: 'Juego delantero cerámico', precio: 29.90, categoria: 'Sistema de frenos', stock: 50 },
    { nombre: 'Batería 12V 65Ah', descripcion: 'Batería libre de mantenimiento', precio: 119.00, categoria: 'Eléctrico', stock: 12 },
    { nombre: 'Bujías Iridium (x4)', descripcion: 'Set de bujías Iridium alta duración', precio: 39.50, categoria: 'Motor', stock: 20 },
    { nombre: 'Amortiguador delantero', descripcion: 'Amortiguador reforzado para uso rudo', precio: 85.00, categoria: 'Suspensión', stock: 14 },
    { nombre: 'Alternador 120A', descripcion: 'Alternador de carga rápida', precio: 249.00, categoria: 'Eléctrico', stock: 5 },
    { nombre: 'Filtro de aire', descripcion: 'Filtro lavable alto flujo', precio: 14.90, categoria: 'Motor', stock: 40 },
    { nombre: 'Limpiaparabrisas 22"', descripcion: 'Par de plumillas all-weather', precio: 9.50, categoria: 'Accesorios', stock: 60 },
  ];

  console.log('Seeding sample products...');
  for (const s of samples) {
    const id = await createProduct(s);
    console.log(`✔ Producto ${s.nombre} (ID ${id})`);
  }
  console.log('Seed completo.');
}

main().catch(e => {
  console.error(e);
}).finally(async () => {
  await prisma.$disconnect();
});
