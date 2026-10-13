import { marked } from 'marked';

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
        if (this.editable) {
            const textarea = document.createElement('textarea');
            textarea.value = this._markdown;
            textarea.addEventListener('input', () => {
                this._markdown = textarea.value;
            });
            textarea.addEventListener('blur', () => {
                this.dispatchEvent(new CustomEvent('md-change', {
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
