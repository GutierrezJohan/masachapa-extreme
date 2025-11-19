const repo = require('../repositories/categoryRepository');

exports.list = async (req, res) => {
  try {
    const categories = await repo.listAll();
    return res.json({ categories });
  } catch (e) {
    return res.status(500).json({ error: 'No se pudieron listar las categorías' });
  }
};
