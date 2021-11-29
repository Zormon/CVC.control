import {$, $$$, allowedKeys} from '../exports.web.js'
var CONF = window.ipc.get.appConf()

function savePreferences() {
    CONF.mostrador = $('mostrador').value
    CONF.server.ip = $('ip').value
    CONF.server.port = $('port').value
    CONF.shortcuts.key = $('shortcutKey').value
    CONF.shortcuts.up = $('up').value
    CONF.shortcuts.down = $('down').value
    CONF.shortcuts.reset = $('reset').value
    CONF.notifications = $('notifications').checked
    CONF.showTicket = $('showTicket').checked
    CONF.focusOnShortcut = $('focusOnShortcut').checked

    window.ipc.save.appConf( CONF )
}

$('save').onclick = (e)=> {
    e.preventDefault()
    if ( $('config').checkValidity() )  { savePreferences() }
    else                                { $('config').reportValidity() }
}

$$$('.atajos input[type="text"]').forEach(el => {
    el.onkeydown = (e)=> {
        e.preventDefault()
        const key = e.key.toUpperCase().replace('ARROW', '')
        if ( allowedKeys.indexOf(key) !== -1) { e.currentTarget.value = key }
        
    }
})

// Initialization
$('mostrador').value = CONF.mostrador
$('ip').value = CONF.server.ip
$('port').value = CONF.server.port
$('shortcutKey').value = CONF.shortcuts.key
$('up').value = CONF.shortcuts.up
$('down').value = CONF.shortcuts.down
$('reset').value = CONF.shortcuts.reset
$('focusOnShortcut').checked = CONF.focusOnShortcut
$('notifications').checked = CONF.notifications
$('showTicket').checked = CONF.showTicket


