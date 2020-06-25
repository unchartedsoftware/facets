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

import { customElement, TemplateResult, html, CSSResult, css, unsafeCSS } from 'lit-element';
import { FacetBarsBase, FacetBarsBaseData, kFacetBarsBaseDefaultValues } from '../facet-bars-base/FacetBarsBase';

// @ts-ignore
import facetBarsStyle from './FacetBars.css';

export interface FacetBarsData {
    values: FacetBarsBaseData;
    label?: string;
    metadata?: any;
}

const kDefaultData: FacetBarsData = { values: kFacetBarsBaseDefaultValues };

@customElement('facet-bars')
export class FacetBars extends FacetBarsBase {
    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
        styles.push(css`
            ${unsafeCSS(facetBarsStyle)}
        `);
        return styles;
    }

    public static get properties(): any {
        return {
            data: { type: Object },
            disabled: { type: Boolean },
        };
    }

    public disabled: boolean = false;

    private _data: FacetBarsData = kDefaultData;
    // @ts-ignore
    public get data(): FacetBarsData {
        return this._data;
    }
    // @ts-ignore
    public set data(value: FacetBarsData | null) {
        const oldValue = this._data;
        if (!value || value === kDefaultData) {
            this._data = kDefaultData;
        } else {
            this._data = value;
        }
        this.values = this._data.values;
        this.requestUpdate('data', oldValue);
    }

    private computedStyle: TemplateResult | void | null = null;

    public connectedCallback(): void {
        super.connectedCallback();

        const labels = this.createSlottedElement('labels', 'facet-bars-labels');
        if (labels) {
            labels.setAttribute('id', 'facet-bars-labels');
        }

        if (!this.disabled) {
            const selection = this.createSlottedElement('selection', 'facet-bars-selection');
            if (selection) {
                selection.setAttribute('id', 'facet-bars-selection');
            }
        }
    }

    protected renderHeaderLabel(): TemplateResult | void {
        return html`<span>${this.data.label}</span>`;
    }

    protected renderContent(): TemplateResult {
        return html`
        ${super.renderContent()}
        <slot name="labels"></slot>
        `;
    }

    protected computeStyle(): TemplateResult | void {
        if (this.computedStyle === null) {
            const theme = this.getAttribute('theme');
            const hostTheme = theme ? `[theme="${theme}"]` : ':not([theme])';

            const cssOptions = this.cssOptions;
            const styles = [];

            const tickValue = cssOptions.read('facet-bars-tick-color');
            if (tickValue !== undefined) {
                styles.push(`:host(${hostTheme}:hover) .facet-blueprint .facet-blueprint-left { border-left: 4px solid ${tickValue}; }`);
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
