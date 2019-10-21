'use strict';

const vue = require('rollup-plugin-vue');
const replace = require('rollup-plugin-replace');

const generator = require('../../rollup.config.generator');
const pkg = require('./package.json');

const config = generator(pkg, __dirname);

config.forEach(c => {
    c.plugins.push(vue({
        needMap: false,
    }));

    c.plugins.push(replace(
        {
            'process.env.NODE_ENV': JSON.stringify( 'development' )
        }
    ));
});

module.exports = config;
