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
const kRangeHandleLeft = 0;
const kRangeHandleRight = 1;

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
            range: { type: Array },
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
        this.range = this.range;
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

    private _range: number[] = [];
    public get range(): number[] {
        return [...this._range];
    }

    public set range(value: number[]) {
        const newRange = [
            value.length ? Math.max(value[0], 0) : 0,
            value.length >= 2 ? Math.min(value[1], this._data.values.length) : this._data.values.length,
        ];

        newRange[0] = Math.max(Math.min(newRange[0], newRange[1]), 0);
        newRange[1] = Math.min(Math.max(newRange[1], newRange[0]), this._data.values.length);

        const oldValue = this._range;
        if (newRange[0] !== this._range[0] || newRange[1] !== this._range[1]) {
            this._range = newRange;
        }
        this.requestUpdate('range', oldValue);
    }

    private facetValuesHover: boolean = false;
    private rangeHandleLeftMouseX: number|null = null;
    private rangeHandleRightMouseX: number|null = null;
    private rangeHandleEventDispatched: boolean = false;

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
        <div 
            class="facet-bars-container"
            @mouseup="${this._rangeMouseHandler}"
            @touchend="${this._rangeMouseHandler}"
            @mousemove="${this._rangeMouseHandler}"
            @touchmove="${this._rangeMouseHandler}"
            @mouseleave="${this._rangeMouseHandler}"
         >
            <div class="facet-bars-hover-tab"></div>
            <div class="facet-bars-content">
                <div 
                    class="facet-bars-values" 
                    @mouseenter="${this._facetValuesHoverHandler}" 
                    @mouseleave="${this._facetValuesHoverHandler}"
                 >
                    <slot name="values"></slot>
                </div>
                <div class="facet-bars-range">
                    ${this.renderRange()}
                </div>
                <div class="facet-bars-range-input-fix">
                    <div class="facet-bars-range-input">
                        ${this.renderRangeInput()}
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    protected renderFooter(): TemplateResult | void {
        return html`
        <div style="height: 16px"></div>
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

    protected renderRangeInput(): TemplateResult {
        const leftData = this._data.values[Math.min(this._range[0], this._data.values.length - 1)];
        const left = (
            leftData && leftData.range ?
                (this._range[0] < this._data.values.length ? leftData.range.min : leftData.range.max)
                : this._range[0]
        ).toString();
        const rightData = this._data.values[Math.max(this._range[1] - 1, 0)];
        const right = (
            rightData && rightData.range ?
                (this._range[1] > 0 ? rightData.range.max : rightData.range.min)
                : this._range[1]
        ).toString();

        let leftTemplate: TemplateResult;
        if (this._range[0] === 0) {
            leftTemplate = html`
            <input 
                type="text" 
                class="facet-bars-range-input-box facet-bars-range-input-box-solo" 
                value="${left}" 
                size="${left.length}"
            >
            `;
        } else {
            const leftMinData = this._data.values[0];
            const leftMin = (leftMinData && leftMinData.range ? leftMinData.range.min : 0).toString();
            leftTemplate = html`
            <input 
                type="text" 
                class="facet-bars-range-input-box facet-bars-range-input-box-left" 
                value="${leftMin}" 
                size="${leftMin.length}" 
                disabled
            >
            <input
                type="text" 
                class="facet-bars-range-input-box facet-bars-range-input-box-right" 
                value="${left}" 
                size="${left.length}" 
            >
            `;
        }

        let rightTemplate: TemplateResult;
        if (this._range[1] === this._data.values.length) {
            rightTemplate = html`
            <input 
                type="text" 
                class="facet-bars-range-input-box facet-bars-range-input-box-solo" 
                value="${right}" 
                size="${right.length}"
            >
            `;
        } else {
            const rightMinData = this._data.values[this._data.values.length - 1];
            const rightMin = (rightMinData && rightMinData.range ? rightMinData.range.max : this._data.values.length).toString();
            rightTemplate = html`
            <input 
                type="text" 
                class="facet-bars-range-input-box facet-bars-range-input-box-left" 
                value="${right}" 
                size="${right.length}"
            >
            <input 
                type="text" 
                class="facet-bars-range-input-box facet-bars-range-input-box-right" 
                value="${rightMin}" 
                size="${rightMin.length}" 
                disabled
            >
            `;
        }

        return html`
        <div class="facet-bars-range-input-left">${leftTemplate}</div>
        <div class="facet-bars-range-input-right">${rightTemplate}</div>
        `;
    }

    protected renderRange(): TemplateResult {
        const rangeStep = 100 / this.data.values.length;
        const left = (this._range[kRangeHandleLeft] * rangeStep).toFixed(2);
        const right = ((this.data.values.length - this._range[kRangeHandleRight]) * rangeStep).toFixed(2);
        return html`
            <div class="facet-bars-range-bar-background">
                <div 
                    class="facet-bars-range-bar" 
                    style="margin-left:calc(${left}% - 12px);margin-right:calc(${right}% - 12px);"
                >                
                </div>
            </div>
            <div class="facet-bars-range-handle-container">
                <div class="facet-bars-range-handle facet-bars-range-handle-left" 
                     style="left:${left}%"
                     @mousedown="${this._rangeMouseHandler}"
                     @touchstart="${this._rangeMouseHandler}"
                 >
                </div>
                <div class="facet-bars-range-handle facet-bars-range-handle-right"
                     style="right:${right}%"
                     @mousedown="${this._rangeMouseHandler}"
                     @touchstart="${this._rangeMouseHandler}"
                 >
                </div>
            </div>
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

    private _rangeMouseHandler(event: MouseEvent) {
        event.preventDefault();
        switch (event.type) {
            case 'mousedown':
            case 'touchstart': {
                this.rangeHandleEventDispatched = false;
                const element = event.currentTarget as Element;
                if (element.className.indexOf('facet-bars-range-handle-left') !== -1) {
                    this.rangeHandleLeftMouseX = event.pageX;
                    this.rangeHandleRightMouseX = null;
                } else if (element.className.indexOf('facet-bars-range-handle-right') !== -1) {
                    this.rangeHandleRightMouseX = event.pageX;
                    this.rangeHandleLeftMouseX = null;
                }
            }
                break;

            case 'mouseup':
            case 'touchend':
            case 'mouseleave':
                if (this.rangeHandleEventDispatched) {
                    this.rangeHandleEventDispatched = false;
                    this.dispatchEvent(new CustomEvent('rangeManipulationEnd', {
                        detail: {
                            range: this.range,
                        },
                    }));
                }
                this.rangeHandleLeftMouseX = null;
                this.rangeHandleRightMouseX = null;
                break;

            case 'mousemove':
            case 'touchmove': {
                const barsElement = this.renderRoot.querySelector('.facet-bars-values');
                if (barsElement) {
                    const rangeStep = barsElement.scrollWidth / (this.data.values.length + 1);
                    if (this.rangeHandleLeftMouseX !== null) {
                        event.preventDefault();
                        const distance = Math.round((event.pageX - this.rangeHandleLeftMouseX) / rangeStep);
                        const index = Math.min(Math.max(this._range[kRangeHandleLeft] + distance, 0), this._range[kRangeHandleRight]);
                        if (index !== this._range[kRangeHandleLeft]) {
                            this.range = [
                                index,
                                this._range[1],
                            ];
                            this.rangeHandleLeftMouseX += distance * rangeStep;
                            this._dispatchRangeChangedEvent();
                        }
                    } else if (this.rangeHandleRightMouseX !== null) {
                        event.preventDefault();
                        const distance = Math.round((event.pageX - this.rangeHandleRightMouseX) / rangeStep);
                        const index = Math.min(Math.max(this._range[kRangeHandleRight] + distance, this._range[kRangeHandleLeft]), this.data.values.length);
                        if (index !== this._range[kRangeHandleRight]) {
                            this.range = [
                                this._range[0],
                                index,
                            ];
                            this.rangeHandleRightMouseX += distance * rangeStep;
                            this._dispatchRangeChangedEvent();
                        }
                    }
                }
            }
                break;

            default:
                break;
        }
    }

    private _dispatchRangeChangedEvent() {
        if (!this.rangeHandleEventDispatched) {
            this.rangeHandleEventDispatched = true;
            this.dispatchEvent(new CustomEvent('rangeManipulationStart', {
                detail: {
                    range: this.range,
                },
            }));
        }
        this.dispatchEvent(new CustomEvent('rangeChanged', {
            detail: {
                range: this.range,
            },
        }));
    }
}
