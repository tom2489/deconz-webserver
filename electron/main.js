import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect if GUI is available
const hasGui = !!process.env.DISPLAY || !!process.env.WAYLAND_DISPLAY;

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

  let indexPath;

  if (app.isPackaged) {
    const candidate = path.join(process.resourcesPath, 'backend', 'public', 'index.html');

    if (fs.existsSync(candidate)) {
      indexPath = candidate;
    } else {
      indexPath = path.join(__dirname, '..', 'backend', 'public', 'index.html');
    }

    await win.loadFile(indexPath);
  } else {
    await win.loadURL('http://localhost:3000');
  }
}

app.whenReady().then(async () => {
  if (hasGui) {
    console.log('GUI detected — launching Electron window');
    await createWindow();
  } else {
    console.log('No GUI detected — nothing to launch');
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (hasGui && BrowserWindow.getAllWindows().length === 0) createWindow();
});
