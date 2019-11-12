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

    public contentRenderer: FacetBlueprintRenderer = this.renderContent;
    public headerRenderer: FacetBlueprintRenderer = this.renderHeader;
    public footerRenderer: FacetBlueprintRenderer = this.renderFooter;
    public leftRenderer: FacetBlueprintRenderer = this.renderLeft;
    public rightRenderer: FacetBlueprintRenderer = this.renderRight;
    public layoutAdditionsRenderer: FacetBlueprintRenderer = this.renderLayoutAdditions;

    protected render(): TemplateResult | void {
        return html`
            ${this.computeStyle()}
            <div class="facet-blueprint">
                <div class="facet-blueprint-header"><slot name="header">${this.headerRenderer(this)}</slot></div>
                <div class="facet-blueprint-body">
                    <div class="facet-blueprint-left"><slot name="left">${this.leftRenderer(this)}</slot></div>
                    <div class="facet-blueprint-content"><slot name="content">${this.contentRenderer(this)}</slot></div>
                    <div class="facet-blueprint-right"><slot name="right">${this.rightRenderer(this)}</slot></div>
                </div>
                <div class="facet-blueprint-footer"><slot name="footer">${this.footerRenderer(this)}</slot></div>
                ${this.layoutAdditionsRenderer(this)}
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
