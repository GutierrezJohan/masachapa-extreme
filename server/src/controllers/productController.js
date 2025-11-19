const repo = require('../repositories/productRepository');

exports.list = async (req, res) => {
  try {
    const { category } = req.query;
    let products;
    if (category) {
      products = await repo.listByCategory(String(category));
    } else {
      products = await repo.listAll();
    }
    return res.json({ products });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudieron listar los productos' });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria, imagen } = req.body || {};
    if (!nombre || typeof nombre !== 'string') return res.status(400).json({ error: 'Nombre es obligatorio' });
    const p = Number(precio);
    const s = Number(stock);
    if (Number.isNaN(p) || p < 0) return res.status(400).json({ error: 'Precio inválido' });
    if (Number.isNaN(s) || s < 0) return res.status(400).json({ error: 'Stock inválido' });
    if (!categoria || typeof categoria !== 'string') return res.status(400).json({ error: 'Categoría es obligatoria' });

    const product = await repo.createProduct({
      nombre: nombre.trim(),
      descripcion: (descripcion || '').trim(),
      precio: p,
      stock: s,
      categoria: categoria.trim(),
      imagen: (imagen || '').trim(),
    });
    return res.status(201).json({ product });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo crear el producto' });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    try {
      await repo.deleteById(id);
      return res.json({ ok: true });
    } catch (err) {
      // Prisma foreign key constraint error code P2003
      if (err?.code === 'P2003') {
        return res.status(409).json({ error: 'No se puede eliminar: producto referenciado' });
      }
      throw err;
    }
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo eliminar el producto' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    const product = await repo.getById(id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    return res.json({ product });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudo obtener el producto' });
  }
};
