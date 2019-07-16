const { app, BrowserWindow, globalShortcut, Menu, ipcMain } = require('electron')
const fs = require("fs")
// Shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { app.quit() }


/*=============================================
=            Preferencias            =
=============================================*/
const PREFS_FILE = `${app.getPath('userData')}/preferences.json`

// Defaults
global.preferences = { ip:'127.0.0.1', colas:2 } 
if (fs.existsSync(PREFS_FILE)) {
   global.preferences = fs.readFileSync(PREFS_FILE)
}

function savePreferences() {
  fs.writeFileSync(PREFS_FILE, JSON.stringify(preferences))
}

/*=====  End of Preferencias  ======*/

const menu = [
  {
      label: 'Archivo',
      submenu: [
          {label:'Recargar',  click() {app.reload()} },
          {label:'Salir',     click() {app.quit()} }
      ]
  },{
      label: 'Editar',
      submenu: [
          {label:'Ajustes',   click() { config() }},
          {label:'Guardar preferencias',   click() { savePreferences() }}
      ]
  }
]

const initApp = () => {
  let appWin = new BrowserWindow({width: 600,height: 300, show:false, webPreferences: { nodeIntegration: true}})
  
  appWin.loadURL(`file://${__dirname}/index.html`)
  appWin.setMenu( Menu.buildFromTemplate(menu) )
  
  globalShortcut.register('CommandOrControl+1', () => { appWin.webContents.send('turnomatic', 'sube') })
  globalShortcut.register('CommandOrControl+2', () => { appWin.webContents.send('turnomatic', 'baja') })
  globalShortcut.register('CommandOrControl+3', () => { appWin.webContents.send('turnomatic', 'reset') })
  
  appWin.show()
  appWin.on('closed', () => { appWin = null })
  
  //appWin.webContents.openDevTools()
}

const endApp = () => {  globalShortcut.unregisterAll() }

const config = () => {
  let configWin = new BrowserWindow({width: 400,height: 500, show:false, webPreferences: { nodeIntegration: true }})
  configWin.loadURL(`file://${__dirname}/config.html`)
  configWin.setMenu( null )
  configWin.setResizable( false )
  configWin.show()
  
  configWin.on('closed', () => { configWin = null })
  configWin.webContents.openDevTools()
}

app.on('will-quit', endApp)
app.on('window-all-closed', () => { app.quit() })
app.on('ready', initApp)

ipcMain.on('async', (e, arg) => {
  switch (arg) {
    case 'savePrefs':
      console.log('guardar:' + global.preferences)
      savePreferences()
    break;
  }
})