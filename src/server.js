const app = require('./app');  // Changed from './src/app' to './app'
const logger = require('./shared/utils/logger');
const prisma = require('./shared/config/prisma');

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.message);
  logger.error(err.stack);
  process.exit(1);
});

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully !..');

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
      logger.error(err.message);
      logger.error(err.stack);
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(1);
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('👋 SIGTERM received. Shutting down gracefully');
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('👋 SIGINT received. Shutting down gracefully');
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error.message);
    logger.error(error.stack);
    process.exit(1);
  }
};

startServer();