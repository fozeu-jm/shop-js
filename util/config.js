const winston = require('winston');
const root = require('../util/path');
const path = require('path');
// Logger configuration
const logConfiguration = {
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(root, "logs/dev.log")
        })
    ]
};
const logger = winston.createLogger(logConfiguration);
exports.logger = logger;

exports.defaultElmtPerPage = "10";