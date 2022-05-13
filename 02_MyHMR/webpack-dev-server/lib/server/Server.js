
const express = require('express')
const http = require('http')

class Server {
  constructor(compiler) {
    this.compiler = compiler // 保存编译器对象
    this.setupApp()
    this.createServer()
  }
  setupApp() {
    this.app = express() // 得到http应用对象
  }
  createServer() {
    // 通过http模块创建一个普通的http服务器
    this.server = http.createServer(this.app)
  }
  listen(port, host, callback) {
    this.server.listen(port, host, callback)
  }
}

module.exports = Server