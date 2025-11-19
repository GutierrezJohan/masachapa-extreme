const prisma = require('../config/prismaClient');

module.exports = async function adminOnly(req, res, next) {
  try {
    const id = req.userId;
    if (!id) return res.status(401).json({ error: 'Unauthorized' });
    const user = await prisma.usuario.findUnique({ where: { id } });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (user.tipo !== 'administrador') return res.status(403).json({ error: 'Forbidden: admin only' });
    return next();
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
};
