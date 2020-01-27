import {FacetElement} from '../facet-element/FacetElement';
import {polyMatches} from '../tools/PolyMatches';
import {LitElement, CSSResult, TemplateResult, html, css, unsafeCSS, customElement} from 'lit-element';
// @ts-ignore
import FacetBlueprintStyle from './FacetBlueprint.css';

export type FacetBlueprintRenderer = (blueprint?: FacetBlueprint) => TemplateResult | void;

@customElement('facet-blueprint')
export class FacetBlueprint extends FacetElement {
    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
        styles.push(css`${unsafeCSS(FacetBlueprintStyle)}`);
        return styles;
    }

    protected render(): TemplateResult | void {
        const children = this.children;
        const slots = new Set(); // could it be optimized with member variable? is it worth the optimization?
        let slot: string | null;
        for (let i = 0, n = children.length; i < n; ++i) {
            slot = children[i].getAttribute('slot');
            if (slot) {
                slots.add(slot);
            }
        }

        return html`
            ${this.computeStyle()}
            <div class="facet-blueprint">
                <div class="facet-blueprint-header">
                    ${slots.has('header') ? html`<slot name="header"></slot>` : this.renderHeader()}
                </div>
                <div class="facet-blueprint-body">
                    <div class="facet-blueprint-left">
                        ${slots.has('left') ? html`<slot name="left"></slot>` : this.renderLeft()}
                    </div>
                    <div class="facet-blueprint-content">
                        ${slots.has('content') ? html`<slot name="content"></slot>` : this.renderContent()}
                    </div>
                    <div class="facet-blueprint-right">
                        ${slots.has('right') ? html`<slot name="right"></slot>` : this.renderRight()}
                    </div>
                </div>
                <div class="facet-blueprint-footer">
                    ${slots.has('footer') ? html`<slot name="footer"></slot>` : this.renderFooter()}
                </div>
                ${this.renderLayoutAdditions()}
            </div>
        `;
    }

    protected update(changedProperties: Map<PropertyKey, unknown>): void {
        if (this.renderRoot !== this) {
            const templateResult = this.renderLightDOM() as unknown;
            if (templateResult instanceof TemplateResult) {
                (this.constructor as typeof LitElement)
                    .render(
                        templateResult,
                        this,
                        {scopeName: this.localName, eventContext: this});
            }
        }
        super.update(changedProperties);
    }

    protected renderLightDOM(): TemplateResult | void {
        return undefined;
    }

    protected renderContent(): TemplateResult | void {
        return undefined;
    }

    protected renderHeader(): TemplateResult | void {
        return undefined;
    }

    protected renderFooter(): TemplateResult | void {
        return undefined;
    }

    protected renderLeft(): TemplateResult | void {
        return undefined;
    }

    protected renderRight(): TemplateResult | void {
        return undefined;
    }

    protected renderLayoutAdditions(): TemplateResult | void {
        return undefined;
    }
}
