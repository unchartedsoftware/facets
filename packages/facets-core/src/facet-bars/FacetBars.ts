import {customElement, TemplateResult, html, CSSResult, css, unsafeCSS} from 'lit-element';
import {FacetContainer} from '../facet-container/FacetContainer';
import {FacetBarsValue, FacetBarsValueData} from '../facet-bars-value/FacetBarsValue';
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
        const styles = this.getSuperStyles();
        styles.push(css`
            ${unsafeCSS(facetBarsStyle)}
        `);
        return styles;
    }

    public static get properties(): any {
        return {
            data: { type: Object },
            updateMethod: { type: String, attribute: 'update-method' },
            actionButtons: { type: Number, attribute: 'action-buttons' },
            highlight: { type: Array},
            subselection: { type: Array },
            range: { type: Array },
        };
    }

    public updateMethod: string = 'none';
    public highlight: number[] = [];
    public subselection: number[] = [];

    private _data: FacetBarsData = kDefaultData;
    public get data(): FacetBarsData {
        return this._data;
    }
    public set data(newData: FacetBarsData) {
        const oldData = this._data;
        this._data = newData;

        this.oldValues = this.values;
        this.values = this._data.values;

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
    private values: FacetBarsValueDataTyped[] = kDefaultData.values;
    private oldValues: FacetBarsValueDataTyped[] = kDefaultData.values;

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
        if (this._data.values.length) {
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
        return undefined;
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
            this.renderValuesSlot(valuesSlot);
        }
    }

    protected renderValuesSlot(slot: HTMLDivElement): void {
        const hovered = this.facetValuesHover.toString();
        const actionButtons = this._actionButtons.toString();
        const hasHighlight = Boolean(this.highlight.length);
        const hasSubselection = Boolean(this.subselection.length);

        const htmlTemplate: TemplateResult[] = [];
        const updateMethod = this.oldValues === kDefaultData.values || this.oldValues === this.values ? 'replace' : this.updateMethod;
        switch (updateMethod) {
            case 'zoom-simple':
                if (this.oldValues.length > this.values.length) {
                    const diff = this.oldValues.length - this.values.length;
                    // first half of extra old values: shrink
                    htmlTemplate.push(...this.getValuesHTML(
                        this.oldValues.slice(0, Math.ceil(diff * 0.5)),
                        hovered,
                        actionButtons,
                        null,
                        null,
                        'shrink',
                        hasHighlight ? 'muted' : null
                    ));
                    // new values: default
                    htmlTemplate.push(...this.getValuesHTML(
                        this.values,
                        hovered,
                        actionButtons,
                        hasHighlight ? 0 : null,
                        hasSubselection ? 0 : null,
                        'none'
                    ));
                    // second half of extra old values: shrink
                    htmlTemplate.push(...this.getValuesHTML(
                        this.oldValues.slice(Math.ceil(diff * 0.5) + this.values.length),
                        hovered,
                        actionButtons,
                        null,
                        null,
                        'shrink',
                        hasHighlight ? 'muted' : null
                    ));
                } else if (this.oldValues.length < this.values.length) {
                    const diff = this.values.length - this.oldValues.length;
                    // first half of extra new values: grow
                    htmlTemplate.push(...this.getValuesHTML(
                        this.values.slice(0, Math.ceil(diff * 0.5)),
                        hovered,
                        actionButtons,
                        hasHighlight ? 0 : null,
                        hasSubselection ? 0 : null,
                        'grow'
                    ));
                    // new values within old range: default
                    htmlTemplate.push(...this.getValuesHTML(
                        this.values.slice(Math.ceil(diff * 0.5), Math.ceil(diff * 0.5) + this.oldValues.length),
                        hovered,
                        actionButtons,
                        hasHighlight ? Math.ceil(diff * 0.5) : null,
                        hasSubselection ? Math.ceil(diff * 0.5) : null,
                        'none'
                    ));
                    // second half of extra new values: grow
                    htmlTemplate.push(...this.getValuesHTML(
                        this.values.slice(Math.ceil(diff * 0.5) + this.oldValues.length),
                        hovered,
                        actionButtons,
                        hasHighlight ? Math.ceil(diff * 0.5) + this.oldValues.length : null,
                        hasSubselection ? Math.ceil(diff * 0.5) + this.oldValues.length : null,
                        'grow'
                    ));
                } else {
                    // just update the values using the default transition
                    htmlTemplate.push(...this.getValuesHTML(
                        this.values,
                        hovered,
                        actionButtons,
                        hasHighlight ? 0 : null,
                        hasSubselection ? 0 : null
                    ));
                }
                break;

            case 'zoom-in-replace':
                // first half of old data: shrink
                htmlTemplate.push(...this.getValuesHTML(
                    this.oldValues.slice(0, Math.ceil(this.oldValues.length * 0.5)),
                    hovered,
                    actionButtons,
                    null,
                    null,
                    'shrink',
                    hasHighlight ? 'muted' : null
                ));
                // new data: grow
                htmlTemplate.push(...this.getValuesHTML(
                    this.values,
                    hovered,
                    actionButtons,
                    hasHighlight ? 0 : null,
                    hasSubselection ? 0 : null,
                    'grow'
                ));
                // second half of old data: shrink
                htmlTemplate.push(...this.getValuesHTML(
                    this.oldValues.slice(Math.ceil(this.oldValues.length * 0.5)),
                    hovered,
                    actionButtons,
                    null,
                    null,
                    'shrink',
                    hasHighlight ? 'muted' : null
                ));
                break;

            case 'zoom-out-replace':
                // first half of new data: grow
                htmlTemplate.push(...this.getValuesHTML(
                    this.values.slice(0, Math.ceil(this.values.length * 0.5)),
                    hovered,
                    actionButtons,
                    hasHighlight ? 0 : null,
                    hasSubselection ? 0 : null,
                    'grow'
                ));
                // old data: shrink
                htmlTemplate.push(...this.getValuesHTML(
                    this.oldValues,
                    hovered,
                    actionButtons,
                    null,
                    null,
                    'shrink',
                    hasHighlight ? 'muted' : null
                ));
                // second half of new data: shrink
                htmlTemplate.push(...this.getValuesHTML(
                    this.values.slice(Math.ceil(this.values.length * 0.5)),
                    hovered,
                    actionButtons,
                    hasHighlight ? Math.ceil(this.values.length * 0.5) : null,
                    hasSubselection ? Math.ceil(this.values.length * 0.5) : null,
                    'grow'
                ));
                break;

            case 'replace':
                // new data: none
                htmlTemplate.push(...this.getValuesHTML(
                    this.values,
                    hovered,
                    actionButtons,
                    hasHighlight ? 0 : null,
                    hasSubselection ? 0 : null,
                    'none'
                ));
                break;

            default:
                if (this.values.length > this.oldValues.length) {
                    // values within the current range: default
                    htmlTemplate.push(...this.getValuesHTML(
                        this.values.slice(0, this.oldValues.length),
                        hovered,
                        actionButtons,
                        hasHighlight ? 0 : null,
                        hasSubselection ? 0 : null
                    ));
                    // values higher than the existing range: grow
                    htmlTemplate.push(...this.getValuesHTML(
                        this.values.slice(this.oldValues.length),
                        hovered,
                        actionButtons,
                        hasHighlight ? this.oldValues.length : null,
                        hasSubselection ? this.oldValues.length : null,
                        'grow'
                    ));
                } else if (this.values.length < this.oldValues.length) {
                    // new data: default
                    htmlTemplate.push(...this.getValuesHTML(
                        this.values,
                        hovered,
                        actionButtons,
                        hasHighlight ? 0 : null,
                        hasSubselection ? 0 : null
                    ));
                    // old values outside of the new range: shrink
                    htmlTemplate.push(...this.getValuesHTML(
                        this.oldValues.slice(this.values.length),
                        hovered,
                        actionButtons,
                        null,
                        null,
                        'shrink',
                        hasHighlight ? 'muted' : null
                    ));
                } else {
                    // update the new data with default transition
                    htmlTemplate.push(...this.getValuesHTML(
                        this.values,
                        hovered,
                        actionButtons,
                        hasHighlight ? 0 : null,
                        hasSubselection ? 0 : null
                    ));
                }
                break;
        }

        this.renderSlottedElement(html`${htmlTemplate}`, slot);
        this.oldValues = this.values;
    }

    protected getValuesHTML(
        values: FacetBarsValueDataTyped[],
        hovered: string,
        actionButtons: string,
        highlightOffset: number|null,
        subselectionOffset: number|null,
        transition: string = 'default',
        overrideState: string|null = null
    ): TemplateResult[] {
        const result: TemplateResult[] = [];

        for (let i = 0, n = values.length; i < n; ++i) {
            const state = highlightOffset !== null ? (this.highlight.indexOf(i + highlightOffset) !== -1 ? 'highlighted' : 'muted') : 'normal'; // eslint-disable-line no-nested-ternary
            const subselection = subselectionOffset !== null ? `${this.subselection[i + subselectionOffset]}` : 'false';
            const type = values[i].type || 'facet-bars-value';
            const template = this.templates.get(type);

            if (template) {
                result.push(template.getHTML(values[i], {
                    'facet-value-state': overrideState !== null ? overrideState : state,
                    'facet-hovered': hovered,
                    subselection,
                    transition,
                    '@click': this._barMouseHandler,
                }));
            } else if (type !== 'facet-bars-value') {
                result.push(preHTML`
                <${type} 
                    facet-value-state="${overrideState !== null ? overrideState : state}" 
                    facet-hovered="${hovered}" 
                    action-buttons="${actionButtons}" 
                    subselection="${subselection}"
                    transition="${transition}"
                    @click="${this._barMouseHandler}"
                    .data="${values[i]}">
                </${type}>`);
            } else {
                result.push(html`
                <facet-bars-value
                    facet-value-state="${overrideState !== null ? overrideState : state}"
                    facet-hovered="${hovered}"
                    action-buttons="${actionButtons}"
                    subselection="${subselection}"
                    transition="${transition}"
                    @click="${this._barMouseHandler}"
                    .data="${values[i]}">
                </facet-bars-value>`);
            }
        }
        return result;
    }

    protected setTemplateForTarget(target: string, template: FacetTemplate): void {
        super.setTemplateForTarget(target, template);
        template.addCustomAttribute('facet-value-state');
        template.addCustomAttribute('facet-hovered');
        template.addCustomAttribute('subselection');
        template.addCustomAttribute('transition');
        template.addCustomAttribute('@click');
    }

    protected renderRangeInput(): TemplateResult {
        const leftData = this._data.values[Math.min(this._range[0], this._data.values.length - 1)];
        const leftRangeMin = leftData && leftData.range ? leftData.range.min : this._range[0];
        const leftRangeMax = leftData && leftData.range ? leftData.range.max : this._range[0];
        const left = (this._range[0] < this._data.values.length ? leftRangeMin : leftRangeMax).toString();
        const leftMinData = this._data.values[0];
        const leftMinValue = (leftMinData && leftMinData.range ? leftMinData.range.min : 0).toString();
        const leftMin = this._range[0] === 0 ? null : leftMinValue;

        const rightData = this._data.values[Math.max(this._range[1] - 1, 0)];
        const rightRangeMin = rightData && rightData.range ? rightData.range.min : this._range[1];
        const rightRangeMax = rightData && rightData.range ? rightData.range.max : this._range[1];
        const right = (this._range[1] > 0 ? rightRangeMax : rightRangeMin).toString();
        const rightMaxData = this._data.values[this._data.values.length - 1];
        const rightMaxValue = (rightMaxData && rightMaxData.range ? rightMaxData.range.max : this._data.values.length).toString();
        const rightMax = this._range[1] === this._data.values.length ? null : rightMaxValue;

        return this.getRangeInputHTML(leftMin, left, right, rightMax);
    }

    protected getRangeInputHTML(leftMin: string | null, left: string, right: string, rightMax: string | null): TemplateResult {
        return html`
        <div class="facet-bars-range-input-left">
            ${leftMin === null ? undefined : html`
            <input 
                type="text" 
                class="facet-bars-range-input-box facet-bars-range-input-box-left" 
                value="${leftMin}" 
                size="${leftMin.length}" 
                disabled
            >
            `}
            <input
                type="text"
                class="facet-bars-range-input-box ${leftMin === null ? 'facet-bars-range-input-box-solo' : 'facet-bars-range-input-box-right'}"
                value="${left}"
                size="${left.length}"
            >
        </div>
        <div class="facet-bars-range-input-right">
            <input
                type="text"
                class="facet-bars-range-input-box ${rightMax === null ? 'facet-bars-range-input-box-solo' : 'facet-bars-range-input-box-solo'}"
                value="${right}"
                size="${right.length}"
            >
            ${rightMax === null ? undefined : html`
            <input 
                type="text" 
                class="facet-bars-range-input-box facet-bars-range-input-box-right" 
                value="${rightMax}" 
                size="${rightMax.length}" 
                disabled
            >
            `}
        </div>
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

    private _facetValuesHoverHandler(event: MouseEvent): void {
        if (event.type === 'mouseenter' && !this.facetValuesHover) {
            this.facetValuesHover = true;
            this.requestUpdate();
        } else if (event.type === 'mouseleave' && this.facetValuesHover) {
            this.facetValuesHover = false;
            this.requestUpdate();
        }
    };

    private _barMouseHandler(event: MouseEvent): void {
        if (event.currentTarget instanceof FacetBarsValue) {
            event.preventDefault();
            const value = event.currentTarget.data;
            const index = this.values.indexOf(value);
            switch (event.type) {
                case 'click':
                    this.dispatchEvent(new CustomEvent('valueClicked', {
                        detail: {
                            value,
                            index,
                        },
                    }));
                    break;

                default:
                    break;
            }
        }
    }

    private _rangeMouseHandler(event: MouseEvent): void {
        switch (event.type) {
            case 'mousedown':
            case 'touchstart': {
                this.rangeHandleEventDispatched = false;
                const element = event.currentTarget as Element;
                if (element.className.indexOf('facet-bars-range-handle-left') !== -1) {
                    event.preventDefault();
                    this.rangeHandleLeftMouseX = event.pageX;
                    this.rangeHandleRightMouseX = null;
                } else if (element.className.indexOf('facet-bars-range-handle-right') !== -1) {
                    event.preventDefault();
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

    private _dispatchRangeChangedEvent(): void {
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
