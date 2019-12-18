export function log(...varArgs: any[]): void {
    // eslint-disable-next-line no-console
    console.log(`${new Date().toISOString()}: [FACETS-BUILDER-SERVER]`, ...varArgs);
}
