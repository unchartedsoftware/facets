import {customElement} from 'lit-element';
import {FacetPlugin, FacetBars} from '@uncharted.software/facets-core';

@customElement('facet-plugin-bars-interactions')
export class BarsInteractions extends FacetPlugin {
    private facet: FacetBars|null = null;
    private boundHandler: (event: any) => void = this.handleEvent.bind(this);

    protected hostChanged(host: HTMLElement|null): void {
        if (host instanceof FacetBars) {
            this.facet = host;
            this.hookCallbacks();
        } else {
            this.unhookCallbacks();
            this.facet = null;
        }
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    private handleRangeChanged(event: CustomEvent): void {
        if (this.facet) {
            const highlight = [];
            if (event.detail.range[0] > 0 || event.detail.range[1] < this.facet.data.values.length) {
                for (let i = event.detail.range[0]; i < event.detail.range[1]; ++i) {
                    highlight.push(i);
                }
            }
            this.facet.highlight = highlight;
        }
    }

    private handleValueClicked(event: CustomEvent): void {
        if (this.facet) {
            this.facet.highlight = [event.detail.index];
            this.facet.range = [event.detail.index, event.detail.index + 1];
        }
    }

    private handleEvent(event: CustomEvent): void {
        switch (event.type) {
            case 'rangeChanged':
                this.handleRangeChanged(event);
                break;

            case 'valueClicked':
                this.handleValueClicked(event);
                break;

            default:
                break;
        }
    }

    private hookCallbacks(): void {
        if (this.facet) {
            this.facet.addEventListener('rangeChanged', this.boundHandler);
            this.facet.addEventListener('valueClicked', this.boundHandler);
        }
    }

    private unhookCallbacks(): void {
        if (this.facet) {
            this.facet.removeEventListener('rangeChanged', this.boundHandler);
            this.facet.removeEventListener('valueClicked', this.boundHandler);
        }
    }
}
