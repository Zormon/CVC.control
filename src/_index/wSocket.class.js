import {$, $$, $$$, iconNames, modalBox} from '../exports.web.js'

class wSocket {
    constructor(conf, notification, logger) {
        this.ip = conf.server.ip
        this.port = conf.server.port
        this.showTicket = conf.showTicket
        this.notification = notification
        this.logError = logger.error
        this.currentCola = 0
        this.colas = []
        this.turnos = []
        this.tickets = []
    }

    init() {
        this.ws =  new WebSocket(`ws://${this.ip}:${this.port}`)
        var _this = this
        _this.check()

        this.ws.onmessage = (message) => {
            let msg = JSON.parse(message.data)
            switch (msg.accion) {
                case 'update':
                    this.turnos[msg.cola].num = msg.numero
                    this.turnos[msg.cola].texto = msg.texto
                    _this.update(msg.cola)
                break
                case 'updateTicket':
                    this.tickets[msg.cola].num = msg.numero
                    _this.updateTicket(msg.cola)
                break
                case 'spread':
                    this.colas = msg.colas
                    this.turnos = msg.turnos
                    this.tickets = msg.tickets
                    _this.spread(this.colas)
                    _this.changeCola( this.currentCola )
                break
                default:
                    modalBox('socketError', false)
                    _this.check()
                break
            }
        }
    }

    close() {
        this.ws.close()
    }

    changeCola( id ) {
        if (!isNaN(id) && typeof this.colas[id] !== 'undefined')     { this.currentCola = id }
        else                                                         { this.currentCola = 0 }

        $$$('#tabs button').forEach( el => { el.className = '' } )
        $$(`#tabs button[data-id="${this.currentCola}"]`).className = 'current'

        $('num').textContent = this.turnos[this.currentCola].num
        $('texto').textContent = this.turnos[this.currentCola].texto

        if (this.showTicket) { $('ticket').textContent = 'Último ticket: ' + this.tickets[this.currentCola].num }

        localStorage.setItem('currentCola', this.currentCola)
    }

    spread(colas) {
        var _this = this
        // Crea los botones de las colas
        let tabs = $('tabs')
        while (tabs.firstChild) { tabs.removeChild(tabs.firstChild) }
        for (let i=0; i < colas.length; i++) {
            let btn, icon
            btn = document.createElement('button')
            btn.dataset.id = i
            btn.textContent = colas[i].nombre
            btn.style.backgroundColor = colas[i].color
            btn.onclick = (e) => { _this.changeCola( parseInt(e.currentTarget.dataset.id) ) }

            icon = document.createElement('i'); icon.className = `icon-${iconNames[colas[i].icon]}`
            btn.appendChild(icon); tabs.appendChild(btn)
        }

        _this.changeCola( localStorage.getItem('currentCola') )
    }

    update(cola) {
        if (cola == this.currentCola) { // Solo si estamos en la cola actual
            $('num').textContent = this.turnos[cola].num.toString()
            $('texto').textContent = this.turnos[cola].texto.toString()

            const head = `Cola ${this.colas[cola].nombre} actualizado`
            const body = `Número: ${this.turnos[cola].num}, Mostrador: ${this.turnos[cola].texto}`
            this.notification.show(this.turnos[cola].texto,head, body)
        }
    }

    updateTicket(cola) {
        if (this.showTicket && cola == this.currentCola) { // Solo si estamos en la cola actual
            $('ticket').textContent = 'Último ticket: ' + this.tickets[cola].num.toString()
        }
    }

    check() {
        clearTimeout(document.wsTimeout)
        var _this = this

        document.wsTimeout = setTimeout( ()=> {
            _this.close()
            _this.init()
            _this.check()

            // Error Modal
            modalBox('socketError', 'msgBox', [['header','ERROR DE CONEXIÓN'],['texto', `Conectando a ${this.ip}`]], 'error' )
            this.logError({origin: 'TURNOMATIC', error: 'OFFLINE', message: `Conectando a ${this.ip}`})
        }, 5000)
    }

    send( data ) {
        this.ws.send( JSON.stringify( data ) )
    }

    turno( accion, texto='' ) {
        var _this = this
        _this.send( {accion: accion, cola: this.currentCola, texto: texto} )
    }
}

export default wSocket