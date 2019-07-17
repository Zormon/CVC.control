function $(id)      { return document.getElementById(id)    }
function $$(id)     { return document.querySelector(id)     }

const remote = require('electron').remote
const { ipcRenderer } = require('electron')

var prefs = remote.getGlobal('appConf')

function savePreferences() {
    prefs.ip = $('ip1').value + '.' + $('ip2').value
    prefs.colas = $$('input[name="ncolas"]:checked').value
    prefs.focusOnShortcut = false
    ipcRenderer.send('savePrefs', prefs )
}

$('save').onclick = ()=> { savePreferences() }