const express = require('express');
const dotenv = require('dotenv');
const cors = require('./config/cors');
const path = require('path');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors);
// Serve static uploads (avatars, etc.)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Mount auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
// Mount products routes
const productRoutes = require('./routes/products');
app.use('/api/products', productRoutes);
// Mount categories routes
const categoryRoutes = require('./routes/categories');
app.use('/api/categories', categoryRoutes);
// Mount cart routes (authenticated)
const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);
// Mount orders routes (authenticated checkout)
const ordersRoutes = require('./routes/orders');
app.use('/api/orders', ordersRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

module.exports = app;
