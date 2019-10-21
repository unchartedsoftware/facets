'use strict';

const path = require('path');
const liveServer = require('rollup-plugin-live-server');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const typescript = require('rollup-plugin-typescript2');
const polyfill = require('rollup-plugin-polyfill');
const string = require('rollup-plugin-string').string;
const sourcemaps = require('rollup-plugin-sourcemaps');

const extensions = [
    '.js', '.jsx', '.ts', '.tsx',
];
function generateConfig(pkg, basedir, mount = []) {
    const moduleName = pkg.name.split('/').pop().replace('-', '');
    const config = [];

    if (process.env.TARGET === 'debug') {
        config.push({
            input: [path.resolve(basedir, pkg.entry)],
            output: {
                file: path.resolve(basedir, pkg.iife),
                format: 'iife',
                name: moduleName,
                sourcemap: 'inline',
            },
            plugins: [
                resolve({ extensions }),
                commonjs(),
                string({
                    include: ["**/*.css", "**/*.html", "**/*.txt"],
                    exclude: ["**/css/*.css"]
                }),
                babel({
                    extensions,
                    exclude: [/node_modules\/(?!(lit-html|lit-element)\/).*/],
                    rootMode: "upward",
                    presets: [
                        [
                            '@babel/env',
                            {
                                targets: {
                                    ie: '11',
                                },
                                useBuiltIns: 'entry',
                                corejs: { version: 3, proposals: true },
                            },
                        ],
                        '@babel/typescript',
                    ],
                }),
                polyfill([
                    'core-js',
                    'regenerator-runtime/runtime',
                    '@webcomponents/webcomponentsjs/webcomponents-bundle'
                ], {
                    method: 'import'
                }),
                liveServer({
                    port: 8090,
                    host: '0.0.0.0',
                    root: 'www',
                    file: 'index.html',
                    mount: [['/dist/iife', './dist/iife'], ...mount],
                    open: false,
                    wait: 500,
                }),
                sourcemaps(),
            ],
        });
    } else {
        /* iife */
        config.push({
            input: [path.resolve(basedir, pkg.entry)],
            output: {
                file: path.resolve(basedir, pkg.iife),
                format: 'iife',
                name: moduleName,
                sourcemap: true,
            },
            plugins: [
                resolve({ extensions }),
                commonjs(),
                string({
                    include: ["**/*.css", "**/*.html", "**/*.txt"],
                    exclude: ["**/css/*.css"]
                }),
                babel({
                    extensions,
                    exclude: [/node_modules\/(?!(lit-html|lit-element)\/).*/],
                    rootMode: "upward",
                    presets: [
                        [
                            '@babel/env',
                            {
                                targets: {
                                    ie: '11',
                                },
                                useBuiltIns: 'entry',
                                corejs: { version: 3, proposals: true },
                            },
                        ],
                        '@babel/typescript',
                    ],
                }),
                polyfill([
                    'core-js',
                    'regenerator-runtime/runtime',
                    '@webcomponents/webcomponentsjs/webcomponents-bundle'
                ], {
                    method: 'import'
                }),
                sourcemaps(),
            ],
        });

        /* ES5 */
        config.push({
            input: [path.resolve(basedir, pkg.entry)],
            output: {
                file: path.resolve(basedir, pkg.main),
                format: 'cjs',
                sourcemap: true,
            },
            plugins: [
                resolve({ extensions }),
                commonjs(),
                string({
                    include: ["**/*.css", "**/*.html", "**/*.txt"],
                    exclude: ["**/css/*.css"]
                }),
                babel({
                    extensions,
                    include: ['src/**/*'],
                    rootMode: "upward",
                    presets: [
                        [
                            '@babel/env',
                            {
                                targets: {
                                    ie: '11',
                                },
                                useBuiltIns: 'entry',
                                corejs: { version: 3, proposals: true },
                            },
                        ],
                        '@babel/typescript',
                    ],
                }),
                polyfill([
                    'core-js',
                    'regenerator-runtime/runtime',
                    '@webcomponents/webcomponentsjs/webcomponents-bundle'
                ], {
                    method: 'import'
                }),
                sourcemaps(),
            ],
        });

        /* ES6 */
        config.push({
            input: [path.resolve(basedir, pkg.entry)],
            output: {
                file: path.resolve(basedir, pkg.module),
                format: 'esm',
                sourcemap: true,
            },
            plugins: [
                resolve({ extensions }),
                commonjs(),
                string({
                    include: ["**/*.css", "**/*.html", "**/*.txt"],
                    exclude: ["**/css/*.css"]
                }),
                babel({
                    extensions,
                    include: ['src/**/*'],
                    rootMode: "upward",
                    presets: [
                        [
                            '@babel/env',
                            {
                                targets: {
                                    chrome: '51',
                                },
                                useBuiltIns: 'usage',
                                corejs: { version: 3, proposals: true },
                            },
                        ],
                        '@babel/typescript',
                    ],
                }),
                sourcemaps(),
            ],
        });

        /* ESNext */
        config.push({
            input: [path.resolve(basedir, pkg.entry)],
            output: {
                file: path.resolve(basedir, pkg['jsnext:main']),
                format: 'esm',
                sourcemap: true,
            },
            plugins: [
                resolve({ extensions }),
                commonjs(),
                string({
                    include: ["**/*.css", "**/*.html", "**/*.txt"],
                    exclude: ["**/css/*.css"]
                }),
                typescript({
                    typescript: require('typescript'),
                    cacheRoot: path.resolve(__dirname, '.rts2_cache'),
                    objectHashIgnoreUnknownHack: true,
                }),
                sourcemaps(),
            ],
        });
    }

    return config;
}

module.exports = generateConfig;
