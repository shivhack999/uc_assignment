const morgan = require('morgan');
const logger = require('./logger');

// Stream for Morgan
const stream = {
  write: (message) => logger.info(message.trim())
};

const morganMiddleware = morgan(
  ':method :url :status :response-time ms',
  { stream }
);

module.exports = morganMiddleware;