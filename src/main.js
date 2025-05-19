const electron = require('electron')
const { app, BrowserWindow, dialog, ipcMain } = electron
const path = require('path')
const fs = require('fs').promises
const { getConfig, updateConfig } = require('./utils/config')

function createWindow() {
  // Create the browser window.
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
    }
  })
  window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
}


// Handle directory selection and creation
if (electron.ipcMain) {
  electron.ipcMain.handle('get-config', async () => {
    return getConfig();
  });

  electron.ipcMain.handle('update-config', async (event, updates) => {
    return updateConfig(updates);
  });

  electron.ipcMain.handle('select-directory', async () => {
    const config = getConfig();
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    })
    if (!result.canceled && result.filePaths.length > 0) {
      const selectedPath = result.filePaths[0];
      await updateConfig({ defaultPath: selectedPath });
      return selectedPath
    }
    return null
  })

  electron.ipcMain.handle('save-file', async (event, folder, filename, content) => {
    try {
      const filePath = path.join(folder, filename);
      await fs.writeFile(filePath, content, 'utf8');
      return filePath;
    } catch (error) {
      throw new Error(`Failed to save file: ${error.message}`);
    }
  });

  electron.ipcMain.handle('create-directory', async (event, basePath, folderName) => {
    if (!basePath || !folderName) {
      throw new Error('Both path and folder name are required')
    }

    const fs = require('fs')
    const path = require('path')
    const targetPath = path.join(basePath, folderName)

    try {
      await fs.promises.mkdir(targetPath, { recursive: true })
      return targetPath
    } catch (error) {
      throw new Error(`Failed to create directory: ${error.message}`)
    }
  })

  electron.ipcMain.handle('list-entries', async (event, folder) => {
    try {
      const files = await fs.readdir(folder);
      const entries = [];

      for (const file of files) {
        if (file.endsWith('.txt')) {
          const filePath = path.join(folder, file);
          const content = await fs.readFile(filePath, 'utf8');
          entries.push({
            filename: file,
            content,
            timestamp: file.split('.')[0] // Remove .txt extension
          });
        }
      }

      // Sort entries by filename (which contains timestamp) in descending order
      entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      return entries;
    } catch (error) {
      throw new Error(`Failed to list entries: ${error.message}`);
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.