import { CustomEvents } from '../constants/custom-events.ts';
import type { AppConfig } from '../types/config.ts';

class SettingsPanel extends HTMLElement {
    connectedCallback() {
        document.addEventListener(CustomEvents.ConfigLoaded, (e: Event) => {
            const { config } = (e as CustomEvent).detail as { config: AppConfig };
            this.populateForm(config);
        }, { once: true });

        document.dispatchEvent(new CustomEvent(CustomEvents.ConfigRequest));

        this.querySelector('form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const notesLocation = (new FormData(e.target as HTMLFormElement).get('notesLocation') as string).trim();

            document.addEventListener(CustomEvents.ConfigLoaded, () => {
                const btn = this.querySelector<HTMLButtonElement>('[type="submit"]')!;
                btn.textContent = 'Saved!';
                setTimeout(() => { btn.textContent = 'Save'; }, 2000);
            }, { once: true });

            document.dispatchEvent(new CustomEvent(CustomEvents.ConfigUpdate, {
                detail: { update: { notesLocation } }
            }));
        });
    }

    private populateForm(config: AppConfig) {
        const input = this.querySelector<HTMLInputElement>('[name="notesLocation"]');
        if (input) input.value = config.notesLocation;
    }
}

if (!customElements.get('settings-panel')) {
    customElements.define('settings-panel', SettingsPanel);
}
