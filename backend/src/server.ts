import app from './app.js';
import {env} from './config/env.js';

import {db} from './config/database.js';


const PORT = env.PORT;

// Test kết nối DB trước khi khởi động server
db.selectFrom('users').select('id').limit(1).execute()
  .then(async () => {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`💾 Storage Driver: ${env.STORAGE_DRIVER}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        console.log('HTTP server closed');
        await db.destroy();
        console.log('Database connections closed');
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  })
  .catch((err) => {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
  });