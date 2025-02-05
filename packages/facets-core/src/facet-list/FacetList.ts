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

import {TemplateResult, html} from 'lit';
import {preHTML} from '../tools/preHTML';
import {FacetContainer} from '../facet-container/FacetContainer';
import {FacetTemplate} from '../facet-template/FacetTemplate';

export interface FacetListDataElement {
    type: string;
    data: any;
    id?: string;
}

export type FacetListData = FacetListDataElement[];

type FacetInteractiveSelection = [number, number] | { [key: number]: boolean } | null;
interface FacetInteractive {
    selection: FacetInteractiveSelection;
    hover: boolean;
    id: string;
}

export type FacetListSelection = { [key: string]: FacetInteractiveSelection } | null;

export class FacetList extends FacetContainer {
    public static get properties(): any {
        return {
            data: { type: Object },
            selection: { type: Object }
        };
    }

    private _data: FacetListData = [];
    public get data(): FacetListData {
        return this._data;
    }
    public set data(value: FacetListData) {
        const oldValue = this._data;
        this._data = value;
        this.requestUpdate('data', oldValue);
    }

    private _selection: FacetListSelection = null;
    public get selection(): FacetListSelection {
        return this._selection;
    }
    public set selection(value: FacetListSelection) {
        const oldValue = this._selection;
        this._selection = value;
        const content = this.querySelector('#facet-list-content');
        if (content) {
            if (this._selection) {
                const keys = Object.keys(this._selection);
                let element;
                let facet;
                let newSelection;
                for (let i = 0, n = keys.length; i < n; ++i) {
                    element = content.querySelector(`#${keys[i]}`);
                    if (element) {
                        facet = element as unknown as FacetInteractive;
                        newSelection = this._selection[keys[i]];
                        if (!this.isSameSelection(newSelection, facet.selection)) {
                            this.setSelectionIgnoringEvent(facet, newSelection);
                        }
                    }
                }
            } else {
                let facet;
                for (let i = 0, n = content.children.length; i < n; ++i) {
                    facet = content.children[i] as unknown as FacetInteractive;
                    if (facet.selection) {
                        this.setSelectionIgnoringEvent(facet, null);
                    }
                }
            }
        }
        this.requestUpdate('selection', oldValue);
    }

    private ignoreSelectionMap: Map<FacetInteractive, FacetInteractiveSelection> = new Map();
    private facetIDs: Set<string> = new Set();

    public connectedCallback(): void {
        super.connectedCallback();
        const list = this.createSlottedElement('content');
        if (list) {
            list.setAttribute('id', 'facet-list-content');
        }
    }

    protected renderHeader(): TemplateResult | void {
        return undefined;
    }

    protected renderFooter(): TemplateResult | void {
        return undefined;
    }

    protected renderSlottedElements(): void {
        super.renderSlottedElements();
        const listSlot = this.slottedElements.get('content');
        if (listSlot) {
            this.renderSlottedElement(this._renderContent(), listSlot);
        }
    }

    protected setTemplateForTarget(target: string, template: FacetTemplate): void {
        super.setTemplateForTarget(target, template);
        template.addCustomAttribute('id');
        template.addCustomAttribute('.selection');
        template.addCustomAttribute('@facet-element-updated');
    }

    private handleElementUpdated(event: CustomEvent): void {
        const changedProperties = event.detail.changedProperties;
        const content = this.querySelector('#facet-list-content');
        if (content) {
            if (changedProperties.has('hover')) {
                const source = event.target as unknown as FacetInteractive;
                const value = source.hover;
                let facet;
                for (let i = 0, n = content.children.length; i < n; ++i) {
                    facet = content.children[i] as unknown as FacetInteractive;
                    facet.hover = value;
                }
            }

            if (changedProperties.has('selection')) {
                const source = event.target as unknown as FacetInteractive;
                if (this.shouldProcessSelectionEvent(source) && (changedProperties.get('selection') || source.selection)) {
                    const constructor = Object.getPrototypeOf(source).constructor;
                    const siblings = [];
                    let facet;
                    for (let i = 0, n = content.children.length; i < n; ++i) {
                        facet = content.children[i] as unknown as FacetInteractive;
                        if (facet !== source && Object.getPrototypeOf(facet).constructor === constructor) {
                            siblings.push(facet);
                        }
                    }

                    if (siblings.length) {
                        this.handleSelectionEvent(source, siblings);
                    } else {
                        const oldValue = this._selection;
                        this._selection = this.buildSelection();
                        this.requestUpdate('selection', oldValue);
                    }
                }
            }
        }
    }

    private handleSelectionEvent(source: FacetInteractive, siblings: FacetInteractive[]): void {
        const sourceSelection = source.selection;
        if (!sourceSelection) {
            let hasSelection = false;
            for (let i = 0, n = siblings.length; i < n; ++i) {
                // @ts-ignore
                if (siblings[i].selection && Object.keys(siblings[i].selection).length) {
                    hasSelection = true;
                    break;
                }
            }

            if (hasSelection) {
                this.setSelectionIgnoringEvent(source, []);
            } else {
                for (let i = 0, n = siblings.length; i < n; ++i) {
                    if (siblings[i].selection) {
                        this.setSelectionIgnoringEvent(siblings[i], null);
                    }
                }
            }
        } else {
            for (let i = 0, n = siblings.length; i < n; ++i) {
                if (!siblings[i].selection) {
                    this.setSelectionIgnoringEvent(siblings[i], []);
                }
            }
        }
        const oldValue = this._selection;
        this._selection = this.buildSelection();
        this.requestUpdate('selection', oldValue);
    }

    private setSelectionIgnoringEvent(target: FacetInteractive, value: FacetInteractiveSelection): void {
        this.ignoreSelectionMap.set(target, value);
        target.selection = value;
    }

    private shouldProcessSelectionEvent(source: FacetInteractive): boolean {
        if (this.ignoreSelectionMap.has(source)) {
            const expectedSelection = this.ignoreSelectionMap.get(source);
            this.ignoreSelectionMap.delete(source);

            const sourceSelection = source.selection;
            return !this.isSameSelection(expectedSelection, sourceSelection);
        }
        return true;
    }

    private isSameSelection(expectedSelection: FacetInteractiveSelection | void, sourceSelection: FacetInteractiveSelection | void): boolean {
        if (sourceSelection === expectedSelection) {
            return true;
        }

        if (!expectedSelection || !sourceSelection) {
            return false;
        }

        const expectedKeys = Object.keys(expectedSelection);
        const sourceKeys = Object.keys(sourceSelection);
        if (expectedKeys.length !== sourceKeys.length) {
            return false;
        }

        for (let i = 0, n = sourceKeys.length; i < n; ++i) {
            // @ts-ignore
            if (sourceSelection[sourceKeys[i]] !== expectedSelection[expectedKeys[i]]) {
                return false;
            }
        }
        return true;
    }

    private buildSelection(): FacetListSelection {
        const content = this.querySelector('#facet-list-content');
        if (content) {
            const newSelection: FacetListSelection = {};
            let hasSelection = false;
            let element;
            let facet;
            for (const id of this.facetIDs) {
                element = content.querySelector(`[id='${id}']`);
                if (element) {
                    facet = element as unknown as FacetInteractive;
                    newSelection[id] = facet.selection;
                    hasSelection = hasSelection || Boolean(newSelection[id]);
                }
            }

            if (hasSelection) {
                return newSelection;
            }
        }
        return null;
    }

    private _renderContent(): TemplateResult {
        const result: TemplateResult[] = [];

        this.facetIDs.clear();

        for (let i = 0, n = this.data.length; i < n; ++i) {
            const facet = this.data[i];
            const id = Object.prototype.hasOwnProperty.call(facet, 'id') ? facet.id : `${i}`;
            const selection = this._selection ? this._selection[id as string] || [] : null;
            this.facetIDs.add(id as string);
            if (this.templates.has(facet.type)) {
                const template = this.templates.get(facet.type);
                // @ts-ignore
                result.push(template.generateTemplate(facet.data, {
                    id,
                    '.selection': selection,
                    '@facet-element-updated': this.handleElementUpdated
                }));
            } else {
                const type = facet.type.split('#')[0];
                result.push(preHTML`
                    <${type}
                    id="${id}"
                    .data="${facet.data}"
                    .selection="${selection}"
                    @facet-element-updated="${this.handleElementUpdated}"
                    ></${type}>`);
            }
        }
        return html`${result}`;
    }
}

// Register the custom element if it hasn't been registered yet
if (!customElements.get('facet-list')) {
    customElements.define('facet-list', FacetList);
}
