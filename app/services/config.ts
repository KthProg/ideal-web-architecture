import { APP_CONFIG_FILE_NAME, DEFAULT_APP_CONFIG } from "../constants/config.ts";
import { AppConfig } from "../types/config.ts"
import { FileService } from "./file.ts";
import { IConfigService } from "./interfaces/config.ts";
import { IFileService } from "./interfaces/file.ts";

export class ConfigService implements IConfigService {
    constructor(public fileService: IFileService, private _config: AppConfig = DEFAULT_APP_CONFIG){}

    get config(): AppConfig {
        return this._config;
    }

    async initialize() {
        const doesAppConfigExist = await this.fileService.checkFileExists(APP_CONFIG_FILE_NAME);
        if(doesAppConfigExist){
            this._config = await this.readConfig();
        } else {
            // write default config if no config exists
            await this.writeConfig();
        }
    }

    async writeConfig() {
        await this.fileService.writeFile(APP_CONFIG_FILE_NAME, JSON.stringify(this._config, null, 2));
        return this._config = await this.readConfig();
    }

    async readConfig() {
        const configJson = await this.fileService.readTextContent(APP_CONFIG_FILE_NAME);
        try {
            return this._config = JSON.parse(configJson);
        } catch (ex) {
            console.error('Error parsing config from JSON file', ex);
            return this._config;
        }
    }

    async updateConfig(configUpdate: Partial<AppConfig>) {
        await this.readConfig();
        Object.getOwnPropertyNames(configUpdate).forEach((propName: string) => {
            const appConfigPropName = propName as (keyof AppConfig);
            if(Object.hasOwn(this._config, appConfigPropName)){
                this._config[appConfigPropName] = configUpdate[appConfigPropName]!;
            }
        });
        return await this.writeConfig();
    }
}