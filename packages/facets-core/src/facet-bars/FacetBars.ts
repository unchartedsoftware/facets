import {customElement, TemplateResult, html, CSSResult, css, unsafeCSS} from 'lit-element';
import {FacetContainer} from '../facet-container/FacetContainer';
import {FacetBarsValueData} from '../facet-bars-value/FacetBarsValue';
import {FacetTemplate} from '../facet-template/FacetTemplate';
import {preHTML} from '../tools/preHTML';

// @ts-ignore
import facetBarsStyle from './FacetBars.css';

export interface FacetBarsValueDataTyped extends FacetBarsValueData {
    type?: string;
}

export interface FacetBarsData {
    values: FacetBarsValueDataTyped[];
    label?: string;
    metadata?: any;
}

const kDefaultData: FacetBarsData = { values: [] };

@customElement('facet-bars')
export class FacetBars extends FacetContainer {
    public static get styles(): CSSResult[] {
        const styles = super.styles;
        styles.push(css`
            ${unsafeCSS(facetBarsStyle)}
        `);
        return styles;
    }

    public static get properties(): any {
        return {
            data: { type: Object },
            actionButtons: { type: Number, attribute: 'action-buttons' },
            highlight: { type: Array},
            subselection: { type: Array },
        };
    }

    public highlight: number[] = [];
    public subselection: number[] = [];

    private _data: FacetBarsData = kDefaultData;
    public get data(): FacetBarsData {
        return this._data;
    }
    public set data(newData: FacetBarsData) {
        const oldData = this._data;
        this._data = newData;
        this.requestUpdate('data', oldData);
    }

    private _actionButtons: number = 2;
    public get actionButtons(): number {
        return this._actionButtons;
    }
    public set actionButtons(value: number) {
        const oldValue = this._actionButtons;
        this._actionButtons = value;
        this.requestUpdate('actionButtons', oldValue);
    }

    private facetValuesHover: boolean = false;

    public connectedCallback(): void {
        super.connectedCallback();
        const values = this.createSlottedElement('values');
        if (values) {
            values.setAttribute('id', 'facet-bars-values');
        }
    }

    protected renderHeaderLabel(): TemplateResult | void {
        return html`<span>${this._data.label}</span>`;
    }

    protected renderContent(): TemplateResult | void {
        return html`
        <div class="facet-bars-container">
            <div class="facet-bars-content">
                <div class="facet-bars-values" @mouseenter="${this._facetValuesHoverHandler}" @mouseleave="${this._facetValuesHoverHandler}"><slot name="values"></slot></div>
                <div class="facet-bars-range">${this._renderRange()}</div>
            </div>
        </div>
        `;
    }

    protected renderSlottedElements(): void {
        super.renderSlottedElements();
        const valuesSlot = this.slottedElements.get('values');
        if (valuesSlot) {
            const hovered = this.facetValuesHover.toString();
            const actionButtons = this._actionButtons.toString();
            const hasHighlight = this.highlight.length;
            const hasSubselection = this.subselection.length;
            const stringTemplate = html`${this.data.values.map((value: FacetBarsValueDataTyped, i: number): TemplateResult => {
                const state = hasHighlight ? (this.highlight.indexOf(i) !== -1 ? 'highlighted' : 'muted') : 'normal';
                const subselection = hasSubselection ? `${this.subselection[i]}` : 'false';
                const type = value.type || 'facet-bars-value';
                const template = this.templates.get(type);
                if (template) {
                    return template.getHTML(value, {
                        'facet-value-state': state,
                        'facet-hovered': hovered,
                        subselection,
                    });
                } else if (type !== 'facet-bars-value') {
                    return preHTML`
                    <${type} 
                        facet-value-state="${state}" 
                        facet-hovered="${hovered}" 
                        action-buttons="${actionButtons}" 
                        subselection="${subselection}"
                        .data="${value}">
                    </${type}>`;
                }
                return html`
                <facet-bars-value
                    facet-value-state="${state}"
                    facet-hovered="${hovered}" 
                    action-buttons="${actionButtons}"
                    subselection="${subselection}"
                    .data="${value}">
                </facet-bars-value>`;
            })}`;
            this.renderSlottedElement(stringTemplate, valuesSlot);
        }
    }

    protected setTemplateForTarget(target: string, template: FacetTemplate): void {
        super.setTemplateForTarget(target, template);
        template.addCustomAttribute('facet-value-state');
        template.addCustomAttribute('facet-hovered');
        template.addCustomAttribute('subselection');
    }

    private _renderRange(): TemplateResult {
        return html`
            <div class="facet-bars-range-bar-background"><div class="facet-bars-range-bar"></div></div>
            <div class="facet-bars-range-handle facet-bars-range-handle-left"></div>
            <div class="facet-bars-range-handle facet-bars-range-handle-right"></div>
        `;
    }

    private _facetValuesHoverHandler: (event: MouseEvent) => void = (event: MouseEvent): void => {
        if (event.type === 'mouseenter' && !this.facetValuesHover) {
            this.facetValuesHover = true;
            this.requestUpdate();
        } else if (event.type === 'mouseleave' && this.facetValuesHover) {
            this.facetValuesHover = false;
            this.requestUpdate();
        }
    };
}
