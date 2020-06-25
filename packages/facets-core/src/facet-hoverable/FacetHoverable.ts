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

import {customElement, TemplateResult, html, CSSResult, css, unsafeCSS} from 'lit-element';
import {FacetBlueprint} from '../facet-blueprint/FacetBlueprint';
import {renderButtons} from '../tools/buttons';

// @ts-ignore
import buttonsStyle from '../tools/buttons.css';
// @ts-ignore
import facetHoverableStyle from './FacetHoverable.css';

@customElement('facet-hoverable')
export class FacetHoverable extends FacetBlueprint {
    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
        styles.push(css`
            ${unsafeCSS(buttonsStyle)}
            ${unsafeCSS(facetHoverableStyle)}
        `);
        return styles;
    }

    public static get properties(): any {
        return {
            actionButtons: { type: Number, attribute: 'action-buttons' },
        };
    }

    private _actionButtons: number = 2;
    public set actionButtons(value: number) {
        const oldValue = this._actionButtons;
        this._actionButtons = value;
        this.requestUpdate('actionButtons', oldValue);
    }
    public get actionButtons(): number {
        return this._actionButtons;
    }

    protected renderLayoutAdditions(): TemplateResult | void {
        return html`
        <div class="facet-hoverable-buttons"><slot name="buttons">
            ${renderButtons(this)}
        </slot></div>
        `;
    }

    public constructor() {
        super();
    }
}
