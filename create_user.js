require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const makeUserModel = require('./models/user');

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

async function main() {
  const [,, username, password] = process.argv;
  if (!username || !password) {
    console.log('Usage: node create_user.js <username> <password>');
    process.exit(1);
  }
  if (!MONGO_URI) {
    console.error('MONGODB_URI is not set in environment.');
    process.exit(1);
  }

  const client = await MongoClient.connect(MONGO_URI);
  const db = client.db(resolveDbName(MONGO_URI));
  const User = makeUserModel(db);

  const existing = await User.findByUsername(username);
  if (existing) {
    console.log(`User "${username}" already exists.`);
    await client.close();
    process.exit(0);
  }

  const password_hash = await bcrypt.hash(password, 10);
  await User.createUser(username, password_hash);
  console.log(`User "${username}" created successfully.`);

  await client.close();
}

main().catch((e) => {
  console.error('Error creating user:', e);
  process.exit(1);
});