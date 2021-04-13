const appName = 'Control Turnos'
const { app, BrowserWindow, globalShortcut, Menu, ipcMain, dialog, Notification } = require('electron')
const fs = require("fs")
const path = require('path')
const logger = require('./log.js')
const isLinux = process.platform === "linux"
const restartCommandShell =  `~/system/scripts/appsCvc restart ${appName} &`
var appWin, configWin, configServerWin;

app.setAppUserModelId(process.execPath) // Para notificaciones en Windows

/*=============================================
=            Preferencias            =
=============================================*/

  const CONFIG_FILE = `${app.getPath('userData')}/appConf.json`

  // Defaults
  const DEFAULT_CONFIG = 
  { 
    mostrador:'Mostrador 1',
    server: {
      ip:'127.0.0.1',
      port:'3000', 
    },
    focusOnShortcut:false,
    notifications:false,
    shortcutKey: 'no'
  }
  
  if ( !(global.APPCONF = loadConfigFile(CONFIG_FILE)) )      { global.APPCONF = DEFAULT_CONFIG }

/*=====  End of Preferencias  ======*/




/*=============================================
=            Menu            =
=============================================*/

  const menu = [
    {
        role: 'appMenu',
        label: 'Archivo',
        submenu: [
          {label:'Reiniciar', accelerator: 'CmdOrCtrl+R', click() { restart() } },
          {role:'forcereload', label:'Refrescar' },
          {role: 'quit', label:'Salir'}
        ]
    },{
        label: 'Editar',
        submenu: [
            {label:'Ajustes', accelerator: 'CmdOrCtrl+E',  click() {
              if (!configWin)         { config() } 
              else                    { configWin.focus() } 
            }},
            {label:'Ajustes del servidor', accelerator: 'CmdOrCtrl+S',  click() {
              if (!configServerWin)    { configServer() } 
              else                     { configWin.focus() } 
            }},
            {type: 'separator'},
            {label:'Restaurar parámetros',     click() { restoreDialog() } }
        ]
    }
    ,{
      role: 'help',
      label: 'Ayuda',
      submenu: [
          { label:'Información', click() { about() } },
          { role: 'toggledevtools', label:'Consola Web'}
      ]
  }
  ]

/*=====  End of Menu  ======*/




/*=============================================
=            Funciones            =
=============================================*/

  function turno(accion) {
    appWin.webContents.send('turno', accion)
    if (APPCONF.focusOnShortcut) { appWin.focus() }
  }

  function restart() {
    if (isLinux) {
      let exec = require('child_process').exec
      exec(restartCommandShell, (err, stdout)=> {})
    } else {
      app.relaunch()
      app.quit()
    }
  }

  function saveConfFile(prefs, file) {
    fs.writeFileSync(file, JSON.stringify(prefs), 'utf8')
  }

  function loadConfigFile(file) {
    if (fs.existsSync(file)) {
      try {
        let data = JSON.parse(fs.readFileSync(file, 'utf8'))
        return data
      } catch (error) { return false }
    } else { return false}
  }

  function restore() {
    saveConfFile(DEFAULT_CONFIG, CONFIG_FILE)
    saveConfFile(DEFAULT_UI, CONFIGUI_FILE)
    restart() 
  }

  function restoreDialog() {
    const options  = {
      type: 'warning',
      buttons: ['Cancelar','Aceptar'],
      message: '¿Restaurar los valores por defecto de la configuración de la aplicación?'
    }
    dialog.showMessageBox(options, (resp) => { if (resp) { restore(); restart() } }) // Ha pulsado aceptar
  }

  function registerGlobalShortcuts() {
    globalShortcut.unregisterAll()
    if (APPCONF.shortcutKey != 'no') {
      globalShortcut.register(`${APPCONF.shortcutKey}+1`, () => { turno('sube') })
      globalShortcut.register(`${APPCONF.shortcutKey}+2`, () => { turno('baja') })
      globalShortcut.register(`${APPCONF.shortcutKey}+3`, () => { turno('reset') })
    }
  }

/*=====  End of Funciones  ======*/




/*=============================================
=            Ventanas            =
=============================================*/

  function initApp() {
    let winOptions = {
      width: 600, height: 320, resizable:false, show:false, 
      icon: `${app.getAppPath()}/icon64.png`,
      webPreferences: { contextIsolation: true, preload: path.join(__dirname, "preload.js") }
    }
    appWin = new BrowserWindow(winOptions)
    appWin.loadFile(`${__dirname}/_index/index.html`)
    appWin.setTitle(appName)
    Menu.setApplicationMenu( Menu.buildFromTemplate(menu) )
    
    registerGlobalShortcuts()
    
    appWin.show()
    appWin.on('closed', () => { logs.log('MAIN','QUIT',''); app.quit() })
    appWin.webContents.openDevTools()
  }

  function config() {
    const winOptions = {
      width: 400, height: 600, resizable:false, show:false, parent: appWin, modal:true,
      webPreferences: { preload: path.join(__dirname, "preload.js") }
    }
    configWin = new BrowserWindow(winOptions)
    configWin.loadFile(`${__dirname}/_config/config.html`)
    configWin.setMenu( null )
    configWin.show()
    
    configWin.on('closed', () => { configWin = null })
    //configWin.webContents.openDevTools()
  }

  function configServer() {
    const winOptions = {
      width: 400, height: 600, resizable:false, show:false, parent: appWin, modal:true,
      webPreferences: { preload: path.join(__dirname, "preload.js") }
    }
    configWin = new BrowserWindow(winOptions)
    configWin.loadFile(`${__dirname}/_configServer/configServer.html`)
    configWin.setMenu( null )
    configWin.resizable = false
    configWin.show()
    
    configWin.on('closed', () => { configWin = null })
    //configWin.webContents.openDevTools()
  }

  function about() {
    const options  = {
      type: 'info',
      buttons: ['Aceptar'],
      title: 'Información',
      message: 'Farmavisión - Control Turnomatic para PC\nComunicacion Visual Canarias 2021\nContacto: 928 67 29 81'
     }
    dialog.showMessageBox(appWin, options)
  }

/*=====  End of Ventanas  ======*/



app.on('ready', initApp)

ipcMain.on('getGlobal', (e, type) => {
  switch(type) {
    case 'appConf':
      e.returnValue = global.APPCONF
    break
    case 'interface':
      e.returnValue = global.UI
    break
  }
})

ipcMain.on('saveAppConf', (e, arg) => { 
  global.APPCONF = arg
  saveConfFile(arg, CONFIG_FILE)
  logs.log('MAIN', 'SAVE_PREFS', JSON.stringify(arg))
  restart()
})

ipcMain.on('notification', (e, arg) => { 
  if (global.APPCONF.notifications && !appWin.isFocused() && global.APPCONF.mostrador != arg) {
    const notification = { title: arg.header, body: arg.body}
    new Notification(notification).show()
  }
})

// Logs
var logs = new logger(`${app.getPath('userData')}/logs/`, appName)
ipcMain.on('log', (e, arg) =>       { logs.log(arg.origin, arg.event, arg.message) })
ipcMain.on('logError', (e, arg) =>  { logs.error(arg.origin, arg.error, arg.message) })