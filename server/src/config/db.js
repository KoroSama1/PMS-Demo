import dns from 'node:dns';
import mongoose from 'mongoose';

const dnsServers = (process.env.MONGODB_DNS_SERVERS || '')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);

if (dnsServers.length > 0) {
  dns.setServers(dnsServers);
}

let connectionPromise = null;

export async function connectDb() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing');
  }

  connectionPromise = mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || 'pms',
    serverSelectionTimeoutMS: 10000
  });

  try {
    await connectionPromise;

    console.log(
      `MongoDB connected to ${process.env.MONGODB_DB || 'pms'}`
    );

    return mongoose.connection;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
}
