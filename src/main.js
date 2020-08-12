const { app, BrowserWindow, globalShortcut, Menu, ipcMain, dialog } = require('electron')

const fs = require("fs")
var appWin
var configWin; var configServerWin;

app.setAppUserModelId(process.execPath) // Para notificaciones en Windows

/*=============================================
=            Preferencias            =
=============================================*/

  const CONFIG_FILE = `${app.getPath('userData')}/appConf.json`

  // Defaults
  const DEFAULTS = 
  { 
    mostrador:'Mostrador 1',
    ip:'127.0.0.1',
    port:'3000', 
    focusOnShortcut:false,
    notifications:false,
    shortcutKey: 'no'
  }
  global.appConf = DEFAULTS


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
    appWin.webContents.send('turnomatic', accion)
    if (appConf.focusOnShortcut) { appWin.focus() }
  }

  function restart() {
    app.relaunch()
    app.exit()
  }

  function savePrefs(prefs) {
    global.appConf = prefs
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(global.appConf), 'utf8')
  }

  function restore() {
    savePrefs(DEFAULTS)
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
    if (appConf.shortcut != 'no') {
      globalShortcut.register(`${appConf.shortcutKey}+1`, () => { turno('sube') })
      globalShortcut.register(`${appConf.shortcutKey}+2`, () => { turno('baja') })
      globalShortcut.register(`${appConf.shortcutKey}+3`, () => { turno('reset') })
    }
  }

/*=====  End of Funciones  ======*/




/*=============================================
=            Ventanas            =
=============================================*/

  function initApp() {
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        global.appConf = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
      } catch (error) { restore() }
    }
    appWin = new BrowserWindow({width: 600,height: 300, show:false, icon: `${app.getAppPath()}/icon64.png`, webPreferences: { nodeIntegration: true}})
    
    appWin.loadURL(`file://${__dirname}/_index/index.html`)
    appWin.setMenu( Menu.buildFromTemplate(menu) )
    appWin.resizable =  false
    
    registerGlobalShortcuts()
    
    appWin.show()
    appWin.on('closed', () => { app.quit() })
    //appWin.webContents.openDevTools()
  }

  function config() {
    configWin = new BrowserWindow({width: 400,height: 600, show:false, webPreferences: { nodeIntegration: true, parent: appWin }})
    configWin.loadURL(`file://${__dirname}/_config/config.html`)
    configWin.setMenu( null )
    configWin.resizable = false

    configWin.show()
    configWin.on('closed', () => { configWin = null })
    //configWin.webContents.openDevTools()
  }

  function configServer() {
    configWin = new BrowserWindow({width: 400, height: 600, show:false, webPreferences: { nodeIntegration: true, parent: appWin }})
    configWin.loadURL(`file://${__dirname}/_configServer/configServer.html`)
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
      message: 'Farmavisión - Control Turnomatic para PC\nComunicacion Visual Canarias 2020\nContacto: 928 67 29 81'
     }
    dialog.showMessageBox(appWin, options)
  }

/*=====  End of Ventanas  ======*/



app.on('ready', initApp)

ipcMain.on('savePrefs', (e, arg) => { 
  savePrefs(arg)
  appWin.reload()
  registerGlobalShortcuts()
})