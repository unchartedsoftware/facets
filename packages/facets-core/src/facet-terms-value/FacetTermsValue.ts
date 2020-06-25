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

import {css, CSSResult, customElement, unsafeCSS, html, TemplateResult} from 'lit-element';
import {FacetHoverable} from '../facet-hoverable/FacetHoverable';

// @ts-ignore
import facetTermValueStyle from './FacetTermsValue.css';

export interface FacetTermsValueData {
    ratio: number;
    label?: string;
    value?: number | string;
    annotation?: string;
    metadata?: any;
}

const kDefaultData: FacetTermsValueData = { ratio: 0 };
function getBarColorHostSelector(theme: string, state: string, index: number, contrast: boolean, hover: boolean): string {
    return `:host(${theme}${contrast ? '[contrast=true]' : ''}[state="${state}"]${hover ? ':hover' : ''}) .facet-term-bar-background .facet-terms-value-bar-${index}`;
}

const kBarStylePrefix = 'facet-terms-bar-';
const kBarStyleGenerators: {[key: string]: any} = {
    '-normal': (theme: string, index: number, value: string): string =>
        `${getBarColorHostSelector(theme, 'normal', index, false, false)} { background-color:${value} }`,
    '-normal-contrast': (theme: string, index: number, value: string): string =>
        `${getBarColorHostSelector(theme, 'normal', index, true, false)} { background-color:${value} }`,
    '-normal-contrast-hover': (theme: string, index: number, value: string): string =>
        `${getBarColorHostSelector(theme, 'normal', index, true, true)} { background-color:${value} }`,

    '-selected': (theme: string, index: number, value: string): string =>
        `${getBarColorHostSelector(theme, 'selected', index, false, false)} { background-color:${value} }`,
    '-selected-contrast': (theme: string, index: number, value: string): string =>
        `${getBarColorHostSelector(theme, 'selected', index, true, false)} { background-color:${value} }`,
    '-selected-contrast-hover': (theme: string, index: number, value: string): string =>
        `${getBarColorHostSelector(theme, 'selected', index, true, true)} { background-color:${value} }`,

    '-muted': (theme: string, index: number, value: string): string =>
        `${getBarColorHostSelector(theme, 'muted', index, false, false)} { background-color:${value} }`,
    '-muted-contrast': (theme: string, index: number, value: string): string =>
        `${getBarColorHostSelector(theme, 'muted', index, true, false)} { background-color:${value} }`,
    '-muted-contrast-hover': (theme: string, index: number, value: string): string =>
        `${getBarColorHostSelector(theme, 'muted', index, true, true)} { background-color:${value} }`,
};
const kBarStyleSuffixes = Object.keys(kBarStyleGenerators);

@customElement('facet-terms-value')
export class FacetTermsValue extends FacetHoverable {
    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
        styles.push(css`
            ${unsafeCSS(facetTermValueStyle)}
        `);
        return styles;
    }

    public static get properties(): any {
        return {
            data: { type: Object },
            values: {
                type: Array,
                converter: {
                    fromAttribute: (value: string): number[] => {
                        if (!value) {
                            return [];
                        }
                        const arr = JSON.parse(value);
                        for (let i = 0, n = arr.length; i < n; ++i) {
                            arr[i] = parseFloat(arr[i]);
                        }
                        return arr;
                    },
                    toAttribute: (value: number): string => `[${value.toString()}]`,
                },
            },
        };
    }

    private _data: FacetTermsValueData = kDefaultData;
    public set data(newData: FacetTermsValueData) {
        const oldData = this._data;
        this._data = newData;
        this.requestUpdate('data', oldData);
    }
    public get data(): FacetTermsValueData {
        return this._data;
    }

    public values: number[] = [];
    private computedStyle: TemplateResult|void|null = null;

    protected renderContent(): TemplateResult | void {
        return html`
        <div class="facet-term-container">
            <div class="facet-term-bar">
                <slot name="bar">
                    <div class="facet-term-bar-background">${this.renderBar()}</div>
                </slot>
            </div>
            <div class="facet-term-details">
                <div class="facet-term-label"><slot name="label">${this.renderLabel()}</slot></div>
                <div class="facet-term-annotation"><slot name="annotation">${this.renderAnnotation()}</slot></div>
                <div class="facet-term-value"><slot name="value">${this.renderValue()}</slot></div>
            </div>
        </div>
        `;
    }

    protected renderBar(): TemplateResult[] {
        const result = [];
        for (let i = 0, n = this.values.length; i < n; ++i) {
            const value = this.values[i];
            if (!isNaN(value)) {
                const width = (Math.max(Math.min(value, 1), 0) * 100).toFixed(2);
                result.push(html`
                <div class="facet-terms-value-bar-${n - i - 1}" style="width: ${width}%"></div>
                `);
            }
        }
        return result;
    }

    protected renderLabel(): TemplateResult {
        return html`<span>${this.data.label}</span>`;
    }

    protected renderAnnotation(): TemplateResult {
        return html`<span>${this.data.annotation}</span>`;
    }

    protected renderValue(): TemplateResult {
        return html`<span>${this.data.value}</span>`;
    }

    protected computeStyle(): TemplateResult | void {
        if (this.computedStyle === null) {
            const theme = this.getAttribute('theme');
            const hostTheme = theme ? `[theme="${theme}"]` : ':not([theme])';

            const cssOptions = this.cssOptions;
            const styles = [];
            for (let i = 0, n = this.values.length; i < n; ++i) {
                for (let ii = 0, nn = kBarStyleSuffixes.length; ii < nn; ++ii) {
                    const option = `${kBarStylePrefix}${i}${kBarStyleSuffixes[ii]}`;
                    const optionValue = cssOptions.read(option);
                    if (optionValue !== undefined) {
                        styles.push(kBarStyleGenerators[kBarStyleSuffixes[ii]](hostTheme, i, optionValue));
                    }
                }
            }

            const tickValue = cssOptions.read('facet-terms-tick-color');
            if (tickValue !== undefined) {
                styles.push(`:host(${hostTheme}:hover) .facet-blueprint .facet-blueprint-left { border-left: 4px solid ${tickValue}; }`);
            }

            const selectedBackground = cssOptions.read('facet-terms-selected-background');
            if (selectedBackground !== undefined) {
                styles.push(`:host(${hostTheme}[state="selected"]) .facet-blueprint:first-of-type { background-color:${selectedBackground}; }`);
            }

            if (styles.length) {
                this.computedStyle = html`<style>${styles}</style>`;
            } else {
                this.computedStyle = undefined;
            }
        }
        return this.computedStyle;
    }
}
