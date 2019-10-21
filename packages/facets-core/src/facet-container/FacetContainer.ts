import {css, CSSResult, customElement, unsafeCSS, html, TemplateResult, LitElement} from 'lit-element';
import {FacetBlueprint} from '../facet-blueprint/FacetBlueprint';
import {FacetTemplate} from '../facet-template/FacetTemplate';
import {MutationWrapper} from '../tools/MutationWrapper';

// @ts-ignore
import facetContainerStyle from './FacetContainer.css';

@customElement('facet-container')
export class FacetContainer extends FacetBlueprint {
    private mutationObserver: MutationWrapper;
    protected templates: Map<string, FacetTemplate> = new Map();
    protected slottedElements: Map<string, HTMLDivElement> = new Map();

    public static get styles(): CSSResult[] {
        const styles = super.styles;
        styles.push(css`
            ${unsafeCSS(facetContainerStyle)}
        `);
        return styles;
    }

    public constructor() {
        super();
        this.mutationObserver = new MutationWrapper(this, false);
        this.mutationObserver.nodesAdded = this._processAddedNodes.bind(this);
        this.mutationObserver.nodesRemoved = this._processRemovedNodes.bind(this);
    }

    public connectedCallback(): void {
        super.connectedCallback();

        this.mutationObserver.start();
        this._processAddedNodes(this.childNodes);
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        this.mutationObserver.stop();
    }

    protected updated(_changedProperties: Map<PropertyKey, unknown>): void {
        super.updated(_changedProperties);
        this.renderSlottedElements();
    }

    protected renderHeader(): TemplateResult | void {
        return html`
        <div class="facet-container-header">
            <slot name="header-label">
                ${this.renderHeaderLabel()}
            </slot>
        </div>
        `;
    }

    protected renderHeaderLabel(): TemplateResult | void {
        return undefined;
    }

    protected createSlottedElement(slot: string): HTMLDivElement|void {
        if (this.slottedElements.has(slot)) {
            return this.slottedElements.get(slot);
        }

        const element: HTMLDivElement = document.createElement('div');
        element.setAttribute('slot', slot);
        this.appendChild(element);

        this.slottedElements.set(slot, element);
        this._processAddedNodes(this.childNodes);

        return this.slottedElements.get(slot);
    }

    protected renderSlottedElements(): void {
        // OVERRIDE
    }

    protected renderSlottedElement(template: TemplateResult, slotted: HTMLElement): void {
        (this.constructor as typeof LitElement)
            .render(
                template,
                slotted,
                {scopeName: this.localName, eventContext: this});
    }

    private _processAddedNodes(nodes: NodeList): void {
        for (let i = 0, n = nodes.length; i < n; ++i) {
            if (nodes[i] instanceof HTMLElement) {
                const child = nodes[i] as HTMLElement;
                if (child instanceof FacetTemplate) {
                    this.templates.set(child.target, child);
                    this.requestUpdate();
                } else if (child.hasAttribute('slot')) {
                    const slot = child.getAttribute('slot') as string;
                    const slotted = this.slottedElements.get(slot);
                    if (slotted && child !== slotted && slotted.parentElement === this) {
                        slotted.parentElement.removeChild(slotted);
                        this.requestUpdate();
                    }
                }
            }
        }
    }

    private _processRemovedNodes(nodes: NodeList): void {
        for (let i = 0, n = nodes.length; i < n; ++i) {
            if (nodes[i] instanceof HTMLElement) {
                const child = nodes[i] as HTMLElement;
                if (child instanceof FacetTemplate && this.renderRoot.constructor.name === 'ShadowRoot') {
                    this.templates.delete(child.target);
                    this.requestUpdate();
                } else if (child.hasAttribute('slot')) {
                    const slot = child.getAttribute('slot') as string;
                    if (child === this.slottedElements.get(slot)) {
                        this.slottedElements.delete(slot);
                    }
                }
            }
        }
    }
}
