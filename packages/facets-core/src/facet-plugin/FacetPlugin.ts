import {customElement} from 'lit-element';
import {FacetElement} from '../facet-element/FacetElement';
import {FacetContainer} from '../facet-container/FacetContainer';

@customElement('facet-plugin')
export class FacetPlugin extends FacetElement {
    private _host: HTMLElement|null = null;
    public get host(): HTMLElement|null {
        return this._host;
    }
    public set host(value: HTMLElement|null) {
        if (value !== this._host) {
            this._host = value;
            this.hostChanged(this._host);
        }
    }

    public connectedCallback(): void {
        super.connectedCallback();
        if (this.parentElement instanceof FacetContainer) {
            this.host = this.parentElement;
        }
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        this.host = null;
    }

    protected hostChanged(host: HTMLElement|null): void {
        // OVERRIDE
    }
}
