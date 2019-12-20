import {customElement, LitElement} from 'lit-element';

@customElement('facet-plugin')
export class FacetPlugin extends LitElement {
    public static connectedEvent = 'facet-plugin-connected';
    public static disconnectedEvent = 'facet-plugin-disconnected';

    private _boundUpdateHandler: EventHandlerNonNull = this._updateHandler.bind(this);

    private _host: LitElement|null = null;
    public get host(): LitElement|null {
        return this._host;
    }
    public set host(value: LitElement|null) {
        if (value !== this._host) {
            if (this._host) {
                this._host.removeEventListener('facet-element-updated', this._boundUpdateHandler);
            }

            this._host = value;

            if (this._host) {
                this._host.addEventListener('facet-element-updated', this._boundUpdateHandler);
            }

            this.hostChanged(this._host);
            this.requestUpdate();
        }
    }

    public connectedCallback(): void {
        super.connectedCallback();
        // stupid IE11...
        const parent = this.parentElement;
        if (parent) {
            requestAnimationFrame((): void => {
                parent.dispatchEvent(new CustomEvent(FacetPlugin.connectedEvent, {
                    bubbles: true,
                    detail: {
                        plugin: this,
                    },
                }));
            });
        }
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        if (this.host) {
            this.host.dispatchEvent(new CustomEvent(FacetPlugin.disconnectedEvent, {
                bubbles: true,
                detail: {
                    plugin: this,
                },
            }));
        }
    }

    protected hostUpdated(changedProperties: Map<PropertyKey, unknown>): void { // eslint-disable-line
        // OVERRIDE
    }

    protected hostChanged(host: HTMLElement|null): void { // eslint-disable-line
        // OVERRIDE
    }

    private _updateHandler(event: Event): void {
        if (event.target === this._host && event instanceof CustomEvent) {
            this.hostUpdated(event.detail.changedProperties);
        }
    }
}
