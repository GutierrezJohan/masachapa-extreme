const prisma = require('../config/prismaClient');

function toCartItemUI(item) {
  const p = item.Producto;
  return {
    productoId: p.id,
    nombre: p.nombre,
    precio: Number(item.precio_unitario),
    cantidad: item.cantidad,
    imagen: p.imagen_url || '',
    subtotal: Number(item.subtotal),
  };
}

async function ensureCarrito(userId, tx = prisma) {
  const existing = await tx.carrito.findFirst({ where: { usuario_id: userId } });
  if (existing) return existing;
  return tx.carrito.create({ data: { usuario_id: userId } });
}

async function getCart(userId) {
  const cart = await ensureCarrito(userId);
  const items = await prisma.itemCarrito.findMany({
    where: { carrito_id: cart.id },
    include: { Producto: true },
    orderBy: { id: 'asc' }
  });
  const mapped = items.map(toCartItemUI);
  const count = mapped.reduce((a, i) => a + (i.cantidad || 0), 0);
  const subtotal = mapped.reduce((a, i) => a + (i.subtotal || 0), 0);
  return { items: mapped, count, subtotal };
}

async function addOrUpdateItem(userId, productId, delta) {
  return prisma.$transaction(async (tx) => {
    const cart = await ensureCarrito(userId, tx);

    const prod = await tx.producto.findUnique({
      where: { id: productId },
      include: { Inventario: true }
    });
    if (!prod) throw new Error('PRODUCT_NOT_FOUND');

    const stock = prod.Inventario?.stock_actual ?? 0;

    const existing = await tx.itemCarrito.findUnique({
      where: { uniq_item_carrito_producto: { carrito_id: cart.id, producto_id: productId } }
    });

    if (!existing) {
      const qty = Math.max(0, Math.min(delta, stock));
      if (qty <= 0) return null;
      const precio = prod.precio;
      const item = await tx.itemCarrito.create({
        data: {
          carrito_id: cart.id,
          producto_id: productId,
          cantidad: qty,
          precio_unitario: precio,
          subtotal: qty * precio,
        },
        include: { Producto: true }
      });
      return toCartItemUI(item);
    } else {
      const nextQty = Math.max(0, Math.min(existing.cantidad + delta, stock));
      if (nextQty <= 0) {
        await tx.itemCarrito.delete({ where: { id: existing.id } });
        return null;
      }
      const item = await tx.itemCarrito.update({
        where: { id: existing.id },
        data: {
          cantidad: nextQty,
          subtotal: nextQty * existing.precio_unitario,
        },
        include: { Producto: true }
      });
      return toCartItemUI(item);
    }
  });
}

async function updateQuantityByProduct(userId, productId, delta) {
  return addOrUpdateItem(userId, productId, delta);
}

async function removeByProduct(userId, productId) {
  return prisma.$transaction(async (tx) => {
    const cart = await ensureCarrito(userId, tx);
    const existing = await tx.itemCarrito.findUnique({
      where: { uniq_item_carrito_producto: { carrito_id: cart.id, producto_id: productId } },
      include: { Producto: true }
    });
    if (!existing) return false;
    await tx.itemCarrito.delete({ where: { id: existing.id } });
    return true;
  });
}

async function clearCart(userId) {
  return prisma.$transaction(async (tx) => {
    const cart = await ensureCarrito(userId, tx);
    await tx.itemCarrito.deleteMany({ where: { carrito_id: cart.id } });
    return true;
  });
}

module.exports = {
  getCart,
  addOrUpdateItem,
  updateQuantityByProduct,
  removeByProduct,
  clearCart,
};
