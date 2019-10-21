'use strict';

const generator = require('../../rollup.config.generator');
const pkg = require('./package.json');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const config = generator(pkg, __dirname, [['/dist/workers', './dist/workers']]);

// config.push({
//     input: [
//         'monaco-editor/esm/vs/editor/editor.worker.js',
//         'monaco-editor/esm/vs/language/json/json.worker',
//         'monaco-editor/esm/vs/language/css/css.worker',
//         'monaco-editor/esm/vs/language/html/html.worker',
//         'monaco-editor/esm/vs/language/typescript/ts.worker',
//     ],
//     output: {
//         format: 'esm',
//         dir: 'dist/workers',
//     },
//     plugins: [
//         resolve(),
//         commonjs(),
//     ],
// });

module.exports = config;
