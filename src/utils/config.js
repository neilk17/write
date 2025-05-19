const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_DIR = path.join(os.homedir(), '.write');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function ensureConfigExists() {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(CONFIG_FILE)) {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify({
            defaultPath: ''
        }, null, 2));
    }
}

function getConfig() {
    ensureConfigExists();
    const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(configData);
}

function updateConfig(updates) {
    ensureConfigExists();
    const currentConfig = getConfig();
    const newConfig = { ...currentConfig, ...updates };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
    return newConfig;
}

module.exports = {
    getConfig,
    updateConfig
};
