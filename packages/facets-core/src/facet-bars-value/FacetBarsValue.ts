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

import {css, CSSResult, customElement, html, TemplateResult, unsafeCSS} from 'lit-element';
import {styleMap} from 'lit-html/directives/style-map';
import {CSSOptions} from '@uncharted.software/css-options';
import {FacetBlueprint} from '../facet-blueprint/FacetBlueprint';
import {renderButtons} from '../tools/buttons';
// @ts-ignore
import buttonsStyle from '../tools/buttons.css';

// @ts-ignore
import FacetBarsValueStyle from './FacetBarsValue.css';
// @ts-ignore
import FacetBarsValueDefaultTheme from './FacetBarsValue.default.css';
// @ts-ignore
import FacetBarsValueTimelineTheme from './FacetBarsValue.timeline.css';

function getBarColorHostSelector(theme: string, state: string, index: number, contrast: boolean, hover: boolean): string {
    return `:host(${theme}${contrast ? '[contrast=true]' : ''}[facet-value-state="${state}"]${hover ? ':hover' : ''}) .facet-bars-value-background .facet-bars-value-bar-${index}`;
}

const kBarStylePrefix = 'facet-bars-';
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

    '-unselected': (theme: string, index: number, value: string): string =>
        `${getBarColorHostSelector(theme, 'unselected', index, false, false)} { background-color:${value} }`,
    '-unselected-contrast': (theme: string, index: number, value: string): string =>
        `${getBarColorHostSelector(theme, 'unselected', index, true, false)} { background-color:${value} }`,
    '-unselected-contrast-hover': (theme: string, index: number, value: string): string =>
        `${getBarColorHostSelector(theme, 'unselected', index, true, true)} { background-color:${value} }`,

    '-muted': (theme: string, index: number, value: string): string =>
        `${getBarColorHostSelector(theme, 'muted', index, false, false)} { background-color:${value} }`,
    '-muted-contrast': (theme: string, index: number, value: string): string =>
        `${getBarColorHostSelector(theme, 'muted', index, true, false)} { background-color:${value} }`,
    '-muted-contrast-hover': (theme: string, index: number, value: string): string =>
        `${getBarColorHostSelector(theme, 'muted', index, true, true)} { background-color:${value} }`,
};
const kBarStyleSuffixes = Object.keys(kBarStyleGenerators);

export interface FacetBarsValueData {
    ratio: number | null;
    label?: string | string[];
    metadata?: any;
}

export const kFacetVarsValueNullData: FacetBarsValueData = { ratio: 0 };

@customElement('facet-bars-value')
export class FacetBarsValue extends FacetBlueprint {
    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
        styles.push(css`
            ${unsafeCSS(buttonsStyle)}
            ${unsafeCSS(FacetBarsValueStyle)}
            ${unsafeCSS(FacetBarsValueDefaultTheme)}
            ${unsafeCSS(FacetBarsValueTimelineTheme)}
        `);

        if (CSSOptions.supportsCSSVars) {
            // add the style for 20 sub-bars, sorry future Dario, you'll probably have to make this number dynamic
            // start at bar 2 since the css already has the proper style for the first two
            for (let i = 2; i < 20; ++i) {
                styles.push(css`
                    :host([facet-value-state="normal"]) .facet-bars-value-bar-${i}
                    {
                        background-color: var(--facet-bars-${i}-normal);
                    }

                    :host([contrast=true][facet-value-state="normal"]) .facet-bars-value-bar-${i}
                    {
                        background-color: var(--facet-bars-${i}-normal-contrast);
                    }

                    :host([contrast=true][facet-value-state="normal"]:hover) .facet-bars-value-bar-${i}
                    {
                        background-color: var(--facet-bars-${i}-normal-contrast-hover);
                    }

                    :host([facet-value-state="selected"]) .facet-bars-value-bar-${i}
                    {
                        background-color: var(--facet-bars-${i}-selected);
                    }

                    :host([contrast=true][facet-value-state="selected"]) .facet-bars-value-bar-${i}
                    {
                        background-color: var(--facet-bars-${i}-selected-contrast);
                    }

                    :host([contrast=true][facet-value-state="selected"]:hover) .facet-bars-value-bar-${i}
                    {
                        background-color: var(--facet-bars-${i}-selected-contrast-hover);
                    }

                    :host([facet-value-state="unselected"]) .facet-bars-value-bar-${i}
                    {
                        background-color: var(--facet-bars-${i}-unselected);
                    }

                    :host([contrast=true][facet-value-state="unselected"]) .facet-bars-value-bar-${i}
                    {
                        background-color: var(--facet-bars-${i}-unselected-contrast);
                    }

                    :host([contrast=true][facet-value-state="unselected"]:hover) .facet-bars-value-bar-${i}
                    {
                        background-color: var(--facet-bars-${i}-unselected-contrast-hover);
                    }

                    :host([facet-value-state="muted"]) .facet-bars-value-bar-${i}
                    {
                        background-color: var(--facet-bars-${i}-muted);
                    }

                    :host([contrast=true][facet-value-state="muted"]) .facet-bars-value-bar-${i}
                    {
                        background-color: var(--facet-bars-${i}-muted-contrast);
                    }

                    :host([contrast=true][facet-value-state="muted"]:hover) .facet-bars-value-bar-${i}
                    {
                        background-color: var(--facet-bars-${i}-muted-contrast-hover);
                    }
                `);
            }
        }

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
            actionButtons: { type: Number, attribute: 'action-buttons' },
            clipLeft: { type: Number },
            clipRight: { type: Number },
        };
    }

    private _data: FacetBarsValueData = kFacetVarsValueNullData;
    public get data(): FacetBarsValueData {
        return this._data;
    }
    public set data(newData: FacetBarsValueData) {
        const oldData = this._data;
        this._data = newData;
        this.requestUpdate('data', oldData);
    }

    public values: number[] = [];
    public actionButtons: number = 2;
    public clipLeft: number = 0;
    public clipRight: number = 0;
    private computedStyle: TemplateResult|void|null = null;

    protected renderContent(): TemplateResult | void {
        if (this.clipLeft > 0 || this.clipRight > 0) {
            const clipStyle = {
                'margin-left': `${(this.clipLeft * 100).toFixed(2)}%`,
                'margin-right': `${(this.clipRight * 100).toFixed(2)}%`,
            };
            return html`
            <div class="facet-bars-value-background" style="${styleMap(clipStyle)}">
                ${this.renderBars()}
            </div>
            <div class="facet-hoverable-buttons"><slot name="buttons">
                ${renderButtons(this)}
            </slot></div>
            `;
        }
        return html`
        <div class="facet-bars-value-background">
            ${this.renderBars()}
        </div>
        <div class="facet-hoverable-buttons"><slot name="buttons">
            ${renderButtons(this)}
        </slot></div>
        `;
    }

    protected renderBars(): TemplateResult[] {
        const result = [];
        for (let i = 0, n = this.values.length; i < n; ++i) {
            const value = this.values[i];
            if (!isNaN(value)) {
                const height = (Math.max(Math.min(value, 1), 0) * 100).toFixed(2);
                result.push(html`
                <div class="facet-bars-value-bar-${n - i - 1}" style="height: ${height}%"></div>
                `);
            }
        }
        return result;
    }

    protected computeStyle(): TemplateResult | void {
        if (this.computedStyle === null) {
            const theme = this.getAttribute('theme');
            const hostTheme = theme ? `[theme="${theme}"]` : ':not([theme])';

            const cssOptions = this.cssOptions;
            const styles = [];
            const n = this.values.length;
            let i = 0;
            let hasOption;
            do {
                hasOption = false;
                for (let ii = 0, nn = kBarStyleSuffixes.length; ii < nn; ++ii) {
                    const option = `${kBarStylePrefix}${i}${kBarStyleSuffixes[ii]}`;
                    const optionValue = cssOptions.read(option);
                    if (optionValue !== undefined) {
                        hasOption = true;
                        styles.push(kBarStyleGenerators[kBarStyleSuffixes[ii]](hostTheme, i, optionValue));
                    }
                }
            } while (++i < n || hasOption);

            if (styles.length) {
                this.computedStyle = html`<style>${styles}</style>`;
            } else {
                this.computedStyle = undefined;
            }
        }
        return this.computedStyle;
    }
}
