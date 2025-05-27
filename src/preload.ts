// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    createDirectory: (path: string, name: string) => ipcRenderer.invoke('create-directory', path, name),
    saveFile: (folder: string, filename: string, content: string) => ipcRenderer.invoke('save-file', folder, filename, content),
    readFile: (folder: string, filename: string) => ipcRenderer.invoke('read-file', folder, filename),
    listEntries: (folder: string) => ipcRenderer.invoke('list-entries', folder),
    getConfig: () => ipcRenderer.invoke('get-config'),
    updateConfig: (updates: any) => ipcRenderer.invoke('update-config', updates)
});

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector: string, text: string) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }
})
