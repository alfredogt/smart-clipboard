const { app, BrowserWindow, ipcMain, globalShortcut, screen, clipboard } = require('electron');
const path = require('path');


let win;
let generalHeight = 100;
let generalWidth = 320;
let maxItems = 6;
let clipboardHistory = [];
let isInternalClipboardChange = false;
let textToPaste = '';
let modesAvailables = ['normal','form'];
let activeMode = 0

function createWindow() {
  win = new BrowserWindow({
    width: generalWidth,  // Ancho fijo
    height: generalHeight, // Altura inicial
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    show: true,
    hide: false,
    contextIsolation: false,
    focusable: false,
    alwaysOnTop: true,  // Siempre encima
    frame: false,       // Sin bordes
    transparent: true,  // Fondo transparente
    skipTaskbar: true,
    type: 'panel',
    acceptFirstMouse: true,
  });

  win.loadFile('index.html');

  // repositionWindow()

  // win.setIgnoreMouseEvents(true, { forward: true });

  // win.webContents.openDevTools();

}

function repositionWindow(){
  const cursorPos = screen.getCursorScreenPoint(); // Obtener la posición del cursor
  const currentScreen = screen.getDisplayNearestPoint(cursorPos); // Obtener la pantalla más cercana al cursor

  const x = currentScreen.workArea.x + (currentScreen.workArea.width - generalWidth) / 2;
  const y = currentScreen.workArea.y + (currentScreen.workArea.height - generalHeight) / 2;

  win.setBounds({ x, y, width: generalWidth, height: generalHeight }); // Mover la ventana al centro de la pantalla activa

  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true }); 

  if (!win.isVisible() && !win.isDestroyed() && !win.isMinimized() && clipboardHistory.length > 0) {
    win.show();
    win.focus(); // enfocar la ventana en la pantalla activa
    registerEscapeShortcut();
  }else{
    // win.focus();
  }
}

app.whenReady().then(() => {
    globalShortcut.register('CommandOrControl+Shift+V', () => {
      repositionWindow();
    });

    if (process.platform === 'darwin') {
        app.dock.hide(); // Ocultar el icono del Dock
    }

  // setInterval(checkClipboard, 100);
  setInterval(checkClipboard, 1000);

  createWindow();

  registerEscapeShortcut();

  ipcMain.on('get-clipboard-history', (event) => {
    // Enviar el historial de clipboard cuando se solicite desde el renderer
    event.sender.send('clipboard-history', clipboardHistory);
  });

  ipcMain.on('clean-clipboard', (event) => {
    clipboardHistory = [];
    event.sender.send('clipboard-history', clipboardHistory);
    win.hide();
  });

  ipcMain.on('choose-item', (event, index) => {

    if (index >= 0 && index < clipboardHistory.length) {
      const selectedText = clipboardHistory[index];
      textToPaste = selectedText;

      isInternalClipboardChange = true;

      clipboard.writeText(selectedText);

      setTimeout(() => {
        // Simular la pulsación de teclas Ctrl+V (o Cmd+V en macOS)
        // const modifier = process.platform === 'darwin' ? 'command' : 'control';
        // robot.keyTap('v', modifier);
        
        // Resetear la bandera inmediatamente después de la operación
        isInternalClipboardChange = false;
      }, 1000);
    }
  });

  ipcMain.on('start-form', (event) =>{
    activeMode = 1;
  })

});

function updateWindowHeight(listSize) {
  const itemHeight = 45; // Altura aproximada de cada elemento
  const newHeight = itemHeight * listSize + 45; // Ajustar según el número de elementos y algo de padding
  generalHeight = newHeight;
  win.setSize(generalWidth, newHeight);
}

function registerEscapeShortcut() {
  globalShortcut.register('Escape', () => {
    win.hide();
    unregisterEscapeShortcut();
  });
}

function unregisterEscapeShortcut() {
  globalShortcut.unregister('Escape');
}

// Función para verificar si hay nuevos elementos en el portapapeles
function checkClipboard() {
  if(isInternalClipboardChange) return;

  const currentText = clipboard.readText(); // Leer el contenido actual del portapapeles

  // Verificar si el contenido del portapapeles es nuevo
  if (currentText && (clipboardHistory.length === 0 || clipboardHistory[0] !== currentText) && textToPaste !== currentText) {
      // Insertar el nuevo contenido al inicio de la lista
      clipboardHistory.unshift(currentText);

      // Limitar la lista a los últimos 5 elementos
      if (clipboardHistory.length > maxItems) {
          clipboardHistory.pop(); // Eliminar el elemento más antiguo
      }

      // Enviar la lista actualizada al renderer
      if (win && win.webContents) {
          win.webContents.send('clipboard-history', clipboardHistory);
          updateWindowHeight(clipboardHistory.length);
      }
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
