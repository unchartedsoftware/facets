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

import { FacetContainer } from '../facet-container/FacetContainer';
import { FacetTemplate } from '../facet-template/FacetTemplate';
import { FacetTermsValueData } from '../facet-terms-value/FacetTermsValue';
import { css, CSSResult, customElement, html, TemplateResult, unsafeCSS } from 'lit-element';
import { repeat } from 'lit-html/directives/repeat';
import { preHTML } from '../tools/preHTML';
import { polyMatches } from '../tools/PolyMatches';

// @ts-ignore
import facetTermsStyle from './FacetTerms.css';

export interface FacetTermsValueDataTyped extends FacetTermsValueData {
    type?: string;
}

export interface FacetTermsSelection {
    [key: number]: boolean;
}

export interface FacetTermsSubselection {
    [key: number]: number;
}

export interface FacetTermsData {
    values: { [key: number]: FacetTermsValueDataTyped };
    label?: string;
    metadata?: any;
}

const kDefaultData = { values: [] };

@customElement('facet-terms')
export class FacetTerms extends FacetContainer {
    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
        styles.push(css`
            ${unsafeCSS(facetTermsStyle)}
        `);
        return styles;
    }

    public static get properties(): any {
        return {
            data: { type: Object },
            selection: { type: Object },
            subselection: { type: Object },
            multiselect: { type: Object },
            actionButtons: { type: Number, attribute: "action-buttons" },
            disabled: { type: Boolean },
        };
    }

    public selection: FacetTermsSelection | null = null;
    public subselection: FacetTermsSubselection | null = null;
    public multiselect: boolean = true;
    public disabled: boolean = false;
    public actionButtons: number = 2;

    private _data: FacetTermsData = kDefaultData;
    public get data(): FacetTermsData {
        return this._data;
    }
    // @ts-ignore
    public set data(value: FacetTermsData | null) {
        const oldValue = this._data;
        if (!value || value === kDefaultData) {
            this._data = kDefaultData;
            this.valueKeys = [];
        } else {
            this._data = value;
            this.valueKeys = Object.keys(this._data.values).map((key: string): number => parseInt(key, 10));
        }
        this.requestUpdate('data', oldValue);
    }

    private _hover: boolean = false;
    public get hover(): boolean {
        return this._hover;
    }
    public set hover(value: boolean) {
        const oldValue = this._hover;
        this._hover = value;
        this.requestUpdate('hover', oldValue);
    }

    private valueKeys: number[] = [];

    protected setTemplateForTarget(target: string, template: FacetTemplate): void {
        super.setTemplateForTarget(target, template);
        template.addCustomAttribute('id');
        template.addCustomAttribute('action-buttons');
        template.addCustomAttribute('state');
        template.addCustomAttribute('contrast');
        template.addCustomAttribute('.values');
        template.addCustomAttribute('@click');
    }

    protected renderHeaderLabel(): TemplateResult | void {
        return html`<span>${this.data.label}</span>`;
    }

    public connectedCallback(): void {
        super.connectedCallback();
        const content = this.createSlottedElement('content');
        if (content) {
            content.setAttribute('id', 'facet-terms-content');
        }
    }

    protected renderSlottedElements(): void {
        super.renderSlottedElements();
        const content = this.slottedElements.get('content');
        if (content) {
            this.renderSlottedElement(this._renderContent() || html``, content);
        }
    }

    private _renderContent(): TemplateResult | void {
        const contrast = this.hover;
        const keyFunction = (key: number): number => key;
        const htmlFunction = (key: number): TemplateResult | void => {
            const value = this._data.values[key];
            if (value) {
                const type = value.type || 'facet-terms-value';
                const state = this.selection ? this.selection[key] && 'selected' || 'muted' : 'normal';
                const subselection = this.subselection && this.subselection.hasOwnProperty(key) ? this.subselection[key] : null;
                const values = this.computeValuesArray(value, subselection);
                const template = this.templates.get(type);
                if (template) {
                    return template.getHTML(value, {
                        'id': key,
                        'action-buttons': this.actionButtons,
                        'state': state,
                        'contrast': contrast,
                        '.values': values,
                        '@click': this.handleMouseClickEvent,
                    });
                } else if (type === 'facet-terms-value') {
                    return html`
                    <facet-terms-value
                        id="${key}"
                        action-buttons="${this.actionButtons}"
                        state="${state}"
                        contrast="${contrast}"
                        .values="${values}"
                        .data="${value}"
                        @click="${this.handleMouseClickEvent}">
                    </facet-terms-value>`;
                }
                return preHTML`
                <${type}
                    id="${key}"
                    action-buttons="${this.actionButtons}"
                    state="${state}"
                    contrast="${contrast}"
                    .values="${values}"
                    .data="${value}"
                    @click="${this.handleMouseClickEvent}">
                </${type}>`;
            }
            return undefined;
        };
        return html`
        <div class="facet-terms-container" @mouseenter="${this.handleMouseHoverEvent}" @mouseleave="${this.handleMouseHoverEvent}">
            ${repeat(this.valueKeys, keyFunction, htmlFunction)}
        </div>
        `;
    }

    private computeValuesArray(value: FacetTermsValueDataTyped, subselection: number | number[] | null): (number | null)[] {
        const result: (number | null)[] = [];
        if (value) {
            result.push(value.ratio);
            if (subselection !== null) {
                const sub = Array.isArray(subselection) ? subselection : [subselection];
                result.push(...sub);
            }
        }
        return result;
    }

    private handleMouseHoverEvent(event: MouseEvent): void {
        if (event.target instanceof Element) {
            this.hover = polyMatches(event.target, ':hover');
        }
    }

    private handleMouseClickEvent(event: MouseEvent): void {
        if (event.currentTarget instanceof Element && !this.disabled) {
            const id = parseInt(event.currentTarget.getAttribute('id') || '', 10);
            if (!isNaN(id)) {
                let selection = Object.assign({}, this.selection);
                if (selection[id]) {
                    if (this.multiselect) {
                        delete selection[id];
                    } else {
                        selection = {};
                    }
                } else {
                    if (this.multiselect) {
                        selection[id] = true;
                    } else {
                        selection = { [id]: true };
                    }
                }
                this.selection = Object.keys(selection).length === 0 ? null : selection;
            }
        }
    }
}
