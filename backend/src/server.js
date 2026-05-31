import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import net from 'net';

const findFreePort = (port) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findFreePort(port + 1)); // try next port
      } else {
        reject(err);
      }
    });

    server.once('listening', () => {
      server.close(() => resolve(port));
    });

    server.listen(port);
  });
};

const startServer = async () => {
  try {
    // Connect Database
    await connectDB();

    // Find available port
    const port = await findFreePort(env.port || 3030);

    // Start server
    app.listen(port, () => {
      console.log(
        `Server running on port ${port} in ${env.nodeEnv} mode`
      );
    });

  } catch (error) {
    console.error('Server start failed:', error.message);
    process.exit(1);
  }
};

startServer();