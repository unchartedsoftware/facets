import {customElement, TemplateResult, html, LitElement} from 'lit-element';
import {preHTML} from '../tools/preHTML';
import {FacetContainer} from '../facet-container/FacetContainer';

export interface FacetListDataElement {
    type: string;
    data: any;
}

export type FacetListData = FacetListDataElement[];

@customElement('facet-list')
export class FacetList extends FacetContainer {
    public static get properties(): any {
        return {
            data: { type: Object },
        };
    }

    private _data: FacetListData = [];
    public set data(value: FacetListData) {
        const oldValue = this._data;
        this._data = value;
        this.requestUpdate('data', oldValue);
    }
    public get data(): FacetListData {
        return this._data;
    }

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

    private _renderContent(): TemplateResult {
        const result: TemplateResult[] = [];

        for (let i = 0, n = this.data.length; i < n; ++i) {
            const facet = this.data[i];
            if (this.templates.has(facet.type)) {
                // @ts-ignore
                result.push(this.templates.get(facet.type).getHTML(facet.data));
            } else {
                const type = facet.type.split('#')[0];
                result.push(preHTML`<${type} .data="${facet.data}"></${type}>`);
            }
        }
        return html`${result}`;
    }
}
