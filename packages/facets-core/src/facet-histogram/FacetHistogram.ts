import {css, CSSResult, customElement, unsafeCSS, html, TemplateResult} from 'lit-element';
import {FacetContainer} from '../facet-container/FacetContainer';
import {FacetHistogramValueData} from '../facet-histogram-value/FacetHistogramValue';

// @ts-ignore
import facetHistogramStyle from './FacetHistogram.css';

export interface FacetHistogramValueDataTyped extends FacetHistogramValueData {
    type?: string;
}

export interface FacetHistogramData {
    values: FacetHistogramValueDataTyped[];
    metadata?: any;
}

const kDefaultData: FacetHistogramData = { values: [] };

@customElement('facet-histogram')
export class FacetHistogram extends FacetContainer {
    public static get styles(): CSSResult[] {
        const styles = super.styles;
        styles.push(css`
            ${unsafeCSS(facetHistogramStyle)}
        `);
        return styles;
    }

    public static get properties(): any {
        return {
            data: { type: Object },
            actionButtons: { type: Number, attribute: 'action-buttons' },
        };
    }

    private _data: FacetHistogramData = kDefaultData;
    public set data(newData: FacetHistogramData) {
        const oldData = this._data;
        this.oldBucketCount = oldData.values.length;

        this.leftLabelAnimation = '';
        this.rightLabelAnimation = '';
        this.rangeLabelAnimation = '';

        const buckets: FacetHistogramValueDataTyped[] = newData.values;
        const leftLabel: string =
            buckets.length &&
            buckets[0].labels ?
                buckets[0].labels.left : (0).toString();
        const last: number = buckets.length ? buckets.length - 1 : 0;
        const rightLabel: string =
            buckets.length &&
            buckets[last].labels ?
                // @ts-ignore
                buckets[last].labels.right : (last).toString();
        const rangeLabel = `${leftLabel} - ${rightLabel}`;

        if (oldData !== kDefaultData) {
            let delay = 0;

            if (leftLabel !== this.leftLabel) {
                delay = 100;
                this.leftLabelAnimation = 'facet-histogram-text-out';
            }
            if (rightLabel !== this.rightLabel) {
                delay = 100;
                this.rightLabelAnimation = 'facet-histogram-text-out';
            }
            if (rangeLabel !== this.rangeLabelAnimation) {
                delay = 100;
                this.rangeLabelAnimation = 'facet-histogram-text-out';
            }

            this.requestUpdate();
            setTimeout((): void => {
                this._data = newData;
                this.leftLabel = leftLabel;
                this.rightLabel = rightLabel;
                this.rangeLabel = rangeLabel;

                if (this.leftLabelAnimation) {
                    this.leftLabelAnimation = 'facet-histogram-text-in';
                }
                if (this.rightLabelAnimation) {
                    this.rightLabelAnimation = 'facet-histogram-text-in';
                }
                if (this.rangeLabelAnimation) {
                    this.rangeLabelAnimation = 'facet-histogram-text-in';
                }

                this.requestUpdate('data', oldData);
            }, delay);
        } else {
            this._data = newData;
            this.leftLabel = leftLabel;
            this.rightLabel = rightLabel;
            this.rangeLabel = rangeLabel;
            this.oldBucketCount = newData.values.length;
            this.requestUpdate('data', oldData);
        }
    }
    public get data(): FacetHistogramData {
        return this._data;
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

    private oldBucketCount: number = 0;
    private leftLabel: string = '';
    private rightLabel: string = '';
    private rangeLabel: string = '';
    private leftLabelAnimation: string = '';
    private rightLabelAnimation: string = '';
    private rangeLabelAnimation: string = '';
    private facetHover: boolean = false;
    private facetHoverHandler: (event: MouseEvent) => void = (event: MouseEvent): void => {
        if (event.type === 'mouseenter' && !this.facetHover) {
            this.facetHover = true;
            this.requestUpdate();
        } else if (event.type === 'mouseleave' && this.facetHover) {
            this.facetHover = false;
            this.requestUpdate();
        }
    };

    public connectedCallback(): void {
        super.connectedCallback();

        this.renderRoot.addEventListener('animationend', (evt: Event): void => {
            const event: AnimationEvent = evt as AnimationEvent;
            if (event.animationName.indexOf('facet-histogram-bucket-') === 0) {
                this.oldBucketCount = this._data.values.length;
                this.requestUpdate();
            }
        });

        // this.addEventListener('mouseenter', this.facetHoverHandler);
        // this.addEventListener('mouseleave', this.facetHoverHandler);
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();

        // this.removeEventListener('mouseenter', this.facetHoverHandler);
        // this.removeEventListener('mouseleave', this.facetHoverHandler);
    }

    protected renderContent(): TemplateResult | void {
        return html`
        <div class="facet-histogram-container">
            <div class="facet-histogram-content">
                <div class="facet-histogram-buckets" @mouseenter="${this.facetHoverHandler}" @mouseleave="${this.facetHoverHandler}">${this._renderBuckets()}</div>
                <div class="facet-histogram-range">${this._renderRange()}</div>
                <div class="facet-histogram-labels">${this._renderLabels()}</div>
            </div>
        </div>
        `;
    }

    private _renderBuckets(): TemplateResult[] {
        const result: TemplateResult[] = [];
        const bucketCount = this.data.values.length;
        const oldBucketCount = this.oldBucketCount;

        let flexGrowClass = '';
        let data;

        for (let i = 0, n = Math.max(bucketCount, oldBucketCount); i < n; ++i) {
            if (i >= bucketCount) {
                data = { ratio: 0 };
                flexGrowClass = 'facet-histogram-bucket-collapse';
            } else {
                data = this.data.values[i];
                if (i >= oldBucketCount) {
                    flexGrowClass = 'facet-histogram-bucket-expand';
                }
            }

            result.push(html`
                <facet-histogram-value facet-hover="${this.facetHover}" class="facet-histogram-value ${flexGrowClass}" action-buttons="${this._actionButtons}" .data="${data}"></facet-histogram-value>
            `);
        }
        return result;
    }

    private _renderRange(): TemplateResult {
        return html`
            <div class="facet-histogram-range-bar-background"><div class="facet-histogram-range-bar"></div></div>
            <div class="facet-histogram-range-handle facet-histogram-range-handle-left"></div>
            <div class="facet-histogram-range-handle facet-histogram-range-handle-right"></div>
        `;
    }

    private _renderLabels(): TemplateResult {
        return html`
            <span class="facet-histogram-label-left ${this.leftLabelAnimation}">${this.leftLabel}</span>
            <span class="facet-histogram-label-center ${this.rightLabelAnimation}">${this.rangeLabel}</span>
            <span class="facet-histogram-label-right ${this.rangeLabelAnimation}">${this.rightLabel}</span>
        `;
    }
}

