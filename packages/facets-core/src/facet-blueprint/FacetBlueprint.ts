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
                <div class="facet-blueprint-header"><slot name="header">${this.renderHeader()}</slot></div>
                <div class="facet-blueprint-body">
                    <div class="facet-blueprint-left"><slot name="left">${this.renderLeft()}</slot></div>
                    <div class="facet-blueprint-content"><slot name="content">${this.renderContent()}</slot></div>
                    <div class="facet-blueprint-right"><slot name="right">${this.renderRight()}</slot></div>
                </div>
                <div class="facet-blueprint-footer"><slot name="footer">${this.renderFooter()}</slot></div>
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
