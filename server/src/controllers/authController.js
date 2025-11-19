const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/userRepository');

const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || '10', 10);

async function register(req, res) {
  try {
    const { nombre, email, password, telefono, tipo = 'cliente', direccion, nivel_acceso, departamento } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return res.status(400).json({ error: 'Nombre es requerido' });
    }

    if (!email || typeof email !== 'string' || !/.+@.+\..+/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const normalizedTipo = (tipo === 'administrador') ? 'administrador' : 'cliente';
    if (normalizedTipo === 'cliente' && (!direccion || typeof direccion !== 'string' || direccion.trim().length === 0)) {
      return res.status(400).json({ error: 'La dirección es obligatoria para registro de cliente' });
    }

    let nivelAccesoSafe = undefined;
    if (normalizedTipo === 'administrador') {
      const allowed = ['basico', 'avanzado', 'superadmin'];
      nivelAccesoSafe = allowed.includes(nivel_acceso) ? nivel_acceso : 'basico';
    }

    const existing = await userRepo.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepo.createUser({
      nombre,
      email,
      password: hashed,
      telefono,
      tipo: normalizedTipo,
      direccion,
      nivel_acceso: nivelAccesoSafe,
      departamento
    });

    // Do not expose password
    const { password: _p, ...safeUser } = user;
    return res.status(201).json({ user: safeUser });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await userRepo.getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d'
    });

    const { password: _p, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function me(req, res) {
  try {
    const id = req.userId;
    if (!id) return res.status(401).json({ error: 'Unauthorized' });

    const user = await userRepo.getUserByIdWithRelations(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { password: _p, Cliente, Administrador, ...safe } = user;
    const payload = { ...safe };
    if (Cliente) {
      payload.direccion = Cliente.direccion;
      payload.tipo = 'cliente';
    }
    if (Administrador) {
      payload.nivel_acceso = Administrador.nivel_acceso;
      payload.departamento = Administrador.departamento;
      payload.tipo = 'administrador';
    }

    return res.json({ user: payload });
  } catch (err) {
    console.error('ME error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  register,
  login,
  me
};
