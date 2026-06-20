import { env } from './config/env.js';
// Trigger env validation
console.log('[Nebula] Environment Loaded');

import { logger } from './logging/logger.js';
console.log('[Nebula] Logger Initialized');

import { BrowserManager } from './browser/browserManager.js';

import { startServer } from './server.js';

const browserManager = BrowserManager.getInstance();

async function main() {
  logger.info('Nebula Autonomous Browser Intelligence agent starting up...');
  console.log('[Nebula] Nebula - Autonomous Browser Intelligence Started');

  // Start the Dashboard API server
  startServer();
}

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  try {
    await browserManager.close();
    logger.info('Browser resources cleaned up.');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Handle signals and exceptions
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Shutdown gracefully on fatal error
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Run main
main().catch((error) => {
  logger.error('Failed to start Nebula:', error);
  process.exit(1);
});
