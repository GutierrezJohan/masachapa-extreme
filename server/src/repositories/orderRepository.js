const prisma = require('../config/prismaClient');

function toOrderUI(order, items) {
  return {
    id: order.id,
    fecha: order.fecha?.toISOString?.() || null,
    estado: order.estado,
    total: Number(order.total),
    direccion_envio: order.direccion_envio,
    metodo_pago: order.metodo_pago,
    items: items.map(i => ({
      id: i.id,
      productoId: i.producto_id,
      nombre: i.Producto?.nombre || '',
      cantidad: i.cantidad,
      precio_unitario: Number(i.precio_unitario),
      subtotal: Number(i.subtotal),
      imagen: i.Producto?.imagen_url || ''
    }))
  };
}

async function checkoutFromCart(userId, { direccion_envio, metodo_pago }) {
  // Aumentamos el timeout porque la transacción puede tardar más de 5s en entornos lentos
  return prisma.$transaction(async (tx) => {
    // Verify user and cliente relation
    const usuario = await tx.usuario.findUnique({
      where: { id: userId },
      include: { Cliente: true }
    });
    if (!usuario) throw new Error('USER_NOT_FOUND');
    if (usuario.tipo !== 'cliente') throw new Error('NOT_CLIENT');
    let clienteId;
    if (!usuario.Cliente) {
      // Create Cliente record if missing (some usuarios cliente may have been created without direccion)
      const dir = direccion_envio || 'Sin direccion';
      const nuevo = await tx.cliente.create({ data: { id: usuario.id, direccion: dir } });
      clienteId = nuevo.id;
    } else {
      clienteId = usuario.Cliente.id;
    }

    // Get cart and items
    const cart = await tx.carrito.findFirst({ where: { usuario_id: userId } });
    if (!cart) throw new Error('EMPTY_CART');
    const items = await tx.itemCarrito.findMany({
      where: { carrito_id: cart.id },
      include: { Producto: { include: { Inventario: true } } }
    });
    if (!items.length) throw new Error('EMPTY_CART');

    // Validate stock & compute totals
    let total = 0;
    for (const it of items) {
      const stock = it.Producto?.Inventario?.stock_actual ?? 0;
      if (stock < it.cantidad) throw new Error('INSUFFICIENT_STOCK');
      total += Number(it.precio_unitario) * it.cantidad;
    }

    // Create order
    const orden = await tx.orden.create({
      data: {
        cliente_id: clienteId,
        total,
        direccion_envio: direccion_envio || usuario.Cliente?.direccion || 'Sin direccion',
        metodo_pago: metodo_pago || 'pendiente',
        estado: 'pendiente'
      }
    });

    // Create order items & update inventory in parallel to reducir tiempo
    const ops = [];
    for (const it of items) {
      ops.push(tx.itemOrden.create({
        data: {
          orden_id: orden.id,
          producto_id: it.producto_id,
          cantidad: it.cantidad,
          precio_unitario: it.precio_unitario,
          subtotal: Number(it.precio_unitario) * it.cantidad
        }
      }));
      if (it.Producto?.Inventario) {
        ops.push(tx.inventario.update({
          where: { id: it.Producto.Inventario.id },
          data: { stock_actual: it.Producto.Inventario.stock_actual - it.cantidad }
        }));
      }
    }
    await Promise.all(ops);

    // Clear cart items
    await tx.itemCarrito.deleteMany({ where: { carrito_id: cart.id } });

    // Return order with items view
    const fullItems = await tx.itemOrden.findMany({
      where: { orden_id: orden.id },
      include: { Producto: true }
    });
    return toOrderUI(orden, fullItems);
  }, { timeout: 15000 });
}

module.exports = { checkoutFromCart };
