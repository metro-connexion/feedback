import "dotenv/config";
/**
 * Parses a string to a number with a default fallback
 * @param {string} numberAsString - The string to parse as a number
 * @param {number} defaultIntNumber - The default value if parsing fails
 * @returns {number} The parsed number or the default value
 */
function _getNumber(numberAsString, defaultIntNumber) {
  const number = parseInt(numberAsString, 10);
  return isNaN(number) ? defaultIntNumber : number;
}

function _getLogForHumans() {
  const processOutputingToTerminal = process.stdout.isTTY;
  const forceJSONLogs = process.env.LOG_FOR_HUMANS === "false";
  return processOutputingToTerminal && !forceJSONLogs;
}

function toBoolean(value) {
  if (value === undefined) return false;
  return value.toLowerCase() === "true";
}

const configuration = (function() {
  const config = {
    port: _getNumber(process.env.PORT, 3000),
    environment: process.env.NODE_ENV || "development",
    logging: {
      enabled: toBoolean(process.env.LOG_ENABLED),
      logLevel: process.env.LOG_LEVEL || "info",
      logForHumans: _getLogForHumans(),
      logForHumansCompactFormat: process.env.LOG_FOR_HUMANS_FORMAT === "compact",
      debug: toBoolean(process.env.DEBUG_ENABLED),
    },
    users: {
      passwordHash: _getNumber(process.env.PASSWORD_HASH, 10),
    },
    jwt: {
      tokenSecret: process.env.TOKEN_SECRET,
      expirationTime: process.env.TOKEN_EXPIRATION,
    },
    email: {
      enabled: toBoolean(process.env.MAILING_ENABLED),
      testAccount: toBoolean(process.env.MAIL_TEST_ACCOUNT_ENABLED),
      service: process.env.MAILING_SERVICE,
      port: _getNumber(process.env.MAILING_PORT, 587),
      secure: toBoolean(process.env.MAILING_SECURE),
      auth: {
        user: process.env.MAILING_USER,
        pass: process.env.MAILING_PASSWORD,
      },
    },
    baseUrl: process.env.BASE_URL,
    swagger: {
      definition: {
        openapi: "3.0.0",
        info: {
          title: "Api Kompagnon",
          version: "0.0.0",
          description: "The api for Kompagnon platform",
        },
        servers: [
          {
            url: `http://localhost:${process.env.PORT || 3000}`,
          },
        ],
      },
      apis: ["./src/**/*routes*.js"],
    },
  };

  if (config.environment === "test") {
    config.port = 0;
    config.logging.enabled = false;
    config.jwt.tokenSecret = "abcd";
    config.jwt.expirationTime = "1h";
    config.email.enabled = false;
    config.email.testAccount = false;
    config.baseUrl = "http://localhost/#/";
  }
  return config;
})();

export { configuration as config };
