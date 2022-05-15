// 1.连接websocket服务器
// /socket.io/socket.io.js window.io赋值
let currentHash
class EventEmitter {
  constructor() {
    this.events = {}
  }
  on(eventName, fn) {
    this.events[eventName] = fn
  }
  emit(eventName, ...args) {
    this.events[eventName](...args)
  }
}
const hotEmitter = new EventEmitter()

const socket = window.io('/')
// 监听hash事件，保存此hash值
socket.on('hash', (hash) => {
  currentHash = hash
})
// 监听ok
socket.on('ok', () => {
  console.info('ok')
  reloadApp()
})

function reloadApp() {
  hotEmitter.emit('webpackHotUpdate')
}
