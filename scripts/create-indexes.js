require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGODB_URI;

function resolveDbName(uri) {
  if (process.env.MONGODB_DB && process.env.MONGODB_DB.trim()) return process.env.MONGODB_DB.trim();
  try {
    const beforeQuery = uri.split('?')[0];
    const parts = beforeQuery.split('/');
    const candidate = parts[3];
    if (candidate && candidate.length > 0) return candidate;
  } catch (_) {}
  return 'recon_tool';
}

async function createIndexes() {
  if (!MONGO_URI) {
    console.error('MONGODB_URI is not set in environment.');
    process.exit(1);
  }

  const client = await MongoClient.connect(MONGO_URI);
  const db = client.db(resolveDbName(MONGO_URI));

  await db.collection('domains').createIndex({ domain: 1 }, { unique: true });
  await db.collection('subdomains').createIndex({ domain: 1, subdomain: 1 }, { unique: true });
  await db.collection('subdomains').createIndex({ domain: 1 });
  await db.collection('subdomains').createIndex({ subdomain: 1 });
  await db.collection('subdomains').createIndex({ 'alive_data.status_code': 1 });
  await db.collection('subdomains').createIndex({ takeover: 1 });

  console.log('Indexes created.');
  await client.close();
}

createIndexes().catch((e) => {
  console.error('Failed to create indexes:', e);
  process.exit(1);
});