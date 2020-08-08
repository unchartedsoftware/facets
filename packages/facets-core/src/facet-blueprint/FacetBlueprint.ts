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

import {FacetElement} from '../facet-element/FacetElement';
import {LitElement, CSSResult, TemplateResult, html, css, unsafeCSS, customElement} from 'lit-element';
// @ts-ignore
import FacetBlueprintStyle from './FacetBlueprint.css';

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
            ${this.cssOptions.supportsCSSVars ? undefined : this.computeStyle()}
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
