import { CustomEvents } from '../constants/custom-events.ts';
import type { AppConfig } from '../types/config.ts';

class AppRoot extends HTMLElement {
    private currentConfig: AppConfig = { notesLocation: '' };

    async connectedCallback() {
        const res = await fetch('/config');
        this.currentConfig = await res.json();
        this.dispatchConfig();

        document.addEventListener(CustomEvents.ConfigRequest, () => this.dispatchConfig());

        document.addEventListener(CustomEvents.ConfigUpdate, async (e: Event) => {
            const { update } = (e as CustomEvent).detail as { update: Partial<AppConfig> };
            const res = await fetch('/config', {
                method: 'PUT',
                body: new URLSearchParams({ config: JSON.stringify(update) }),
            });
            this.currentConfig = await res.json();
            this.dispatchConfig();
        });
    }

    private dispatchConfig() {
        document.dispatchEvent(new CustomEvent(CustomEvents.ConfigLoaded, {
            detail: { config: this.currentConfig }
        }));
    }
}

if (!customElements.get('app-root')) {
    customElements.define('app-root', AppRoot);
}
