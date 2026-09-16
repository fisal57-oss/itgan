const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    backupProject: () => ipcRenderer.invoke('backup-project'),
    exportData: (data) => ipcRenderer.invoke('export-data', data),
    exportForm: () => ipcRenderer.invoke('export-form'),
    importData: () => ipcRenderer.invoke('import-data'),
    openPath: (path) => ipcRenderer.send('open-path', path),
    syncDigitalForm: (rooms) => ipcRenderer.invoke('sync-digital-form', rooms),
    updateTitle: (title) => ipcRenderer.send('update-title', title),
    openExternal: (url) => ipcRenderer.send('open-external', url)
});
