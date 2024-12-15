const { contextBridge, ipcRenderer } = require('electron');

// Expose une API sécurisée au processus de rendu
contextBridge.exposeInMainWorld('myAPI', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    receive: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
});