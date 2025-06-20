interface ElectronAPI {
    getConfig: () => Promise<Config>;
    selectDirectory: () => Promise<string | null>;
    createDirectory: (path: string, name: string) => Promise<boolean>;
    saveFile: (folder: string, filename: string, content: string) => Promise<boolean>;
    readFile: (folder: string, filename: string) => Promise<string>;
    listEntries: (folder: string) => Promise<FileEntry[]>;
    updateConfig: (updates: Config) => Promise<boolean>;
}

interface FileEntry {
    name: string;
    createdAt: string;
    modifiedAt: string;
    isReply?: boolean;
    parentFile?: string;
    replies?: FileEntry[];
}

declare global {
    interface Window {
        api: ElectronAPI;
    }
}

export { };
