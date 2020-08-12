function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }
function isFunction(f) {return f && {}.toString.call(f)==='[object Function]'}

class wSocket {
    constructor(ip, port, front=false, notify=false) {
        this.ip = ip
        this.port = port
        this.front = front
        this.currentCola = 0
        this.colas = []
        this.turnos = []
        this.notifications = notify
    }

    init() {
        this.ws =  new WebSocket(`ws://${this.ip}:${this.port}`)
        var _this = this
        _this.check()

        this.ws.onmessage = (message) => {
            let msg = JSON.parse(message.data)
            switch (msg.accion) {
                case 'spread':
                    this.colas = msg.colas
                    this.turnos = msg.turnos
                    _this.spread(this.colas, this.turnos)
                    _this.changeCola( this.currentCola )
                break
                case 'update':
                    this.turnos[msg.cola].num = msg.numero
                    this.turnos[msg.cola].texto = msg.texto
                    _this.update(msg.cola)
                break
                default: // Si se recibe cualquier otro mensaje es un ping del server
                    document.body.classList.remove('error')
                    _this.check()
                break
            }
        }
    }

    close() {
        this.ws.close()
    }

    changeCola( id ) {
        this.currentCola = id
        $$$('#tabs button').forEach( el => { el.className = '' } )
        $$(`#tabs button[data-id="${id}"]`).className = 'current'

        $('num').textContent = this.turnos[this.currentCola].num
        $('texto').textContent = this.turnos[this.currentCola].texto
    }

    spread(colas) {
        // Crea los botones de las colas
        let tabs = $('tabs')
        while (tabs.firstChild) { tabs.removeChild(tabs.firstChild) }
        for (let i=0; i < colas.length; i++) {
            let btn = document.createElement('button')
            btn.dataset.id = i
            btn.textContent = colas[i].nombre
            if (i == 0) { btn.className = 'current' }

            var _this = this
            btn.onclick = (e) => { _this.changeCola( e.currentTarget.dataset.id ) }
            $('tabs').appendChild(btn)
        }
    }

    update(cola) {
        if (cola == this.currentCola) { // Solo si estamos en la cola actual
            $('num').textContent = this.turnos[cola].num.toString()
            $('texto').textContent = this.turnos[cola].texto.toString()

            const [bWin] = remote.BrowserWindow.getAllWindows();

            if (this.notifications && !bWin.isFocused()) {
                let notif = new Notification(`Cola ${this.colas[cola].nombre} actualizado`, {
                    body: `Número: ${this.turnos[cola].num}, Mostrador: ${this.turnos[cola].texto}`
                })

                notif.onclick = () => { console.log('Notification clicked') }
            }
        }
        
    }

    check() {
        clearTimeout(document.wsTimeout)
        var _this = this

        document.wsTimeout = setTimeout( ()=> {
            _this.close()
            _this.init()
            _this.check()
            $$('#errorModal > div > h1').textContent = 'Sin conexión con el turnomatic'
            $$('#errorModal > div > p').textContent = `Intentando reconectar a ${remote.getGlobal('appConf').ip}`
            document.body.classList.add('error')
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