const path = require('path');

/**
 * returns path root directory that is the directory name of app.js.
 */
module.exports = path.dirname(require.main.filename);