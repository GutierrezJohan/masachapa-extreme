const orderRepo = require('../repositories/orderRepository');

exports.checkout = async (req, res) => {
  try {
    const userId = req.userId;
    const { direccion_envio, metodo_pago } = req.body || {};
    const order = await orderRepo.checkoutFromCart(userId, { direccion_envio, metodo_pago });
    return res.status(201).json({ order });
  } catch (e) {
    const msg = e?.message;
    const code = e?.code;
    if (code === 'P2003') return res.status(409).json({ error: 'Error de integridad: referencia inválida' });
    if (msg === 'USER_NOT_FOUND') return res.status(404).json({ error: 'Usuario no encontrado' });
    if (msg === 'NOT_CLIENT') return res.status(403).json({ error: 'Solo clientes pueden comprar' });
    if (msg === 'EMPTY_CART') return res.status(400).json({ error: 'Carrito vacío' });
    if (msg === 'INSUFFICIENT_STOCK') return res.status(409).json({ error: 'Stock insuficiente en uno o más productos' });
    console.error('Checkout error:', e);
    return res.status(500).json({ error: 'Error al procesar checkout' });
  }
};
