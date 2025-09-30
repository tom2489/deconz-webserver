import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fork } from 'child_process';
import http from 'http';
import getPort from 'get-port';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let backendProc = null;
let backendPort = null;

// Detect if GUI is available
const hasGui = !!process.env.DISPLAY || !!process.env.WAYLAND_DISPLAY;

// Wait until the backend is ready
function waitForServer(port, timeout = 15000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function check() {
      const req = http.get({ hostname: '127.0.0.1', port, path: '/_health', timeout: 2000 }, (res) => {
        if (res.statusCode === 200) resolve();
        else retry();
      });
      req.on('error', retry);
      req.on('timeout', () => { req.destroy(); retry(); });

      function retry() {
        if (Date.now() - start > timeout) return reject(new Error('Backend start timed out'));
        setTimeout(check, 200);
      }
    })();
  });
}

// Spawn backend
async function startBackend() {
  const port = await getPort({ port: 3000 }); // tries 3000 first

  const backendScript = app.isPackaged
    ? path.join(process.resourcesPath, 'backend', 'src', 'server.js') // packaged app
    : path.join(__dirname, '..', 'backend', 'src', 'server.js');      // dev

  backendProc = fork(backendScript, [], {
    env: { ...process.env, PORT: port, NODE_ENV: app.isPackaged ? 'production' : 'development' },
    cwd: path.dirname(backendScript),
    stdio: ['ignore', 'pipe', 'pipe', 'ipc']
  });

  backendProc.stdout?.on('data', d => console.log(`[backend] ${d}`));
  backendProc.stderr?.on('data', d => console.error(`[backend.err] ${d}`));

  backendProc.on('exit', (code, signal) => {
    console.warn('Backend exited', { code, signal });
    if (!app.isQuitting) app.quit();
  });

  await waitForServer(port);
  return port;
}

// Create Electron window (only if GUI exists)
async function createWindow(port) {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js') // if you have IPC
    }
  });

  await win.loadURL(`http://127.0.0.1:${port}`);
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    backendPort = await startBackend(); // start backend once
    if (hasGui) {
      console.log("GUI detected — launching Electron window");
      await createWindow(backendPort);
    } else {
      console.log("No GUI detected — running backend only");
      // backend keeps running; Electron process stays alive
    }
  } catch (err) {
    console.error('Failed to initialize app', err);
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (backendProc) {
    try { backendProc.kill(); } catch (e) { /* ignore */ }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (hasGui && BrowserWindow.getAllWindows().length === 0) createWindow(backendPort);
});
