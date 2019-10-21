
function supportsCSSVariables(): boolean {
    return (window as any).CSS && CSS.supports('color', 'var(--fake-var)');
}

abstract class CSSReader {
    protected mElement: HTMLElement;
    protected constructor(element: HTMLElement) {
        this.mElement = element;
    }

    abstract option(name: string, value: string | void): string | void;
}

class CSSReaderModern extends CSSReader {
    private mStyle: CSSStyleDeclaration;
    private mObserver: MutationObserver;

    public constructor(element: HTMLElement) {
        super(element);
        this.mStyle = getComputedStyle(this.mElement);
        this.mObserver = new MutationObserver((): void => this.handleObserverEvent());
        this.mObserver.observe(this.mElement, {
            attributes: true,
            attributeFilter: ['style', 'class'],
        });
    }

    public option(name: string, value: string | void): string | void {
        const result: string = this.mStyle.getPropertyValue(`--${name}`);
        if (result.length) {
            return result;
        }
        return value;
    }

    private handleObserverEvent(): void {
        this.mStyle = getComputedStyle(this.mElement);
    }
}

class CSSReaderLegacy extends CSSReader {
    public constructor(element: HTMLElement) {
        super(element);
    }

    public option(name: string, value: string | void): string | void {
        return this._readOptionRecursive(this.mElement, name, value);
    }

    private _readOptionRecursive(element: HTMLElement, name: string, value: string | void): string | void {
        if ((element as any).currentStyle.hasOwnProperty(`-ie11-${name}`)) {
            return (element as any).currentStyle[`-ie11-${name}`];
        }

        if (element === document.body) {
            return value;
        }

        const parent: HTMLElement = element.parentElement || (element as any).__shady_native_parentElement;
        if (!parent) {
            return value;
        }

        return this._readOptionRecursive(parent as HTMLElement, name, value);
    }
}

export class CSSOptions {
    private mReader: CSSReader;

    public constructor(element: HTMLElement) {
        this.mReader = supportsCSSVariables() ? new CSSReaderModern(element) : new CSSReaderLegacy(element);
    }

    public read(name: string, value: string | void): string | void {
        return this.mReader.option(name, value);
    }
}
