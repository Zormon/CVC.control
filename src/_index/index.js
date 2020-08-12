const { ipcRenderer, remote } = require('electron')
function $(id)      { return document.getElementById(id)    }
function $$(id)     { return document.querySelector(id)     }
function $$$(id)    { return document.querySelectorAll(id)  }

const conf = remote.getGlobal('appConf')


/*=============================================
=            Señales IPC            =
=============================================*/

    ipcRenderer.on('turnomatic', (e, arg) => { ws.turno( arg, conf.mostrador ) })

/*=====  End of Señales IPC  ======*/


/*=============================================
=            MAIN            =
=============================================*/

    var ws = new wSocket(conf.ip, conf.port, true, conf.notifications)
    ws.init()

    /*----------  Botones  ----------*/

    $('plus').onmousedown = () =>   { ws.turno( 'sube', conf.mostrador ) }
    $('minus').onmousedown = () =>  { ws.turno( 'baja', conf.mostrador ) }
    $('reset').onmousedown = () =>  { ws.turno( 'reset', conf.mostrador ) }

/*=====  End of MAIN  ======*/