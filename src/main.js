const { app, BrowserWindow, globalShortcut, Menu } = require('electron')
// Shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { app.quit() }


const menu = [
  {
      label: 'Archivo',
      submenu: [
          {label:'Recargar',  click() {appWin.reload()} },
          {label:'Salir',     click() {app.quit()} }
      ]
  },{
      label: 'Editar',
      submenu: [
          {label:'Ajustes',   click() { ajustes() }}
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
  //appWin.webContents.openDevTools()
  appWin.on('closed', () => { appWin = null })
}

const endApp = () => {  globalShortcut.unregisterAll() }

const ajustes = () => {
  let configWin = new BrowserWindow({width: 400,height: 500, show:false, webPreferences: { nodeIntegration: true }})
  configWin.loadURL(`file://${__dirname}/config.html`)
  configWin.setMenu( null )
  configWin.setResizable( false )
  configWin.show()
  configWin.webContents.openDevTools()

  configWin.on('closed', () => { configWin = null })
}

app.on('will-quit', endApp)
app.on('window-all-closed', () => { app.quit() })
app.on('ready', initApp)