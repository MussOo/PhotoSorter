const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Chemin vers preload.js
            contextIsolation: true, // Active contextIsolation
            enableRemoteModule: false, // Désactive les modules distants pour des raisons de sécurité
            nodeIntegration: false, // Désactive l'intégration Node.js dans le rendu
        },
    });

    mainWindow.loadFile('./src/index.html');
});
