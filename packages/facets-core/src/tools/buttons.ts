import {html, TemplateResult} from 'lit-element';
import {FacetBlueprint} from '../facet-blueprint/FacetBlueprint';

import {makeIconSVG} from './faIcons';
import {faEye} from '@fortawesome/free-solid-svg-icons/faEye';
import {faBan} from '@fortawesome/free-solid-svg-icons/faBan';
import {faQuestionCircle} from '@fortawesome/free-regular-svg-icons/faQuestionCircle';

function _generateButton(anyFacet: any, className: string, index: number, total: number): TemplateResult {
    return html`
            <div class="facet-button ${className}">
                <slot name="button_${index}">
                    ${anyFacet.hasOwnProperty('buttonIconRenderer') ? anyFacet.buttonIconRenderer(anyFacet, index, total) : ''}
                </slot>
            </div>
        `;
}

export function renderButtons(facet: FacetBlueprint): TemplateResult | void {
    const anyFacet: any = facet as any;
    const actionButtons: number = !isNaN(anyFacet.actionButtons) ? anyFacet.actionButtons : 2;
    if (actionButtons > 0) {
        const template = [];
        if (actionButtons === 1) {
            template.push(_generateButton(anyFacet,'facet-button-single', 0, 1));
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
                template.push(_generateButton(anyFacet, className, i, n));
            }
        }

        return html`${template}`;
    }
    return undefined;
}

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
