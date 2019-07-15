function $(id)      { return document.getElementById(id)    }
function $$(id)     { return document.querySelector(id)     }
function $$$(id)    { return document.querySelectorAll(id)  }


let ip = '127.0.0.1:3000'
let cMostrador = 0

function cambiaTurno(accion, mostrador, valor=0) {
    fetch(`http://${ip}/app/ajax.php?modo=turnomatic&accion=${accion}&mostrador=${mostrador}&valor=${valor}`)
}

function showTurno() { 
    fetch(`http://${ip}/turno/}`)
    .then(resp => resp.json()).then( function(data) {
        $('num').textContent = data.turno
    })
  }

/*=============================================
=            Señales hilo principal            =
=============================================*/

const { ipcRenderer } = require('electron')

ipcRenderer.on('turnomatic', (e, arg) => {
    switch(arg) {
        case 'sube':
            cambiaTurno('sube', cMostrador)
        break
        case 'baja':
            cambiaTurno('baja', cMostrador)
        break
        case 'reset':
            cambiaTurno('set', cMostrador, 0)
        break
    }
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
$('reset').onmousedown = () => { cambiaTurno('set', cMostrador, 0) }

setInterval(showTurno, 500)