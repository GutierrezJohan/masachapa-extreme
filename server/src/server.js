const express = require('express');
const dotenv = require('dotenv');
const cors = require('./config/cors');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors);

// Mount auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

module.exports = app;
