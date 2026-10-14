import { AppConfig } from "../types/config.ts";

export const DEFAULT_APP_CONFIG: AppConfig = {
    notesLocation: ''
}

export const OBJECT_STORE_NAME = 'config' as const;
export const OBJECT_KEY_PATH = 'id' as const;
export const CONFIG_KEY_ID = 'settings' as const;