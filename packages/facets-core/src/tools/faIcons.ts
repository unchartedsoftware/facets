import {IconDefinition} from '@fortawesome/fontawesome-common-types';
import {html, TemplateResult} from 'lit-element';

export function makeIconSVG(definition: IconDefinition, width: number, height: number, color?: string): TemplateResult {
    return html`<svg width="${width}" height="${height}" viewBox="0 0 ${definition.icon[0]} ${definition.icon[1]}" style="${color ? `fill:${color};` : ''}"><path d="${definition.icon[4]}"/></svg>`;
}
