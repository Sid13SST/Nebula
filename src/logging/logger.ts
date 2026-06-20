import * as winston from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import { agentEvents } from './eventManager.js';

// Automatically create log directory if missing
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  })
);

import Transport from 'winston-transport';

class SSETransport extends Transport {
  constructor(opts?: any) {
    super(opts);
  }

  log(info: any, next: any) {
    setImmediate(() => {
      agentEvents.emit('log', info.message);
    });
    next();
  }
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new SSETransport(),
  ],
});
export default logger;
