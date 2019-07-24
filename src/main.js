const { app, BrowserWindow, globalShortcut, Menu, ipcMain } = require('electron')
const fs = require("fs")
// Shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { app.quit() }

var appWin
var configWin = null

/*=============================================
=            Preferencias            =
=============================================*/
const PREFS_FILE = `${app.getPath('userData')}/appConf.json`

// Defaults
global.appConf = { 
  ip:'127.0.0.1', 
  colas:['Mostrador 1','Mostrador 2','Mostrador 3'],
  focusOnShortcut:false }

if (fs.existsSync(PREFS_FILE)) {
   global.appConf = JSON.parse(fs.readFileSync(PREFS_FILE, 'utf8'))
}

function reloadApp() {
  app.relaunch()
  app.exit()
}

function turno(accion) {
  appWin.webContents.send('turnomatic', accion)
  if (appConf.focusOnShortcut) { appWin.focus() }
}

/*=====  End of Preferencias  ======*/

/*=============================================
=            Menu            =
=============================================*/
const menu = [
  {
      label: 'Archivo',
      submenu: [
          {label:'Recargar',  click() { reloadApp() } },
          {label:'Salir',     click() { app.quit() } }
      ]
  },{
      label: 'Editar',
      submenu: [
          {label:'Ajustes',   click() {
            if (configWin == null)  { config() } 
            else                    { configWin.focus() } 
          }},
      ]
  }
]
/*=====  End of Menu  ======*/


const initApp = () => {
  appWin = new BrowserWindow({width: 600,height: 300, show:false, webPreferences: { nodeIntegration: true}})
  
  appWin.loadURL(`file://${__dirname}/index.html`)
  appWin.setMenu( Menu.buildFromTemplate(menu) )
  
  globalShortcut.register('CommandOrControl+1', () => { turno('sube') })
  globalShortcut.register('CommandOrControl+2', () => { turno('baja') })
  globalShortcut.register('CommandOrControl+3', () => { turno('reset') })
  
  appWin.show()
  appWin.on('closed', () => { app.quit() })
  
  appWin.webContents.openDevTools()
}


const config = () => {
  configWin = new BrowserWindow({width: 400,height: 600, show:false, webPreferences: { nodeIntegration: true, parent: appWin }})
  configWin.loadURL(`file://${__dirname}/config.html`)
  configWin.setMenu( null )
  configWin.setResizable( false )
  configWin.show()
  
  configWin.on('closed', () => { configWin = null })

  configWin.webContents.openDevTools()
}

app.on('ready', initApp)

ipcMain.on('savePrefs', (e, arg) => {
    global.appConf = arg
    fs.writeFileSync(PREFS_FILE, JSON.stringify(global.appConf), 'utf8')
    appWin.reload()
})