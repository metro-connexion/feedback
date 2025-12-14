import isEmpty from "lodash/isEmpty.js";
import omit from "lodash/omit.js";
import pino from "pino";
import pretty from "pino-pretty";

import { config } from "./config.js";

const { logging } = config;

let prettyPrint;
if (logging.logForHumans) {
  const omitDay = "HH:MM:ss";
  prettyPrint = pretty({
    sync: true,
    colorize: true,
    translateTime: omitDay,
    ignore: "pid,hostname",
    messageFormat: logging.logForHumansCompactFormat ? messageFormatCompact : undefined,
    hideObject: logging.logForHumansCompactFormat,
  });
}

/**
 * Root Pino logger instance configured from application config.
 * @type {pino.Logger}
 */
export const loggerPino = pino(
  {
    level: logging.logLevel,
    redact: ["req.headers.authorization"],
    enabled: logging.enabled,
  },
  prettyPrint,
);

/**
 * Internal helper that forwards calls to the pino instance.
 * @private
 * @param {string} context - pino method name (trace|debug|info|...)
 * @param {object} mergingObject - optional object to merge into the log
 * @param {string} [message] - optional message
 */
function buildLogWrapper(context, mergingObject, message) {
  loggerPino[context](mergingObject, message);
}

/**
 * Application logger interface used across the codebase.
 * Each method accepts an optional merging object and an optional message.
 * @typedef {object} AppLogger
 * @property {(mergingObject?: object, message?: string) => void} trace
 * @property {(mergingObject?: object, message?: string) => void} debug
 * @property {(mergingObject?: object, message?: string) => void} info
 * @property {(mergingObject?: object, message?: string) => void} warn
 * @property {(mergingObject?: object, message?: string) => void} error
 * @property {(mergingObject?: object, message?: string) => void} fatal
 * @property {(mergingObject?: object, message?: string) => void} silent
 */

/**
 * Lightweight wrapper exposing a small, consistent logging interface.
 * @type {AppLogger}
 */
export const logger = {
  trace: (mergingObject, message) => {
    buildLogWrapper("trace", mergingObject, message);
  },
  debug: (mergingObject, message) => {
    buildLogWrapper("debug", mergingObject, message);
  },
  info: (mergingObject, message) => {
    buildLogWrapper("info", mergingObject, message);
  },
  warn: (mergingObject, message) => {
    buildLogWrapper("warn", mergingObject, message);
  },
  error: (mergingObject, message) => {
    buildLogWrapper("error", mergingObject, message);
  },
  fatal: (mergingObject, message) => {
    buildLogWrapper("fatal", mergingObject, message);
  },
  silent: (mergingObject, message) => {
    buildLogWrapper("silent", mergingObject, message);
  },
};

/**
 * Creates a child logger for a section.
 * Debug may be enabled for a section using DEBUG_ENABLED.
 * @param {string} section - The section name for the logger
 * @param {pino.Bindings} bindings - Logger bindings
 * @param {pino.ChildLoggerOptions} options - Logger options
 * @returns {pino.Logger} The child logger instance
 */
export function child(section, bindings, options) {
  /** @type {Partial<pino.ChildLoggerOptions>} */
  const optionsOverride = {};
  if (logging.debug) {
    optionsOverride.level = "debug";
  }
  return loggerPino.child(bindings, { ...options, ...optionsOverride });
}

/**
 * Scopes used to categorize logs by feature/area.
 * @enum {string}
 */
export const SCOPES = {
  LEARNING_CONTENT: "learningcontent",
  IAM: "iam",
  LLM: "llm",
};

/**
 * Custom compact message formatter for pino-pretty.
 * Produces a concise single-line summary for requests and errors.
 * @param {object} log - The raw log object produced by pino
 * @param {string} messageKey - The key used to store the human message in the log
 * @param {number} _logLevel - Numeric log level (unused)
 * @param {{colors: object}} options - Helpers provided by pino-pretty (colors)
 * @returns {string} Formatted log message
 */
function messageFormatCompact(log, messageKey, _logLevel, { colors }) {
  const message = log[messageKey];
  const { err, req, res, responseTime } = log;

  // compact log for errors
  if (err) {
    const stack = colors.red(err.stack);
    return `${message}\n${stack}`;
  }

  // compact log for HTTP requests
  if (req && res) {
    const method = req.method?.toUpperCase();

    const queries = req.metrics?.knexQueryCount ? `sql:${req.metrics.knexQueryCount}` : "";
    const queriesTime = req.metrics?.knexTotalTimeSpent ? `sql-time:${req.metrics.knexTotalTimeSpent}` : "";

    const statusCode = res.statusCode >= 400 ? colors.red(res.statusCode) : colors.greenBright(res.statusCode);
    const request = colors.magentaBright([method, req.url].filter(Boolean).join(" "));
    const details = colors.yellow([queries, queriesTime].filter(Boolean).join(" "));
    const time = colors.gray(`(${responseTime}ms)`);

    return [statusCode, request, details, time].filter(Boolean).join(" - ");
  }

  // compact log by default
  const compactLog = omit(log, [
    messageKey,
    "id",
    "level",
    "time",
    "pid",
    "hostname",
    "uri",
    "address",
    "event",
    "started",
    "created",
  ]);
  const details = !isEmpty(compactLog) ? colors.gray(JSON.stringify(compactLog)) : "";
  return `${message} ${details}`;
}
