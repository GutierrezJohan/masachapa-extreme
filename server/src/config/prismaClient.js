// Singleton PrismaClient configuration
// Exports a single PrismaClient instance to avoid creating multiple
// connections in development when modules are reloaded.

const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, attach the client to the global object to reuse the
  // same instance across module reloads (e.g. nodemon, hot reloaders).
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

module.exports = prisma;
