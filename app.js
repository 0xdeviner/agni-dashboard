require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { MongoClient } = require('mongodb');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/openapi.json');

// Models
const makeUserModel = require('./models/user');
const makeDomainModel = require('./models/domain');
const makeSubdomainModel = require('./models/subdomain');

// Routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// CORS: Dev-friendly. In production same-origin, so this is benign.
const corsEnv = process.env.CORS_ORIGIN;
let corsOrigin;
if (!corsEnv || corsEnv.trim() === '*' || corsEnv.trim() === '') {
  corsOrigin = true; // reflect request origin
} else {
  corsOrigin = corsEnv.split(',').map((s) => s.trim()).filter(Boolean);
}
app.use(
  cors({
    origin: corsOrigin,
    credentials: false
  })
);

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Swagger (keep before static)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
app.get('/docs.json', (req, res) => res.json(swaggerDocument));

// Mongo connection
const MONGO_URI = process.env.MONGODB_URI;
const PORT = parseInt(process.env.PORT || '4000', 10);

if (!MONGO_URI) {
  console.error('MONGODB_URI is not set in environment.');
  process.exit(1);
}

function resolveDbName(uri) {
  if (process.env.MONGODB_DB && process.env.MONGODB_DB.trim()) {
    return process.env.MONGODB_DB.trim();
  }
  try {
    const beforeQuery = uri.split('?')[0];
    const parts = beforeQuery.split('/');
    const candidate = parts[3];
    if (candidate && candidate.length > 0) return candidate;
  } catch (_) {}
  return 'recon_tool';
}

MongoClient.connect(MONGO_URI)
  .then((client) => {
    const dbName = resolveDbName(MONGO_URI);
    const db = client.db(dbName);

    // Initialize models and attach to app
    const models = {
      User: makeUserModel(db),
      Domain: makeDomainModel(db),
      Subdomain: makeSubdomainModel(db)
    };
    app.locals.models = models;
    app.locals.dbName = dbName;

    console.log('Connected to MongoDB, using database:', dbName);

    // Optional debug endpoint
    app.get('/api/_debug/db', (req, res) => res.json({ dbName: app.locals.dbName }));

    // API routes
    app.use('/auth', authRoutes);
    app.use('/api', apiRoutes);

    // In production, serve the React build (client-dist folder)
    const clientDist = path.join(__dirname, 'client-dist');
    app.use(express.static(clientDist));

    // SPA fallback (after API/Swagger routes)
    app.get('*', (req, res) => {
      const p = req.path;
      if (p.startsWith('/api') || p.startsWith('/auth') || p.startsWith('/docs') || p.startsWith('/docs.json') || p.startsWith('/health')) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.sendFile(path.join(clientDist, 'index.html'));
    });

    // Error handler
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
      console.log(`Swagger UI: http://localhost:${PORT}/docs`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });