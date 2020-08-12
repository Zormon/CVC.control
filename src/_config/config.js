function $(id)      { return document.getElementById(id)    }

const remote = require('electron').remote
const { ipcRenderer } = require('electron')

var prefs = remote.getGlobal('appConf')

function savePreferences() {
    prefs.mostrador = $('mostrador').value
    prefs.ip = $('ip').value
    prefs.port = $('port').value
    prefs.shortcutKey = $('shortcutKey').value
    prefs.notifications = $('notifications').checked
    prefs.focusOnShortcut = $('focusOnShortcut').checked
    ipcRenderer.send('savePrefs', prefs )
}

$('save').onclick = (e)=> {
    e.preventDefault()
    if ( $('config').checkValidity() ) {
        savePreferences()
        remote.getCurrentWindow().close()
    } else { 
        $('config').reportValidity()
    }
}

$('mostrador').value = prefs.mostrador
$('ip').value = prefs.ip
$('port').value = prefs.port
$('shortcutKey').value = prefs.shortcutKey
$('focusOnShortcut').checked = prefs.focusOnShortcut
$('notifications').checked = prefs.notifications


