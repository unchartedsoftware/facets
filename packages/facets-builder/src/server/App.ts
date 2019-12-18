import express from 'express';
import {log} from './log';
import path from 'path';
import fs from 'fs';
import * as http from 'http';
import * as https from 'https';

const reload = require('reload');

export interface AppOptions {
    httpPort?: number;
    httpsPort?: number;
    host?: string;
    sslKey?: string | null;
    sslCert?: string | null;
}

const kDefaultOptions: AppOptions = {
    httpPort: 80,
    httpsPort: 443,
    host: '0.0.0.0',
    sslKey: null,
    sslCert: null,
};

export class App {
    private options: AppOptions;
    private app: express.Express;
    private httpServer: http.Server;
    private httpsServer: https.Server | null;

    public constructor(options: AppOptions = {}) {
        this.options = Object.assign({}, kDefaultOptions, options);
        this.app = express();
        this.httpServer = http.createServer(this.app);

        if (this.options.sslKey && this.options.sslCert) {
            this.httpsServer = https.createServer({
                key: fs.readFileSync(path.resolve(__dirname, this.options.sslKey)),
                cert: fs.readFileSync(path.resolve(__dirname, this.options.sslCert)),
            }, this.app);
        } else {
            this.httpsServer = null;
        }

        this.initializeRoutes();
    }

    public start(): void {
        // setup `reload`
        reload(this.app).then((): void => {
            // Reload started, start web server
            this.httpServer.listen(this.options.httpPort, this.options.host, (): void => {
                log(`HTTP Web server listening on port ${this.options.httpPort}`);
            });

            if (this.httpsServer) {
                this.httpsServer.listen(this.options.httpsPort, this.options.host, (): void => {
                    log(`HTTPS Web server listening on port ${this.options.httpsPort}`);
                });
            }
        }).catch((err: Error): void => {
            console.error('Reload could not start, could not start server app', err);
        });
    }

    private initializeRoutes(): void {

        // upgrade to https if needed
        this.app.use((req, res, next): any => {
            if (this.httpsServer && !req.secure) {
                const host = req.hostname + (this.options.httpsPort === 443 ? '' : `:${this.options.httpsPort}`);
                log(`Upgrading "http://${req.get('host')}${req.baseUrl}" to "https://${host}${req.baseUrl}"`);
                return res.redirect(['https://', host, req.baseUrl].join(''));
            }
            next();
            return undefined;
        });

        // serve the index file on the root
        this.app.get('/', (req, res): void => {
            res.sendFile(path.resolve(__dirname, '../../www/index.html'));
        });

        // setup static folders
        this.app.use(express.static(path.resolve(__dirname, '../../www')));
        this.app.use(express.static(path.resolve(__dirname, '../client')));
    }
}
