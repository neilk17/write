interface ElectronAPI {
    getConfig: () => Promise<{ defaultPath?: string, [key: string]: any }>;
    selectDirectory: () => Promise<string | null>;
    createDirectory: (path: string, name: string) => Promise<boolean>;
    saveFile: (folder: string, filename: string, content: string) => Promise<boolean>;
    readFile: (folder: string, filename: string) => Promise<string>;
    listEntries: (folder: string) => Promise<FileEntry[]>;
    updateConfig: (updates: any) => Promise<boolean>;
}

interface FileEntry {
    name: string;
    modifiedTime: string;
}

declare global {
    interface Window {
        api: ElectronAPI;
    }
}

export { };
