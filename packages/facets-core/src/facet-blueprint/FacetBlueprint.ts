import {FacetElement} from '../facet-element/FacetElement';
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
        return html`
            ${this.computeStyle()}
            <div class="facet-blueprint">
                <div class="facet-blueprint-header">${this.renderHeaderRaw()}</div>
                <div class="facet-blueprint-body">
                    <div class="facet-blueprint-left">${this.renderLeftRaw()}</div>
                    <div class="facet-blueprint-content">${this.renderContentRaw()}</div>
                    <div class="facet-blueprint-right">${this.renderRightRaw()}</div>
                </div>
                <div class="facet-blueprint-footer">${this.renderFooterRaw()}</div>
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

    protected renderContentRaw(): TemplateResult {
        return html`<slot name="content">${this.renderContent()}</slot>`;
    }

    protected renderContent(): TemplateResult | void {
        return undefined;
    }

    protected renderHeaderRaw(): TemplateResult {
        return html`<slot name="header">${this.renderHeader()}</slot>`;
    }

    protected renderHeader(): TemplateResult | void {
        return undefined;
    }

    protected renderFooterRaw(): TemplateResult {
        return html`<slot name="footer">${this.renderFooter()}</slot>`;
    }

    protected renderFooter(): TemplateResult | void {
        return undefined;
    }

    protected renderLeftRaw(): TemplateResult {
        return html`<slot name="left">${this.renderLeft()}</slot>`;
    }

    protected renderLeft(): TemplateResult | void {
        return undefined;
    }

    protected renderRightRaw(): TemplateResult {
        return html`<slot name="right">${this.renderRight()}</slot>`;
    }

    protected renderRight(): TemplateResult | void {
        return undefined;
    }

    protected renderLayoutAdditions(): TemplateResult | void {
        return undefined;
    }
}
