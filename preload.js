const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  updateList: () => document.dispatchEvent(new Event('clipboard-history')),
  chooseItem: (index) => {
    ipcRenderer.send('choose-item', index)
  },
  cleanClipboard: () => {
    ipcRenderer.send('clean-clipboard')
  },
  startForm: () => {
    ipcRenderer.send('start-form')
  }
});

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.send('get-clipboard-history');

  ipcRenderer.on('clipboard-history', (event, clipboardHistory) => {
    console.log('****',)
    const listElement = document.getElementById('clipboard-list');
    listElement.innerHTML = ''; // Limpiar la lista actual

    clipboardHistory.forEach((item) => {
      const listItem = document.createElement('li');
      // cut the text to 30 characters
      listItem.textContent = item.slice(0, 30)+'...';
      listElement.appendChild(listItem);
    });
    
    // call updateSelection in index.html
    document.dispatchEvent(new CustomEvent('clipboard-history'));

  });
});