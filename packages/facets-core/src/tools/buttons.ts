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

import {html, TemplateResult} from 'lit-element';

import {makeIconSVG} from './faIcons';
import {faEye} from '@fortawesome/free-solid-svg-icons/faEye';
import {faBan} from '@fortawesome/free-solid-svg-icons/faBan';
import {faQuestionCircle} from '@fortawesome/free-regular-svg-icons/faQuestionCircle';

export function renderButtonIcon(facet: any, index: number, total: number): TemplateResult {
    if (total > 1) {
        if (index === total - 2) {
            return makeIconSVG(faEye, 14, 14);
        } else if (index === total - 1) {
            return makeIconSVG(faBan, 12, 12);
        }
    }
    return makeIconSVG(faQuestionCircle, 12, 12, '#C9CACB');
}

function _generateButton(facet: any, className: string, index: number, total: number): TemplateResult {
    return html`
            <div class="facet-button ${className}">
                <slot name="button_${index}">
                    ${renderButtonIcon(facet, index, total)}
                </slot>
            </div>
        `;
}

export function renderButtons(facet: any): TemplateResult | void {
    const actionButtons: number = !isNaN(facet.actionButtons) ? facet.actionButtons : 2;
    if (actionButtons > 0) {
        const template = [];
        if (actionButtons === 1) {
            template.push(_generateButton(facet, 'facet-button-single', 0, 1));
        } else {
            let className = '';
            for (let i = 0, n = actionButtons; i < n; ++i) {
                if (i === 0) {
                    className = 'facet-button-left';
                } else if (i === n - 1) {
                    className = 'facet-button-right';
                } else {
                    className = '';
                }
                template.push(_generateButton(facet, className, i, n));
            }
        }

        return html`${template}`;
    }
    return undefined;
}
