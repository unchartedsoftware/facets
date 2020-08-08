
/*
 *  Copyright (c) 2020 Uncharted Software Inc.
 *  http://www.uncharted.software/
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a copy of
 *  this software and associated documentation files (the "Software"), to deal in
 *  the Software without restriction, including without limitation the rights to
 *  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 *  of the Software, and to permit persons to whom the Software is furnished to do
 *  so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 *
 */

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
        if ((element as any).currentStyle.hasOwnProperty(`-lgcy-${name}`)) {
            return (element as any).currentStyle[`-lgcy-${name}`];
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
    public static _supportsCSSVars: boolean = supportsCSSVariables();
    public static get supportsCSSVars(): boolean {
        return this._supportsCSSVars;
    }

    public get supportsCSSVars(): boolean {
        return CSSOptions._supportsCSSVars;
    }

    private mReader: CSSReader;

    public constructor(element: HTMLElement) {
        this.mReader = CSSOptions._supportsCSSVars ? new CSSReaderModern(element) : new CSSReaderLegacy(element);
    }

    public read(name: string, value: string | void): string | void {
        return this.mReader.option(name, value);
    }
}
