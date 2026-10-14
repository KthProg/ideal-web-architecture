import { ConfigHelper } from '../helpers/config.ts';
import { CustomEvents, HtmxEvents } from '../constants/custom-events.ts';
import { NOTES_LOCATION_HEADER } from '../constants/http.ts';
import type { AppConfig } from '../types/config.ts';

const configHelper = new ConfigHelper();

document.addEventListener('DOMContentLoaded', async () => {
    await configHelper.initialize();

    const dispatchConfig = () => {
        document.dispatchEvent(new CustomEvent(CustomEvents.ConfigLoaded, {
            detail: { config: configHelper.config }
        }));
    };

    document.addEventListener(CustomEvents.ConfigRequest, dispatchConfig);

    document.addEventListener(CustomEvents.ConfigUpdate, async (e: Event) => {
        const { update } = (e as CustomEvent).detail as { update: Partial<AppConfig> };
        await configHelper.updateConfig(update);
        dispatchConfig();
    });

    document.body.addEventListener(HtmxEvents.BeforeRequest, (e: Event) => {
        const { notesLocation } = configHelper.config;
        if (notesLocation) {
            (e as CustomEvent).detail.headers[NOTES_LOCATION_HEADER] = notesLocation;
        }
    });
});
