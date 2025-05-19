const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    createDirectory: (path, name) => ipcRenderer.invoke('create-directory', path, name),
    saveFile: (folder, filename, content) => ipcRenderer.invoke('save-file', folder, filename, content),
    listEntries: (folder) => ipcRenderer.invoke('list-entries', folder),
    getConfig: () => ipcRenderer.invoke('get-config'),
    updateConfig: (updates) => ipcRenderer.invoke('update-config', updates)
  }
)

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
