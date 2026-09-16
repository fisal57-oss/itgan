const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 768,
        title: "إتقان | نظام إدارة الموارد والفعاليات",
        icon: path.join(__dirname, 'icon.png'), 
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            devTools: true 
        },
        backgroundColor: '#0f172a',
        show: false
    });

    Menu.setApplicationMenu(null);
    win.loadFile('index.html');

    win.once('ready-to-show', () => {
        win.maximize();
        win.show();
    });
}

// IPC Handlers for Backup & Data
ipcMain.handle('backup-project', async () => {
    return new Promise((resolve) => {
        const timestamp = new Date().toISOString().split('T')[0];
        const backupDir = path.join(__dirname, 'Backups');
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
        
        const zipName = `Itqan_Full_Backup_${timestamp}_${Date.now()}.zip`;
        const zipPath = path.join(backupDir, zipName);
        
        // PowerShell command to zip core files
        const cmd = `powershell -Command "Compress-Archive -Path '${path.join(__dirname, 'app.js')}', '${path.join(__dirname, 'index.html')}', '${path.join(__dirname, 'style.css')}', '${path.join(__dirname, 'main.js')}', '${path.join(__dirname, 'package.json')}', '${path.join(__dirname, 'assets')}' -DestinationPath '${zipPath}' -Force"`;
        
        exec(cmd, (error) => {
            if (error) {
                console.error(error);
                resolve({ success: false, error: error.message });
            } else {
                resolve({ success: true, path: zipPath, name: zipName });
            }
        });
    });
});

ipcMain.handle('export-data', async (event, data) => {
    const { filePath } = await dialog.showSaveDialog({
        title: 'تصدير بيانات نظام إتقان',
        defaultPath: path.join(app.getPath('downloads'), `Itqan_Data_Backup_${new Date().toISOString().split('T')[0]}.json`),
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (filePath) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf-8');
        return { success: true, path: filePath };
    }
    return { success: false };
});

ipcMain.handle('export-form', async () => {
    const { filePath } = await dialog.showSaveDialog({
        title: 'تصدير نموذج الحجز الرقمي (HTM)',
        defaultPath: path.join(app.getPath('downloads'), `Booking_Form_Digital.htm`),
        filters: [{ name: 'HTML Files', extensions: ['htm', 'html'] }]
    });

    if (filePath) {
        const sourcePath = path.join(__dirname, 'booking_form_digital.html');
        if (fs.existsSync(sourcePath)) {
            const content = fs.readFileSync(sourcePath, 'utf-8');
            fs.writeFileSync(filePath, content, 'utf-8');
            return { success: true, path: filePath };
        } else {
            return { success: false, error: 'المجلد المصدري غير موجود' };
        }
    }
    return { success: false };
});

ipcMain.handle('sync-digital-form', async (event, payload) => {
    try {
        const rooms = Array.isArray(payload) ? payload : (payload && payload.rooms ? payload.rooms : []);
        const locations = [
            path.join(__dirname, 'booking_form_digital.html'),
            path.join(__dirname, 'انجاز', 'booking_form_digital.html'),
            path.join(__dirname, 'dist', 'ItqanApp-win32-x64', 'resources', 'app', 'booking_form_digital.html')
        ];

        const roomsHtml = rooms.map(r => 
            `<label class="option-item">${r.name} <input type="checkbox" name="venue" value="${r.id}"></label>`
        ).join('\n                        ');

        const markerStart = '<!-- THE MAIN APP WILL INJECT ROOMS HERE -->';
        const markerEnd = '</div>';

        locations.forEach(sourcePath => {
            if (fs.existsSync(sourcePath)) {
                let content = fs.readFileSync(sourcePath, 'utf-8');
                const startIndex = content.indexOf(markerStart);
                if (startIndex !== -1) {
                    const endIndex = content.indexOf(markerEnd, startIndex + markerStart.length);
                    if (endIndex !== -1) {
                        const newContent = content.substring(0, startIndex + markerStart.length) + 
                                           '\n                        ' + roomsHtml + '\n                    ' + 
                                           content.substring(endIndex);
                        fs.writeFileSync(sourcePath, newContent, 'utf-8');
                    }
                }
            }
        });
        
        return { success: true };
    } catch (error) {
        console.error('Sync error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('import-data', async () => {
    const { filePaths } = await dialog.showOpenDialog({
        title: 'استيراد بيانات نظام إتقان',
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['openFile']
    });

    if (filePaths && filePaths.length > 0) {
        const content = fs.readFileSync(filePaths[0], 'utf-8');
        try {
            const data = JSON.parse(content);
            return { success: true, data };
        } catch (e) {
            return { success: false, error: 'ملف غير صالح' };
        }
    }
    return { success: false };
});

ipcMain.on('open-path', (event, targetPath) => {
    shell.showItemInFolder(targetPath);
});

ipcMain.on('update-title', (event, title) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.setTitle(title);
});

ipcMain.on('open-external', (event, url) => {
    shell.openExternal(url);
});

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
