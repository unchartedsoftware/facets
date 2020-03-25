// @ts-ignore
import CodeMirror from 'codemirror';
// @ts-ignore
import codeMirrorStyle from 'codemirror/lib/codemirror.css';
// @ts-ignore
import darculaStyle from 'codemirror/theme/darcula.css';
// @ts-ignore
import examplesStyle from './FacetExample.css';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/css/css';

import {customElement, LitElement, property, TemplateResult, html, CSSResult, css, unsafeCSS} from 'lit-element';
import {examples} from '../examples';

// @ts-ignore
@customElement('facet-example')
export class FacetExample extends LitElement {
    @property({ type: Object })
    public example: string = '';

    private editorHTML: CodeMirror | null = null;
    private editorCSS: CodeMirror | null = null;
    private editorJS: CodeMirror | null = null;
    private preview: HTMLIFrameElement | null = null;
    private iframeInitialized: boolean = false;

    public static get styles(): CSSResult {
        return css`
        ${unsafeCSS(codeMirrorStyle)}
        ${unsafeCSS(darculaStyle)}
        ${unsafeCSS(examplesStyle)}
        `;
    }

    public constructor(example: string) {
        super();
        this.example = example;
    }

    protected render(): TemplateResult | void {
        return html`
        <div class="facet-example-container">
            <div class="facet-example-editor-container">
                <div class="facet-example-editor-header">
                    <div id="buttonHTML" class="facet-example-editor-button facet-example-editor-button-selected" @click="${this._handleEditorButton.bind(this, 'HTML')}">HTML</div>
                    <div id="buttonCSS" class="facet-example-editor-button" @click="${this._handleEditorButton.bind(this, 'CSS')}">CSS</div>
                    <div id="buttonJS" class="facet-example-editor-button" @click="${this._handleEditorButton.bind(this, 'JS')}">JS</div>
                    <div class="facet-example-editor-button-run" @click="${this._renderHTML}">RUN</div>
                </div>
                <div class="facet-example-editor-body">
                    <div id="editorHTML" class="facet-example-editor" style="visibility:visible"></div>
                    <div id="editorCSS" class="facet-example-editor" style="visibility:hidden"></div>
                    <div id="editorJS" class="facet-example-editor" style="visibility:hidden"></div>
                </div>
            </div>
            <div id="preview" class="facet-example-preview">
                <div class="facet-example-preview-header">
                    <select id="facet-example-select" class="facet-example-select" @change="${this._handleSelectChange}">
                        <option disabled value> -- example -- </option>
                        ${Object.keys(examples).map((example: string): TemplateResult => html`<option>${example}</option>`)}
                        <option>empty</option>
                    </select>
                </div>
                <iframe id="preview-iframe" class="facet-example-preview-iframe"></iframe>
            </div>
        </div>
        `;
    }

    protected firstUpdated(_changedProperties: Map<PropertyKey, unknown>): void {
        super.firstUpdated(_changedProperties);
        window.addEventListener('keydown', (event): void => {
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                this._renderHTML();
            }
        });
    }

    protected updated(_changedProperties: Map<PropertyKey, unknown>): void {
        super.update(_changedProperties);
        const example = (examples as any)[this.example];
        if (!this.editorHTML) {
            const editorElement = this.renderRoot.querySelector('#editorHTML');
            this.editorHTML = new CodeMirror(editorElement, {
                mode: 'htmlmixed',
                theme: 'darcula',
                value: example ? example.html : '',
                lineNumbers: true,
            });
            this.editorHTML.setSize('100%', '100%');
        }

        if (!this.editorCSS) {
            const editorElement = this.renderRoot.querySelector('#editorCSS');
            this.editorCSS = new CodeMirror(editorElement, {
                mode: 'css',
                theme: 'darcula',
                value: example ? example.css : '',
                lineNumbers: true,
            });
            this.editorCSS.setSize('100%', '100%');
        }

        if (!this.editorJS) {
            const editorElement = this.renderRoot.querySelector('#editorJS');
            this.editorJS = new CodeMirror(editorElement, {
                mode: 'javascript',
                theme: 'darcula',
                value: example ? example.js : '',
                lineNumbers: true,
            });
            this.editorJS.setSize('100%', '100%');
        }

        if (!this.preview) {
            this.preview = this.renderRoot.querySelector('#preview-iframe');
        }

        const select = this.renderRoot.querySelector('#facet-example-select') as HTMLSelectElement;
        if (select) {
            const selectedExample = examples.hasOwnProperty(this.example) ? this.example : null;
            const exampleNames = Object.keys(examples);
            const selectedIndex = selectedExample ? exampleNames.indexOf(selectedExample) + 1 : 0;
            select.selectedIndex = selectedIndex;
        }

        this._renderHTML();
    }

    private _getTemplateResult(): string {
        const template = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<base target="_parent" />
<link href="https://fonts.googleapis.com/css?family=IBM+Plex+Sans&display=swap" rel="stylesheet">
<style>
${this.editorCSS.getValue()}
</style>
</head>
<body>
<script>
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
</script>
${this.editorHTML.getValue()}
<script>
(function() {
    ${this.editorJS.getValue()}
})();
</script>
</body>
</html>
        `;
        this.iframeInitialized = true;
        return template;
    }

    private _renderHTML(): void {
        if (this.preview && this.preview.contentDocument) {
            const templateResult = this._getTemplateResult();
            this.preview.contentDocument.open();
            this.preview.contentDocument.write(templateResult);
            this.preview.contentDocument.close();
        }
    }

    private _handleEditorButton(target: string): void {
        const options = [
            'HTML',
            'CSS',
            'JS',
        ];

        for (let i = 0, n = options.length; i < n; ++i) {
            const button = this.renderRoot.querySelector(`#button${options[i]}`) as Element;
            const editor = this.renderRoot.querySelector(`#editor${options[i]}`) as Element;

            if (options[i] === target) {
                button.setAttribute('class', 'facet-example-editor-button facet-example-editor-button-selected');
                editor.setAttribute('style', 'visibility:visible');
            } else {
                button.setAttribute('class', 'facet-example-editor-button');
                editor.setAttribute('style', 'visibility:hidden');
            }
        }
    }

    private _handleSelectChange(e: Event): void {
        const select = e.target as HTMLSelectElement;
        window.location.href = `${window.location.pathname}?ex=${select.options[select.selectedIndex].value}`;
    }
}
