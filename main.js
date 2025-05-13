// Modules to control application life and create native browser window
const electron = require('electron')
const { BrowserWindow, dialog, ipcMain } = electron
const path = require('path')

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
function initialize() {
  createWindow()
}

if (require('electron').app) {
  require('electron').app.on('ready', initialize)
}

if (electron.app) {
  electron.app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  electron.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') electron.app.quit()
  })
}

// Handle directory selection and creation
if (electron.ipcMain) {
  electron.ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    })
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0]
    }
    return null
  })

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
}
