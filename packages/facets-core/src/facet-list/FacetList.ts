import {customElement, TemplateResult, html, LitElement} from 'lit-element';
import {preHTML} from '../tools/preHTML';
import {FacetBlueprint} from '../facet-blueprint/FacetBlueprint';

export interface FacetListDataElement {
    type: string;
    data: any;
}

export type FacetListData = FacetListDataElement[];

@customElement('facet-list')
export class FacetList extends FacetBlueprint {
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

    private contentSlot: HTMLElement | null;

    public constructor() {
        super();
        this.contentSlot = null;
    }

    public connectedCallback(): void {
        super.connectedCallback();

        this.contentSlot = document.createElement('div');
        this.contentSlot.setAttribute('slot', 'content');
        this.appendChild(this.contentSlot);
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
    }

    protected update(changedProperties: Map<PropertyKey, unknown>): void {
        super.update(changedProperties);
        this._renderContentSlot();
    }

    private _renderContentSlot(): void {
        if (this.contentSlot) {
            const templateResult = this._renderContent() as unknown;
            if (templateResult instanceof TemplateResult) {
                (this.constructor as typeof LitElement)
                    .render(
                        templateResult,
                        this.contentSlot,
                        {scopeName: this.localName, eventContext: this});
            }
        }
    }

    private _renderContent(): TemplateResult | void {
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
