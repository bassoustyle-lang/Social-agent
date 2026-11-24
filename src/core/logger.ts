import * as winston from "winston";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

export const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, "operations.log"), maxsize: 5242880, maxFiles: 5 }),
    new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple()) }),
  ],
});

export function logAgentAction(agentId: string, action: string, outcome: string, meta?: Record<string, any>) {
  logger.info(`[${agentId}] ${action} → ${outcome}`, { agentId, action, outcome, ...meta });
}
