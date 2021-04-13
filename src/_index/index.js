import wSocket from './wSocket.class.js'
import {$} from '../exports.web.js'

const conf = window.ipc.get.appConf()

const notif = conf.notifications? window.ipc.notification : false

var ws = new wSocket(conf.server, notif, window.ipc.logger)
ws.init()

window.ipc.on.turno( (data)=> {
    ws.turno( data, conf.mostrador )
} )

/*----------  Botones  ----------*/
$('plus').onmousedown = () =>   { ws.turno( 'sube', conf.mostrador ) }
$('minus').onmousedown = () =>  { ws.turno( 'baja', conf.mostrador ) }
$('reset').onmousedown = () =>  { ws.turno( 'reset', conf.mostrador ) }