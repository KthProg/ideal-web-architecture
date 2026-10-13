class MarkdownEditor extends HTMLElement {
    constructor(){
        super();
    }

    onConnected () {
        console.log('markdown rendered', this.innerHTML);
    }
}

if(!customElements.get('markdown-editor')){
    customElements.define('markdown-editor', MarkdownEditor);
}