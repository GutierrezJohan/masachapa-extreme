const repo = require('../repositories/cartRepository');

exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const data = await repo.getCart(userId);
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo obtener el carrito' });
  }
};

exports.addItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, cantidad } = req.body || {};
    const pid = Number(productId);
    const qty = Number(cantidad);
    if (!pid || Number.isNaN(pid)) return res.status(400).json({ error: 'productId inválido' });
    if (!qty || Number.isNaN(qty)) return res.status(400).json({ error: 'cantidad inválida' });
    const item = await repo.addOrUpdateItem(userId, pid, qty);
    const cart = await repo.getCart(userId);
    return res.status(201).json({ item, ...cart });
  } catch (e) {
    if (e && e.message === 'PRODUCT_NOT_FOUND') return res.status(404).json({ error: 'Producto no encontrado' });
    return res.status(500).json({ error: 'No se pudo agregar al carrito' });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const userId = req.userId;
    const productId = Number(req.params.productId);
    const { delta } = req.body || {};
    const d = Number(delta);
    if (!productId || Number.isNaN(productId)) return res.status(400).json({ error: 'productId inválido' });
    if (!d || Number.isNaN(d)) return res.status(400).json({ error: 'delta inválido' });
    const item = await repo.updateQuantityByProduct(userId, productId, d);
    const cart = await repo.getCart(userId);
    return res.json({ item, ...cart });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo actualizar el carrito' });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const userId = req.userId;
    const productId = Number(req.params.productId);
    if (!productId || Number.isNaN(productId)) return res.status(400).json({ error: 'productId inválido' });
    await repo.removeByProduct(userId, productId);
    const cart = await repo.getCart(userId);
    return res.json({ ok: true, ...cart });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo eliminar del carrito' });
  }
};

exports.clear = async (req, res) => {
  try {
    const userId = req.userId;
    await repo.clearCart(userId);
    const cart = await repo.getCart(userId);
    return res.json({ ok: true, ...cart });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo limpiar el carrito' });
  }
};
