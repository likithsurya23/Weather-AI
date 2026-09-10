const { MongoClient } = require('mongodb');

let db = null;
let client = null;
let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[Database] No MONGODB_URI provided in .env. Using built-in persistent in-memory store.');
    return null;
  }

  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });
    await client.connect();
    db = client.db();
    isConnected = true;
    console.log('[Database] Connected to MongoDB successfully.');
    return db;
  } catch (error) {
    console.warn('[Database] MongoDB connection failed:', error.message);
    console.log('[Database] Falling back to high-performance in-memory store.');
    isConnected = false;
    return null;
  }
}

function getDB() {
  return db;
}

function isDBConnected() {
  return isConnected;
}

module.exports = {
  connectDB,
  getDB,
  isDBConnected
};
