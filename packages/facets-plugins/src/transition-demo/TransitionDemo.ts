import {css, CSSResult, customElement, html, TemplateResult, unsafeCSS} from 'lit-element';
import {FacetPlugin, FacetBars} from '@uncharted.software/facets-core';
import {FacetBarsData} from '@uncharted.software/facets-core/dist/types/facet-bars/FacetBars';

// @ts-ignore
import TransitionDemoStyle from './TransitionDemo.css';

@customElement('facet-plugin-transition-demo')
export class TransitionDemo extends FacetPlugin {
    public static get styles(): CSSResult[] {
        const styles = this.getSuperStyles();
        styles.push(css`
            ${unsafeCSS(TransitionDemoStyle)}
        `);
        return styles;
    }

    private facet: FacetBars|null = null;

    protected hostChanged(host: HTMLElement|null): void {
        if (host instanceof FacetBars) {
            this.facet = host;
            this.replaceData(10);
        } else {
            this.facet = null;
        }
    }

    protected render(): TemplateResult | void {
        return html`
        <div class="transition-demo-container">
            <div class="transition-demo-row">
                <div class="transition-demo-label">Default Transition</div>
                <div class="transition-demo-button" method="default" action="+" @click="${this.handleClick}">+</div>
                <div class="transition-demo-button" method="default" action="=" @click="${this.handleClick}">=</div>
                <div class="transition-demo-button" method="default" action="-" @click="${this.handleClick}">-</div>
            </div>
            <div class="transition-demo-row">
                <div class="transition-demo-label">Replace Data</div>
                <div class="transition-demo-button" method="replace" action="+" @click="${this.handleClick}">+</div>
                <div class="transition-demo-button" method="replace" action="=" @click="${this.handleClick}">=</div>
                <div class="transition-demo-button" method="replace" action="-" @click="${this.handleClick}">-</div>
            </div>
            <div class="transition-demo-row">
                <div class="transition-demo-label">Simple Zoom</div>
                <div class="transition-demo-button" method="zoom-simple" action="+" @click="${this.handleClick}">+</div>
                <div class="transition-demo-button" method="zoom-simple" action="-" @click="${this.handleClick}">-</div>
            </div>
            <div class="transition-demo-row">
                <div class="transition-demo-label">Zoom and Replace</div>
                <div class="transition-demo-button" method="zoom-in-replace" action="=" @click="${this.handleClick}">+</div>
                <div class="transition-demo-button" method="zoom-out-replace" action="=" @click="${this.handleClick}">-</div>
            </div>
        </div>
        `;
    }

    private replaceData(count: number): void {
        if (this.facet) {
            const newData: FacetBarsData = {
                label: 'facet-plugin-transition-demo',
                values: [],
            };

            for (let i = 0; i < count; ++i) {
                newData.values.push({ ratio: Math.random() });
            }

            this.facet.data = newData;
        }
    }

    private zoomData(oldData: FacetBarsData, count: number): void {
        if (this.facet) {
            const newData: FacetBarsData = {
                label: 'facet-plugin-transition-demo',
                values: [],
            };

            if (count > oldData.values.length) {
                const diff = count - oldData.values.length;
                const first = Math.ceil(diff * 0.5);
                const second = diff - first;

                for (let i = 0; i < first; ++i) {
                    newData.values.push({ ratio: Math.random() });
                }

                for (let i = 0; i < oldData.values.length; ++i) {
                    newData.values.push({ ratio: oldData.values[i].ratio });
                }

                for (let i = 0; i < second; ++i) {
                    newData.values.push({ ratio: Math.random() });
                }

                this.facet.data = newData;
            } else if (count < oldData.values.length) {
                const off = Math.ceil((oldData.values.length - count) * 0.5);
                for (let i = 0; i < count; ++i) {
                    newData.values.push({ ratio: oldData.values[off + i].ratio });
                }

                this.facet.data = newData;
            }
        }
    }

    private handleReplaceData(method: string, action: string): void {
        if (this.facet) {
            this.facet.updateMethod = method;
            if (action === '+') {
                this.replaceData(Math.min(this.facet.data.values.length + 2, 40));
            } else if (action === '-') {
                this.replaceData(Math.max(this.facet.data.values.length - 2, 2));
            } else if (action === '=') {
                this.replaceData(this.facet.data.values.length);
            }
        }
    }

    private handleClick(event: MouseEvent): void {
        if (this.facet) {
            const element = event.currentTarget as HTMLElement;
            const method = element.getAttribute('method') as string;
            const action = element.getAttribute('action') as string;

            switch (method) {
                case 'zoom-in-replace':
                    this.facet.range = [0, this.facet.data.values.length];
                    this.handleReplaceData(method, action);
                    break;

                case 'zoom-out-replace':
                    this.facet.range = [Math.ceil(this.facet.data.values.length * 0.5), Math.ceil(this.facet.data.values.length * 0.5)];
                    this.handleReplaceData(method, action);
                    break;

                case 'default':
                case 'replace':
                    this.handleReplaceData(method, action);
                    break;

                case 'zoom-simple':
                    this.facet.updateMethod = method;
                    if (action === '-') {
                        const newLength = Math.min(this.facet.data.values.length + 4, 40);
                        const diff = newLength - this.facet.data.values.length;
                        this.zoomData(this.facet.data, newLength);
                        if (diff > 0) {
                            const off = Math.ceil(diff * 0.5);
                            this.facet.range = [this.facet.range[0] + off, this.facet.range[1] + off];
                            this.facet.highlight = this.facet.highlight.map((i): number => i + off);
                        }
                    } else if (action === '+') {
                        const newLength = Math.max(this.facet.data.values.length - 4, 2);
                        const diff = this.facet.data.values.length - newLength;
                        if (diff > 0) {
                            const off = Math.ceil(diff * 0.5);
                            this.facet.range = [this.facet.range[0] - off, this.facet.range[1] - off];
                            this.facet.highlight = this.facet.highlight.map((i): number => i - off);
                        }
                        this.zoomData(this.facet.data, Math.max(this.facet.data.values.length - 4, 2));
                    }
                    break;

                default:
                    break;
            }
        }
    }
}
