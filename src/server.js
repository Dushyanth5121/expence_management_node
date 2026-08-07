const app = require('./app');
const prisma = require('./shared/config/prisma');

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.message);
  console.error(err.stack);
  process.exit(1);
});

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();

    console.log('✅ Database connected successfully!');
    //print db name
    const result = await prisma.$queryRaw`SELECT current_database() AS db_name`;
    console.log(`📦 Connected to database: ${result[0].db_name}`);

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(err.message);
      console.error(err.stack);

      server.close(async () => {
        await prisma.$disconnect();
        process.exit(1);
      });
    });

    // Graceful shutdown - SIGTERM
    process.on('SIGTERM', async () => {
      console.log('👋 SIGTERM received. Shutting down gracefully');

      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });

    // Graceful shutdown - SIGINT
    process.on('SIGINT', async () => {
      console.log('👋 SIGINT received. Shutting down gracefully');

      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

startServer();