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
import {
    FacetBarsBase,
    FacetBarsValueDataTyped,
    kFacetBarsBaseDefaultValues,
} from '../facet-bars-base/FacetBarsBase';

// @ts-ignore
import FacetTimelineStyle from './FacetTimeline.css';

export interface FacetTimelineValue extends FacetBarsValueDataTyped {
    minDateLabel: string;
    maxDateLabel: string;
}

export interface FacetTimelineData { [key: number]: FacetTimelineValue | null }

@customElement('facet-timeline')
export class FacetTimeline extends FacetBarsBase {
    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
        styles.push(css`
            ${unsafeCSS(FacetTimelineStyle)}
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

    private _data: FacetTimelineData = kFacetBarsBaseDefaultValues as FacetTimelineData;
    // @ts-ignore
    public get data(): FacetTimelineData {
        return this._data;
    }
    // @ts-ignore
    public set data(value: FacetTimelineData | null) {
        const oldValue = this._data;
        if (!value || value === kFacetBarsBaseDefaultValues) {
            this._data = kFacetBarsBaseDefaultValues as FacetTimelineData;
        } else {
            this._data = value;
        }
        this.values = this._data;
        this.requestUpdate('data', oldValue);
    }

    public get barValueTheme(): string {
        return 'timeline';
    }

    public connectedCallback(): void {
        super.connectedCallback();

        const labels = this.createSlottedElement('labels', 'facet-timeline-labels');
        if (labels) {
            labels.setAttribute('id', 'facet-timeline-labels');
        }

        if (!this.disabled) {
            const selection = this.createSlottedElement('selection', 'facet-timeline-selection');
            if (selection) {
                selection.setAttribute('id', 'facet-timeline-selection');
            }
        }
    }

    protected renderContent(): TemplateResult {
        return html`
        <div class="facet-timeline-content">
            ${this.renderTimelineContent()}
            <slot name="scrollbar"></slot>
        </div>
        `;
    }

    protected renderTimelineContent(): TemplateResult {
        return html`
        ${super.renderContent()}
        <slot name="labels"></slot>
        `;
    }
}

