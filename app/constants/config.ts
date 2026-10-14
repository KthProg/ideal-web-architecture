import { AppConfig } from "../types/config.ts";

export const DEFAULT_APP_CONFIG: AppConfig = {
    notesLocation: 'notes',
}

export const APP_CONFIG_FILE_NAME = 'config.json' as const;