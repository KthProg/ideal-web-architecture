import { APP_NAME } from "../constants/app.ts";
import { CONFIG_KEY_ID, DEFAULT_APP_CONFIG, OBJECT_KEY_PATH, OBJECT_STORE_NAME } from "../constants/config.ts";
import { AppConfig } from "../types/config.ts"
import { IConfigService } from "./interfaces/config.ts";

export class ConfigService implements IConfigService {
    private _canPersist = false;
    private _database: IDBDatabase | null = null;

    constructor(private _config: AppConfig = DEFAULT_APP_CONFIG){}

    get config(): AppConfig {
        return this._config;
    }

    async initialize() {
        this._database = await new Promise((resolve, reject) => {
            const request = indexedDB.open(APP_NAME, 1);

            request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
                const db = (e.target as any as { result: IDBDatabase }).result;
                if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
                    db.createObjectStore(OBJECT_STORE_NAME, { keyPath: OBJECT_KEY_PATH });
                }
            };

            request.onsuccess = (e) => {
                if (!e.target) {
                    reject(new Error('Empty DB target on success'));
                    return;
                }
                resolve((e.target as any as { result: IDBDatabase }).result);
            };

            request.onerror = (e) => {
                reject(new Error((e.target as any as { error: string }).error));
            };
        });

        this._canPersist = await navigator.storage.persist();
        this._config = await this.readConfig();
    }

    async writeConfig() {
        return await new Promise<AppConfig>((resolve, reject) => {
            if(!this._database){
                reject(new Error('No database to read from'));
                return;
            }
            const tx = this._database.transaction(OBJECT_STORE_NAME, 'readwrite');
            const putReq = tx.objectStore(OBJECT_STORE_NAME).put({ id: CONFIG_KEY_ID, ...this._config });
            putReq.onsuccess = () => {
                resolve(this._config);
            };
            putReq.onerror = (e) => {
                reject(new Error((e.target as any as { error: string }).error));
            };
        });
    }

    async readConfig() {
        const configFromDatabase = await new Promise<AppConfig | undefined>((resolve, reject) => {
            if (!this._database) {
                reject(new Error('No database to read from'));
                return;
            }
            const readTx = this._database.transaction(OBJECT_STORE_NAME, 'readonly');
            const getReq = readTx.objectStore(OBJECT_STORE_NAME).get(CONFIG_KEY_ID);
            getReq.onsuccess = () => resolve(getReq.result);
            getReq.onerror = (e) => {
                reject(new Error((e.target as any as { error: string }).error));
            };
        });
        this._config = configFromDatabase ?? DEFAULT_APP_CONFIG;
        return this._config;
    }

    async updateConfig(configUpdate: Partial<AppConfig>) {
        Object.getOwnPropertyNames(configUpdate).forEach((propName: string) => {
            const appConfigPropName = propName as (keyof AppConfig);
            if(Object.hasOwn(this._config, appConfigPropName)){
                this._config[appConfigPropName] = configUpdate[appConfigPropName]!;
            }
        });
        return await this.writeConfig();
    }
}