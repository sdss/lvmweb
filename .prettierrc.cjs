const mantineConfig = require('eslint-config-mantine/.prettierrc.js');
const config = { ...mantineConfig, ...{ printWidth: 88 } };

module.exports = config;
