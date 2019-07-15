function $(id)      { return document.getElementById(id)    }
function $$(id)     { return document.querySelector(id)     }
function $$$(id)    { return document.querySelectorAll(id)  }


let ip = '127.0.0.1:3000'
let cMostrador = 0

function cambiaTurno(accion, mostrador) {
    fetch(`http://${ip}/${accion}/${mostrador}`)
}

function showTurno() { 
    fetch(`http://${ip}/turno/}`)
    .then(resp => resp.json()).then( function(data) {
        $('num').textContent = data.numero.toString().padStart(2,'0')
    })
  }

/*=============================================
=            Señales hilo principal            =
=============================================*/

const { ipcRenderer } = require('electron')

ipcRenderer.on('turnomatic', (e, arg) => {
    cambiaTurno(arg, cMostrador)
})

/*=====  End of Señales hilo principal  ======*/


/*----------  Tabs  ----------*/
$$$('#tabs button').forEach( el => { 
    el.onclick = () => { 
        $$$('#tabs button').forEach( el => { el.className = '' } )
        cMostrador = el.dataset.id
        el.className = 'current'
     }
})


/*----------  Botones  ----------*/
$('plus').onmousedown = () => { cambiaTurno('sube', cMostrador) }
$('minus').onmousedown = () => { cambiaTurno('baja', cMostrador) }
$('reset').onmousedown = () => { cambiaTurno('reset', cMostrador) }

setInterval(showTurno, 500)