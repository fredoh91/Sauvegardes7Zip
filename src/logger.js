import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(info => {
      const { timestamp, level, message, ...metadata } = info;
      let log = `[${timestamp}] ${level}: ${message}`;
      if (Object.keys(metadata).length) {
        log += ` ${JSON.stringify(metadata)}`;
      }
      return log;
    })
  ),
  defaultMeta: { service: 'sauvegardes-7zip' },
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, '..', 'logs', 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(__dirname, '..', 'logs', 'app.log') })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(info => {
        const { timestamp, level, message, ...metadata } = info;
        let log = `[${timestamp}] ${level}: ${message}`;
        if (Object.keys(metadata).length) {
          log += ` ${JSON.stringify(metadata)}`;
        }
        return log;
      })
    )
  }));
}

export default logger;
