import { CustomEvents } from "../constants/custom-events.ts";
import { EditorMode } from "../constants/editor.ts";

class MarkdownEditorControls extends HTMLElement {
    private get _editorModeButton(): HTMLButtonElement | null {
        return this.getElementsByClassName('editor-controls__editor-mode-button')?.[0] as HTMLButtonElement ?? null;
    }

    private get _readingModeButton(): HTMLButtonElement | null {
        return this.getElementsByClassName('editor-controls__reading-mode-button')?.[0] as HTMLButtonElement ?? null;
    }

    render() {
        this._editorModeButton?.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent(CustomEvents.EditorModeChange, {
                bubbles: true,
                detail: { mode: EditorMode.Edit }
            }));
        });

        this._readingModeButton?.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent(CustomEvents.EditorModeChange, {
                bubbles: true,
                detail: { mode: EditorMode.ReadOnly }
            }));
        });
    }

    connectedCallback() {
        queueMicrotask(this.render.bind(this));
    }
}

if(!customElements.get('editor-controls')){
    customElements.define('editor-controls', MarkdownEditorControls, { extends: 'section' });
}