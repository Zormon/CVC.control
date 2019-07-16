function $(id)      { return document.getElementById(id)    }
const remote = require('electron').remote
const { ipcRenderer } = require('electron')

function savePreferences() {
    console.log(remote.getGlobal('preferences'))
    remote.getGlobal('preferences').ip = '192.168.1.245'
    ipcRenderer.send('async', 'savePrefs')
}

$('save').onclick = ()=> { savePreferences() }