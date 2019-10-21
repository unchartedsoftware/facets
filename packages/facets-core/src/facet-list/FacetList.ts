import {customElement, property, TemplateResult, html, LitElement} from 'lit-element';
import {preHTML} from '../tools/preHTML';
import {MutationWrapper} from '../tools/MutationWrapper';
import {FacetBlueprint} from '../facet-blueprint/FacetBlueprint';
import {FacetTemplate} from '../facet-template/FacetTemplate';

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

    private templates: {[id: string]: FacetTemplate} = {};
    private contentSlot: HTMLElement | null;
    private mutationObserver: MutationWrapper;

    public constructor() {
        super();
        this.contentSlot = null;
        this.mutationObserver = new MutationWrapper(this, false);
        this.mutationObserver.nodesAdded = this._processAddedNodes.bind(this);
        this.mutationObserver.nodesRemoved = this._processRemovedNodes.bind(this);
    }

    public connectedCallback(): void {
        super.connectedCallback();

        this.contentSlot = document.createElement('div');
        this.contentSlot.setAttribute('slot', 'content');
        this.appendChild(this.contentSlot);

        this.mutationObserver.start();
        this._processAddedNodes(this.childNodes);
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        this.mutationObserver.stop();
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

            if (this.templates.hasOwnProperty(facet.type)) {
                result.push(this.templates[facet.type].getHTML(facet.data));
            } else {
                const type = facet.type.split('#')[0];
                result.push(preHTML`<${type} .data="${facet.data}"></${type}>`);
            }
        }
        return html`${result}`;
    }

    private _processAddedNodes(nodes: NodeList): void {
        for (let i = 0, n = nodes.length; i < n; ++i) {
            if (nodes[i] instanceof FacetTemplate) {
                const child = nodes[i] as FacetTemplate;
                this.templates[child.target] = child;
                this.requestUpdate();
            } else if (this.contentSlot && nodes[i] instanceof Element && nodes[i] !== this.contentSlot) {
                const child = nodes[i] as Element;
                if (
                    child.hasAttribute('slot') &&
                    child.getAttribute('slot') === 'content' &&
                    this.contentSlot.parentElement === this
                ) {
                    this.contentSlot.parentElement.removeChild(this.contentSlot);
                    this.requestUpdate();
                }
            }
        }
    }

    private _processRemovedNodes(nodes: NodeList): void {
        for (let i = 0, n = nodes.length; i < n; ++i) {
            if (nodes[i] instanceof FacetTemplate && this.renderRoot.constructor.name === 'ShadowRoot') {
                const child = nodes[i] as FacetTemplate;
                delete this.templates[child.target];
                this.requestUpdate();
            } else if (nodes[i] === this.contentSlot) {
                this.contentSlot = null;
            }
        }
    }
}
