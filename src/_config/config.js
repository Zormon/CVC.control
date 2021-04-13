import {$} from '../exports.web.js'
var CONF = window.ipc.get.appConf()

function savePreferences() {
    CONF.mostrador = $('mostrador').value
    CONF.server.ip = $('ip').value
    CONF.server.port = $('port').value
    CONF.shortcutKey = $('shortcutKey').value
    CONF.notifications = $('notifications').checked
    CONF.focusOnShortcut = $('focusOnShortcut').checked

    window.ipc.save.appConf( CONF )
}

$('save').onclick = (e)=> {
    e.preventDefault()
    if ( $('config').checkValidity() )  { savePreferences() }
    else                                { $('config').reportValidity() }
}

// Initialization
$('mostrador').value = CONF.mostrador
$('ip').value = CONF.server.ip
$('port').value = CONF.server.port
$('shortcutKey').value = CONF.shortcutKey
$('focusOnShortcut').checked = CONF.focusOnShortcut
$('notifications').checked = CONF.notifications


