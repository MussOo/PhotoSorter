const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Ajoute ici les fonctionnalités si nécessaire
});
