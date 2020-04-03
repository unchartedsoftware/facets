import {css, CSSResult, customElement, unsafeCSS, html, TemplateResult, LitElement} from 'lit-element';
import {FacetBlueprint} from '../facet-blueprint/FacetBlueprint';
import {MutationWrapper} from '../tools/MutationWrapper';

// @ts-ignore
import facetContainerStyle from './FacetContainer.css';

@customElement('facet-container')
export class FacetContainer extends FacetBlueprint {
    protected slottedElements: Map<string, HTMLElement> = new Map();
    private mutationObserver: MutationWrapper;

    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
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
        const label = this.renderHeaderLabel();
        if (label) {
            return html`
            <div class="facet-container-header">
                <slot name="header-label">
                    ${label}
                </slot>
            </div>
            `;
        }
        return undefined;
    }

    protected renderHeaderLabel(): TemplateResult | void {
        return undefined;
    }

    protected renderFooter(): TemplateResult | void {
        const label = this.renderFooterLabel();
        if (label) {
            return html`
            <div class="facet-container-footer">
                <slot name="footer-label">
                    ${label}
                </slot>
            </div>
            `;
        }
        return undefined;
    }

    protected renderFooterLabel(): TemplateResult | void {
        return undefined;
    }

    protected createSlottedElement(slot: string, type: string = 'div'): HTMLElement|void {
        if (this.slottedElements.has(slot)) {
            return this.slottedElements.get(slot);
        }

        const element: HTMLElement = document.createElement(type);
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
                if (child.hasAttribute('slot')) {
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
                if (child.hasAttribute('slot')) {
                    const slot = child.getAttribute('slot') as string;
                    if (child === this.slottedElements.get(slot)) {
                        this.slottedElements.delete(slot);
                    }
                }
            }
        }
    }
}
