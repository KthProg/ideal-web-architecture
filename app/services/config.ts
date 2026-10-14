import path from 'path';
import { APP_CONFIG_FILE_NAME, DEFAULT_APP_CONFIG } from "../constants/config.ts";
import { AppConfig } from "../types/config.ts"
import { FileService } from "./file.ts";
import { IConfigService } from "./interfaces/config.ts";
import { IFileService } from "./interfaces/file.ts";

export class ConfigService implements IConfigService {
    constructor(public fileService: IFileService, private _config: AppConfig = DEFAULT_APP_CONFIG){}

    private get configPath() {
        return path.join(FileService.rootDir, APP_CONFIG_FILE_NAME);
    }

    get config(): AppConfig {
        return this._config;
    }

    async initialize() {
        const doesAppConfigExist = await this.fileService.checkFileExists(this.configPath);
        if(doesAppConfigExist){
            this._config = await this.readConfig();
        } else {
            await this.writeConfig();
        }
    }

    async writeConfig() {
        await this.fileService.writeFile(this.configPath, JSON.stringify(this._config, null, 2));
        return this._config = await this.readConfig();
    }

    async readConfig() {
        const configJson = await this.fileService.readTextContent(this.configPath);
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
