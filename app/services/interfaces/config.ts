import { AppConfig } from "../../types/config.ts";

export interface IConfigService {
    get config(): AppConfig;
    initialize(): Promise<void>;
    writeConfig(): Promise<AppConfig>;
    readConfig(): Promise<AppConfig>;
    updateConfig(configUpdate: Partial<AppConfig>): Promise<AppConfig>;
}