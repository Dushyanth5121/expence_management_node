const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.prisma;
}

// Test connection and log database info
(async () => {
  try {
    await prisma.$connect();
    logger.info('✅ PostgreSQL Connected successfully');
    
    // Get database name
    const result = await prisma.$queryRaw`SELECT current_database() AS db_name`;
    logger.info(`📦 Connected to database: ${result[0].db_name}`);
  } catch (error) {
    logger.error('❌ PostgreSQL connection error:', error.message);
  }
})();

module.exports = prisma;