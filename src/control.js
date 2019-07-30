const { ipcRenderer, remote } = require('electron')
function $(id)      { return document.getElementById(id)    }
function $$(id)     { return document.querySelector(id)     }
function $$$(id)    { return document.querySelectorAll(id)  }


var wSocket
let cola = 'Mostrador 1'
const colas = remote.getGlobal('appConf').colas


/*=============================================
=            Funciones            =
=============================================*/

    function cambiaTurno(accion, cola) {
        wSocket.send( JSON.stringify( {accion: accion, nombre: cola} ) )
    }

    function webSocket() {
        wSocket = new WebSocket(`ws://${remote.getGlobal('appConf').ip}:3000`);

        wSocket.onmessage = (message) => {
            let turno = JSON.parse(message.data)
            if (turno.numero != -1) { // Si se recibe -1 es un envio periodico de ping
                $('num').textContent = turno.numero.toString().padStart(2,'0')
                $('cola').textContent = turno.nombre.toString().padStart(2,'0')
            }

            document.body.classList.remove('error')
            checkSocket()
        }
    }

    function checkSocket() {
        clearTimeout(document.wsTimeout)

        document.wsTimeout = setTimeout( ()=> {
            webSocket()
            checkSocket()
            $$('#errorModal > div > h1').textContent = 'Sin conexión con el turnomatic'
            $$('#errorModal > div > p').textContent = `Intentando reconectar a ip ${remote.getGlobal('appConf').ip}`
            document.body.classList.add('error')
        }, 3000)
    }

/*=====  End of Funciones  ======*/




/*=============================================
=            Señales IPC            =
=============================================*/

    ipcRenderer.on('turnomatic', (e, arg) => { cambiaTurno(arg, cola) })

/*=====  End of Señales IPC  ======*/




/*=============================================
=            MAIN            =
=============================================*/

    checkSocket()
    webSocket()

    /*----------  Tabs  ----------*/

    for (let i=0; i < colas.length; i++) {
        let btn = document.createElement('button')
        btn.dataset.id =  colas[i]
        btn.textContent = colas[i]
        if (i == 0) { btn.className = 'current' }
    
        $('tabs').appendChild(btn)
    }

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

/*=====  End of MAIN  ======*/