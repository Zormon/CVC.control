function $(id)      { return document.getElementById(id)    }
function $$(id)     { return document.querySelector(id)     }
function $$$(id)    { return document.querySelectorAll(id)  }

const remote = require('electron').remote
const { ipcRenderer } = require('electron')

var prefs = remote.getGlobal('appConf')

function savePreferences() {
    prefs.ip = $('ip').value

    let cols = []
    $$$('#colas input').forEach(el => {
        cols.push(el.value)
    })
    
    prefs.colas = cols
    prefs.focusOnShortcut = $('fosusOnKey').checked
    ipcRenderer.send('savePrefs', prefs )
}

function printColas() {
    let divColas = $('colas')
    while (divColas.firstChild) { divColas.removeChild(divColas.firstChild) }
    for (let i=0; i< $('ncolas').value; i++) {
        let el = document.createElement('input')
        el.type = 'text'
        if (typeof prefs.colas[i] != 'undefined') { el.value = prefs.colas[i] }
        else                                      { el.value = `Mostrador ${i+1}` }
        
        divColas.appendChild(el)
    }
}

$('save').onclick = ()=> { 
    savePreferences()
    remote.getCurrentWindow().close()
}

$('ncolas').onchange = ()=> { printColas() }

$('ip').value = prefs.ip
$('ncolas').value = prefs.colas.length
$('fosusOnKey').checked = prefs.focusOnShortcut
printColas()


