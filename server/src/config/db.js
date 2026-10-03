import dns from 'node:dns';
import mongoose from 'mongoose';

const dnsServers = (process.env.MONGODB_DNS_SERVERS || '')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);

if (dnsServers.length > 0) {
  dns.setServers(dnsServers);
}

export async function connectDb() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is missing');
  }

  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || 'pms',
    serverSelectionTimeoutMS: 10000
  });

  console.log(
    `MongoDB connected to ${process.env.MONGODB_DB || 'pms'}`
  );
}