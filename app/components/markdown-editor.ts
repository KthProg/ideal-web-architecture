import { marked } from 'marked';
import { CustomEvents } from '../constants/custom-events.ts';
import { EditorMode } from '../constants/editor.ts';

class MarkdownEditor extends HTMLElement {
    static get observedAttributes() { return ['editable']; }

    private _markdown = '';
    private _connected = false;

    get editable() {
        return this.hasAttribute('editable');
    }

    connectedCallback() {
        this._markdown = this.innerHTML;
        this._connected = true;
        this.render();
    }

    attributeChangedCallback() {
        if (this._connected) this.render();
    }

    private async render() {
        // FUTURE: clean up event listeners
        document.addEventListener(CustomEvents.EditorModeChange, (evt: Event) => {
            const { mode } = (evt as CustomEvent).detail as { mode: EditorMode };
            if(mode === EditorMode.ReadOnly) {
                this.removeAttribute('editable');
            } else {
                this.setAttribute('editable', String(true));
            }
        });

        if (this.editable) {
            const textarea = document.createElement('textarea');
            textarea.value = this._markdown;
            textarea.addEventListener('input', () => {
                this._markdown = textarea.value;
            });
            textarea.addEventListener('blur', () => {
                this.dispatchEvent(new CustomEvent(CustomEvents.MdChange, {
                    bubbles: true,
                    detail: { content: this._markdown }
                }));
            });
            this.replaceChildren(textarea);
        } else {
            this.innerHTML = await marked(this._markdown);
        }
    }
}

if (!customElements.get('markdown-editor')) {
    customElements.define('markdown-editor', MarkdownEditor);
}
