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
const globby = require('globby');

const extensions = [
    '.js', '.jsx', '.ts', '.tsx',
];

function generateSingleConfig(target, input, output, dependencies = null, moduleName = null, sourcemap = true, addLiveServer = false, mount = []) {
    let format;
    let babelTargets = null;
    let includePolyfill = false;
    let includeNodeModules = false;
    switch (target) {
        case 'iife':
            format = 'iife';
            babelTargets = { ie: '11' };
            includePolyfill = true;
            includeNodeModules = true;
            break;

        case 'es5':
            format = 'cjs';
            // babelTargets = { ie: '11' };
            break;

        case 'es6':
            format = 'esm';
            // babelTargets = { chrome: '51' };
            break;

        case 'next':
        default:
            format = 'esm';
            break;
    }

    const config = {
        input: input,
        output: {
            dir: output,
            format: format,
            sourcemap: sourcemap,
        },
        plugins: [],
        treeshake: {
            moduleSideEffects: false,
        },
        watch: {
            clearScreen: false
        },
    };

    if (dependencies) {
        const keys = Object.keys(dependencies);
        config.external = id => {
            if (id.startsWith('lit-element')) {
                return true;
            }
            for (let key of keys) {
                if (id.startsWith(key)) {
                    return true;
                }
            }
            return false;
        };
    }

    if (moduleName) {
        config.output.name = moduleName;
    }

    if (includeNodeModules) {
        config.plugins.push(resolve({ extensions }));
        config.plugins.push(commonjs());
    }

    config.plugins.push(string({
        include: ["**/*.css", "**/*.html", "**/*.txt"],
        exclude: ["**/css/*.css"]
    }));

    if (babelTargets) {
        config.plugins.push(babel({
            extensions,
            exclude: [/node_modules\/(?!(lit-html|lit-element)\/).*/],
            rootMode: "upward",
            presets: [
                [
                    '@babel/env',
                    {
                        targets: babelTargets,
                        useBuiltIns: 'entry',
                        corejs: { version: 3, proposals: true },
                    },
                ],
                '@babel/typescript',
            ],
        }));
    } else {
        config.plugins.push(typescript({
            typescript: require('typescript'),
            cacheRoot: path.resolve(__dirname, '.rts2_cache'),
            objectHashIgnoreUnknownHack: true,
            tsconfigOverride: {
                compilerOptions: {
                    target: target === 'next' ? 'esnext' : target === 'iife' ? 'es5' : target,
                }
            }
        }));
    }

    if (includePolyfill) {
        config.plugins.push(polyfill([
            'core-js',
            'regenerator-runtime/runtime',
            '@webcomponents/webcomponentsjs/webcomponents-bundle'
        ], {
            method: 'import'
        }));
    }

    if (addLiveServer) {
        config.plugins.push(liveServer({
            port: 8090,
            host: '0.0.0.0',
            root: 'www',
            file: 'index.html',
            mount: [['/dist/iife', './dist/iife'], ...mount],
            open: false,
            wait: 500,
        }));
    }

    config.plugins.push(sourcemaps());

    return config;
}

function generateConfig(pkg, basedir, mount = []) {
    const moduleName = pkg.name.split('/').pop().replace('-', '');
    const config = [];

    if (process.env.TARGET === 'debug') {
        config.push(generateSingleConfig(
            'iife',
            [path.resolve(basedir, pkg.entry)],
            path.resolve(basedir, pkg.iife),
            null,
            moduleName,
            'inline',
            true,
            mount
        ));
    }

    if (process.env.TARGET === 'iife' || process.env.TARGET === 'all') {
        /* iife */
        config.push(generateSingleConfig(
            'iife',
            [path.resolve(basedir, pkg.entry)],
            path.resolve(basedir, pkg.iife),
            null,
            moduleName
        ));
    }

    /* all input files */
    const input = {};
    globby.sync(['src/**/*.ts']).forEach(file => {
        const parsed = path.parse(file);
        input[path.join(parsed.dir.substr('src/'.length), parsed.name)] = file;
    });

    if (process.env.TARGET === 'es5' || process.env.TARGET === 'all') {
        /* ES5 */
        config.push(generateSingleConfig(
            'es5',
            input,
            path.resolve(basedir, pkg.main),
            pkg.dependencies
        ));
    }

    if (process.env.TARGET === 'es6' || process.env.TARGET === 'all') {
        /* ES6 */
        config.push(generateSingleConfig(
            'es6',
            input,
            path.resolve(basedir, pkg.module),
            pkg.dependencies
        ));

    }

    if (process.env.TARGET === 'next' || process.env.TARGET === 'all') {
        /* ESNext */
        config.push(generateSingleConfig(
            'next',
            input,
            path.resolve(basedir, pkg['jsnext:main']),
            pkg.dependencies
        ));
    }

    return config;
}

module.exports = generateConfig;
