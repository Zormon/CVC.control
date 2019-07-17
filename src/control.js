function $(id)      { return document.getElementById(id)    }
function $$(id)     { return document.querySelector(id)     }
function $$$(id)    { return document.querySelectorAll(id)  }
const remote = require('electron').remote;


let cola = $$('#tabs button').dataset.id

function cambiaTurno(accion, cola) {
    wSocket.send( JSON.stringify( {accion: accion, nombre: cola} ) )
}

/*=============================================
=            Señales hilo principal            =
=============================================*/

const { ipcRenderer } = require('electron')
ipcRenderer.on('turnomatic', (e, arg) => { cambiaTurno(arg, cola) })

/*=====  End of Señales hilo principal  ======*/


/*----------  Tabs  ----------*/
$$$('#tabs button').forEach( el => { 
    el.onclick = () => { 
        $$$('#tabs button').forEach( el => { el.className = '' } )
        cola = el.dataset.id
        el.className = 'current'
     }
})


/*----------  Botones  ----------*/
$('plus').onmousedown = () => { cambiaTurno('sube', cola) }
$('minus').onmousedown = () => { cambiaTurno('baja', cola) }
$('reset').onmousedown = () => { cambiaTurno('reset', cola) }


/*=============================================
=            Websocket            =
=============================================*/

var wSocket = new WebSocket(`ws://${remote.getGlobal('appConf').ip}`);

wSocket.onopen = () => { }
wSocket.onerror = (error) => { console.log('websocket error: ' + error) }

wSocket.onmessage = (message) => {
    let turno = JSON.parse(message.data)
    $('num').textContent = turno.numero.toString().padStart(2,'0')
    $('cola').textContent = turno.nombre.toString().padStart(2,'0')
}

/*=====  End of Websocket  ======*/