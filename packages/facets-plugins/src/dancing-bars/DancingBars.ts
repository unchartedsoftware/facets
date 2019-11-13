import {FacetPlugin, FacetBars} from '@uncharted.software/facets-core';
import {customElement} from 'lit-element';
import {FacetBarsValueData} from '@uncharted.software/facets-core/dist/types/facet-bars-value/FacetBarsValue';
import {FacetBarsData} from '@uncharted.software/facets-core/dist/types/facet-bars/FacetBars';

@customElement('facet-plugin-dancing-bars')
export class DancingBars extends FacetPlugin {
    private facet: FacetBars|null = null;
    private intervalID: number = -1;

    protected hostChanged(host: HTMLElement|null): void {
        if (host instanceof FacetBars) {
            this.facet = host;
            this.intervalID = window.setInterval((): void => this.setNewData(), 500);
        } else {
            if (this.intervalID !== -1) {
                window.clearInterval(this.intervalID);
                this.intervalID = -1;
            }
            this.facet = null;
        }
    }

    private setNewData(): void {
        if (this.facet) {
            const oldData: FacetBarsData = this.facet.data;
            const newData: FacetBarsData = {
                label: oldData.label,
                values: [],
            };

            oldData.values.forEach((value: FacetBarsValueData): void => {
                newData.values.push(Object.assign({}, value, {
                    ratio: Math.min(Math.max(value.ratio + Math.random() * 0.3 - 0.15, 0), 1),
                }));
            });

            this.facet.data = newData;
        }
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }
}
