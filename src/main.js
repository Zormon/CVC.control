const { app, BrowserWindow, globalShortcut, Menu } = require('electron')
// Shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { app.quit() }

//let preferences

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
          {label:'Ajustes',   click() { config() }}
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
  
  appWin.webContents.openDevTools()
}

const endApp = () => {  globalShortcut.unregisterAll() }

const config = () => {
  let configWin = new BrowserWindow({width: 400,height: 500, show:false, webPreferences: { nodeIntegration: true }})
  configWin.loadURL(`file://${__dirname}/config.html`)
  configWin.setMenu( null )
  configWin.setResizable( false )
  configWin.show()
  
  configWin.on('closed', () => { configWin = null })
  //configWin.webContents.openDevTools()
}

function savePreferences() {
  //fs.writeFileSync(`app.getPath('userData')${preferences.json}`, JSON.stringify(preferences))
}

app.on('will-quit', endApp)
app.on('window-all-closed', () => { app.quit() })
app.on('ready', initApp)