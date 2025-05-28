import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.write');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

/**
 * Ensures the config directory and file exist
 */
function ensureConfigExists(): void {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    if (!fs.existsSync(CONFIG_FILE)) {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify({
            defaultPath: ''
        }, null, 2));
    }
}

/**
 * Gets the current configuration
 * @returns The configuration object
 */
export function getConfig(): { defaultPath: string, [key: string]: any } {
    ensureConfigExists();
    try {
        const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
        return JSON.parse(configData);
    } catch (error) {
        console.error('Error loading config:', error);
        return { defaultPath: '' };
    }
}

/**
 * Updates the configuration with new values
 * @param updates Object containing updates to apply to the config
 * @returns The updated configuration
 */
export function updateConfig(updates: { [key: string]: any }): { defaultPath: string, [key: string]: any } {
    ensureConfigExists();
    try {
        const currentConfig = getConfig();
        const newConfig = { ...currentConfig, ...updates };
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
        return newConfig;
    } catch (error) {
        console.error('Error updating config:', error);
        return getConfig();
    }
}