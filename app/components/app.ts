import { CustomEvents } from '../constants/custom-events.ts';
import type { AppConfig } from '../types/config.ts';

let currentConfig: AppConfig = { notesLocation: '' };

document.addEventListener('DOMContentLoaded', async () => {
    const res = await fetch('/config');
    currentConfig = await res.json();

    const dispatchConfig = () => {
        document.dispatchEvent(new CustomEvent(CustomEvents.ConfigLoaded, {
            detail: { config: currentConfig }
        }));
    };

    dispatchConfig();

    document.addEventListener(CustomEvents.ConfigRequest, dispatchConfig);

    document.addEventListener(CustomEvents.ConfigUpdate, async (e: Event) => {
        const { update } = (e as CustomEvent).detail as { update: Partial<AppConfig> };
        const res = await fetch('/config', {
            method: 'PUT',
            body: new URLSearchParams({ config: JSON.stringify(update) }),
        });
        currentConfig = await res.json();
        dispatchConfig();
    });
});
