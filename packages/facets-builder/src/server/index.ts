import {App} from './App';

async function main(): Promise<void> {
    const app = new App({ httpPort: 8090 });
    app.start();
}

main();

