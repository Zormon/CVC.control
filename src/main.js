const { app, BrowserWindow, globalShortcut, Menu, ipcMain, dialog } = require('electron')
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
const DEFAULTS = 
{ 
  ip:'127.0.0.1', 
  colas:['Mostrador 1','Mostrador 2','Mostrador 3'],
  focusOnShortcut:false 
}
global.appConf = DEFAULTS

if (fs.existsSync(PREFS_FILE)) {
  try {
    global.appConf = JSON.parse(fs.readFileSync(PREFS_FILE, 'utf8'))
  } catch (error) {
    restore(false)
  }
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
      role: 'appMenu',
      label: 'Archivo',
      submenu: [
          {label:'Recargar',  click() { reloadApp() } },
          {role: 'quit', label:'Salir'},
      ]
  },{
      label: 'Editar',
      submenu: [
          {label:'Ajustes',   click() {
            if (configWin == null)  { config() } 
            else                    { configWin.focus() } 
          }},
          {type: 'separator'},
          {label:'Restaurar parámetros',     click() { restoreDialog() } }
      ]
  }
]

/*=====  End of Menu  ======*/




/*=============================================
=            Funciones            =
=============================================*/

function savePrefs(prefs, reload=true) {
  global.appConf = prefs
  fs.writeFileSync(PREFS_FILE, JSON.stringify(global.appConf), 'utf8')
  
  if (reload) appWin.reload()
}

function restore(reload=true) {
  savePrefs(DEFAULTS, reload)
}

function restoreDialog() {
  const options  = {
    buttons: ['Cancelar','Aceptar'],
    message: '¿Restaurar los valores por defecto de la configuración de la aplicación?'
   }
  dialog.showMessageBox(options, (resp) => { if (resp) restore()  }) // Ha pulsado aceptar
}

/*=====  End of Funciones  ======*/




/*=============================================
=            Ventanas            =
=============================================*/

function initApp() {
  appWin = new BrowserWindow({width: 600,height: 300, show:false, webPreferences: { nodeIntegration: true}})
  
  appWin.loadURL(`file://${__dirname}/index.html`)
  appWin.setMenu( Menu.buildFromTemplate(menu) )
  appWin.setResizable( false )
  
  globalShortcut.register('CommandOrControl+1', () => { turno('sube') })
  globalShortcut.register('CommandOrControl+2', () => { turno('baja') })
  globalShortcut.register('CommandOrControl+3', () => { turno('reset') })
  
  appWin.show()
  appWin.on('closed', () => { app.quit() })
  
  //appWin.webContents.openDevTools()
}


function config() {
  configWin = new BrowserWindow({width: 400,height: 600, show:false, webPreferences: { nodeIntegration: true, parent: appWin }})
  configWin.loadURL(`file://${__dirname}/config.html`)
  configWin.setMenu( null )
  configWin.setResizable( false )
  configWin.show()
  
  configWin.on('closed', () => { configWin = null })

  configWin.webContents.openDevTools()
}

/*=====  End of Ventanas  ======*/




app.on('ready', initApp)
ipcMain.on('savePrefs', (e, arg) => { savePrefs(arg) })