import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (app.isPackaged) {
    const candidate = path.join(process.resourcesPath, 'frontend', 'dist', 'index.html');
    const indexPath = fs.existsSync(candidate)
      ? candidate
      : path.join(__dirname, '..', 'frontend', 'dist', 'index.html');

    console.log('[Production] Loading local HTML file:', indexPath);
    await win.loadFile(indexPath);
  } else {
    const devUrl = 'http://localhost:3000';
    console.log('[Development] Loading from dev server:', devUrl);
    await win.loadURL(devUrl);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
