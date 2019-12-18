'use strict';

const generator = require('../../rollup.config.generator');
const pkg = require('./package.json');

const config = generator(pkg, __dirname);
module.exports = config;
