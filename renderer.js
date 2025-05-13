/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

document.addEventListener('DOMContentLoaded', () => {
  const selectDirBtn = document.getElementById('select-dir-btn');
  const selectedDirElement = document.getElementById('selected-dir');
  const folderNameInput = document.getElementById('folder-name');
  const createDirBtn = document.getElementById('create-dir-btn');
  const createStatusElement = document.getElementById('create-status');

  // Load previously saved values
  const savedDirectory = localStorage.getItem('selectedDirectory');
  const savedFolderName = localStorage.getItem('folderName');

  if (savedDirectory) {
    selectedDirElement.textContent = savedDirectory;
    updateCreateButtonState();
  }
  if (savedFolderName) {
    folderNameInput.value = savedFolderName;
    updateCreateButtonState();
  }

  function updateCreateButtonState() {
    const hasPath = selectedDirElement.textContent !== 'No location selected';
    const hasName = folderNameInput.value.trim() !== '';
    createDirBtn.disabled = !(hasPath && hasName);
  }

  // Save folder name when it changes
  folderNameInput.addEventListener('input', () => {
    localStorage.setItem('folderName', folderNameInput.value);
    updateCreateButtonState();
  });

  selectDirBtn.addEventListener('click', async () => {
    try {
      const selectedPath = await window.api.selectDirectory();
      if (selectedPath) {
        selectedDirElement.textContent = selectedPath;
        localStorage.setItem('selectedDirectory', selectedPath);
        updateCreateButtonState();
      }
    } catch (err) {
      console.error('Error selecting directory:', err);
      selectedDirElement.textContent = 'Error selecting directory';
      updateCreateButtonState();
    }
  });

  createDirBtn.addEventListener('click', async () => {
    const basePath = selectedDirElement.textContent;
    const folderName = folderNameInput.value.trim();

    if (!basePath || !folderName) return;

    createDirBtn.disabled = true;
    createStatusElement.textContent = 'Creating folder...';
    createStatusElement.className = 'status-message';

    try {
      const newPath = await window.api.createDirectory(basePath, folderName);
      createStatusElement.textContent = `Successfully created folder at: ${newPath}`;
      createStatusElement.className = 'status-message success';
    } catch (err) {
      console.error('Error creating directory:', err);
      createStatusElement.textContent = `Error creating folder: ${err.message}`;
      createStatusElement.className = 'status-message error';
    } finally {
      updateCreateButtonState();
    }
  });
});
