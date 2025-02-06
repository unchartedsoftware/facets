import { css, unsafeCSS, html, LitElement, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { basicSetup, EditorView } from 'codemirror';
import { html as langHtml } from '@codemirror/lang-html';
import { css as langCss } from '@codemirror/lang-css';
import { javascript as langJavascript } from '@codemirror/lang-javascript';


import { examples } from '../examples';
// @ts-ignore
import examplesStyle from './style.css?inline';

export class FacetExample extends LitElement {
    // @ts-ignore
    @property()
    example: string = '';

    private editorHTML: EditorView | null = null;
    private editorCSS: EditorView | null = null;
    private editorJS: EditorView | null = null;
    private preview: HTMLIFrameElement | null = null;

    static styles = css`
        ${unsafeCSS(examplesStyle)}
    `;

    constructor(exampleId: string) {
        super();
        this.example = exampleId;
    }

    render(): TemplateResult {
        return html`
            <div class="facet-example-container">
                <div class="facet-example-editor-container">
                    <div class="facet-example-editor-header">
                        <div
                            id="buttonHTML"
                            class="facet-example-editor-button facet-example-editor-button-selected"
                            @click=${(): void => this._handleEditorButton('HTML')}
                        >
                            HTML
                        </div>
                        <div
                            id="buttonCSS"
                            class="facet-example-editor-button"
                            @click=${(): void => this._handleEditorButton('CSS')}
                        >
                            CSS
                        </div>
                        <div
                            id="buttonJS"
                            class="facet-example-editor-button"
                            @click=${(): void => this._handleEditorButton('JS')}
                        >
                            JS
                        </div>
                        <div
                            class="facet-example-editor-button-run"
                            @click=${this._renderHTML}>
                            RUN
                        </div>
                    </div>
                    <div class="facet-example-editor-body">
                        <div id="editorHTML" class="facet-example-editor" style="visibility:visible"></div>
                        <div id="editorCSS" class="facet-example-editor" style="visibility:hidden"></div>
                        <div id="editorJS" class="facet-example-editor" style="visibility:hidden"></div>
                    </div>
                </div>
                <div id="preview" class="facet-example-preview">
                    <div class="facet-example-preview-header">
                        <select id="facet-example-select" class="facet-example-select" @change=${this._handleSelectChange}>
                            <option disabled value> -- example -- </option>
                            ${Object.keys(examples).map(example => html`<option>${example}</option>`)}
                            <option>empty</option>
                        </select>
                    </div>
                    <iframe id="preview-iframe" class="facet-example-preview-iframe"></iframe>
                </div>
            </div>
        `;
    }

    connectedCallback(): void {
        super.connectedCallback();
        window.addEventListener('keydown', this._handleKeyDown);
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        window.removeEventListener('keydown', this._handleKeyDown);
    }

    private _handleKeyDown = (event: KeyboardEvent): void => {
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            this._renderHTML();
        }
    };

    firstUpdated(): void {
        this._initializeEditors();
        this._updateSelect();
        this._renderHTML();
    }

    private _initializeEditors(): void {
        const example = examples[this.example] || { html: '', css: '', js: '' };

        const initEditor = (selector: string, lang: any, content: string): EditorView | null => {
            const container = this.renderRoot.querySelector(selector);
            if (!container) return null;

            return new EditorView({
                doc: content,
                extensions: [
                    basicSetup,
                    lang()
                ],
                parent: container
            });
        };

        this.editorHTML = initEditor('#editorHTML', langHtml, example.html);
        this.editorCSS = initEditor('#editorCSS', langCss, example.css);
        this.editorJS = initEditor('#editorJS', langJavascript, example.js);
        this.preview = this.renderRoot.querySelector('#preview-iframe');
    }

    private _updateSelect(): void {
        const select = this.renderRoot.querySelector('#facet-example-select') as HTMLSelectElement;
        if (select) {
            const selectedExample = Object.prototype.hasOwnProperty.call(examples, this.example) ? this.example : null;
            const exampleNames = Object.keys(examples);
            select.selectedIndex = selectedExample ? exampleNames.indexOf(selectedExample) + 1 : 0;
        }
    }

    private _getTemplateResult(): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <base target="_parent" />
                <link href="https://fonts.googleapis.com/css?family=IBM+Plex+Sans&display=swap" rel="stylesheet">
                <style>
                    ${this.editorCSS?.state.doc.toString()}
                </style>
            </head>
            <body>

                <script>
                    // Call the parent window's setup function
                    if (!window.facetsdocs) {
                        const script = document.createElement('script');
                        script.setAttribute('type', 'text/javascript');
                        script.setAttribute('src', 'dist/iife/index.js');

                        document.body.style.visibility = 'hidden';
                        script.addEventListener('load', function() {
                            setTimeout(function() {
                                document.body.style.visibility = 'visible';
                            }, 50);
                        });

                        document.head.appendChild(script);
                    }
                    (function() {
                        ${this.editorJS?.state.doc.toString()}
                    })();
                </script>
                ${this.editorHTML?.state.doc.toString()}
            </body>
            </html>
        `;
    }

    private _renderHTML(): void {
        if (this.preview?.contentDocument) {
            const templateResult = this._getTemplateResult();
            this.preview.contentDocument.open();
            this.preview.contentDocument.write(templateResult);
            this.preview.contentDocument.close();
        }
    }

    private _handleEditorButton(target: string): void {
        const options = ['HTML', 'CSS', 'JS'];
        options.forEach(option => {
            const button = this.renderRoot.querySelector(`#button${option}`) as Element;
            const editor = this.renderRoot.querySelector(`#editor${option}`) as HTMLElement;

            const isTarget = option === target;
            button.classList.toggle('facet-example-editor-button-selected', isTarget);
            editor.style.visibility = isTarget ? 'visible' : 'hidden';
        });
    }

    private _handleSelectChange(e: Event): void {
        const select = e.target as HTMLSelectElement;
        window.location.href = `${window.location.pathname}?ex=${select.options[select.selectedIndex].value}`;
    }
}

// Register the custom element if it hasn't been registered yet
if (!customElements.get('facet-example')) {
    customElements.define('facet-example', FacetExample);
}
