let currentHash // 当前hash
let lastHash // 上一个hash
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
let hotEmitter = new EventEmitter()

;(function(modules) {
  // 存放缓存的模块
  var installedModules = {}
  function hotCheck() {
    // {"h": "", "c":{"main": true}}
    hotDownloadManifest().then(update => {
      let chunkIds = Object.keys(update.c) // ["main"]
      chunkIds.forEach(chunkId => {
        hotDownloadUpdateChunk(chunkId)
      })
      lastHash = currentHash
    }).catch(() => {
      window.location.reload()
    })
  }
  // 添加script
  function hotDownloadUpdateChunk(chunkId) {
    let script = document.createElement('script')
    script.src = `${chunkId}.${lastHash}.hot-update.js`
    document.head.appendChild(script)
  }
  window.webpackHotUpdate = function(chunkId, moreModules) {
    hotAddUpdateChunk(chunkId, moreModules)
  }
  let hotUpdate = {}
  function hotAddUpdateChunk(chunkId, moreModules) {
    for(let moduleId in moreModules) {
      modules[moduleId] = hotUpdate[moduleId] = moreModules[moduleId]
    }
    hotApply()
  }
  function hotApply() {
    for(let moduleId in hotUpdate) { // ./src/title.js
      let oldModule = installedModules[moduleId] // 老title.js模块
      delete installedModules[moduleId] // 删除
      // 循环它所依赖的父模块
      oldModule.parents.forEach(parentModule => {
        // 取出父模块上的回调，如果有就执行
        let cb = parentModule.hot._acceptedDependencies[moduleId]
        cb && cb()
      })
    }
  }
  // 请求json文件
  function hotDownloadManifest() {
    return new Promise(function(resolve, reject) {
      let xhr = new XMLHttpRequest()
      let url = `${lastHash}.hot-update.json`
      xhr.open('get', url)
      xhr.responseType = 'json'
      xhr.onload = function() {
        resolve(xhr.response)
      }
      xhr.send()
    })
  }
  function hotCreateModule() {
    let hot = {
      _acceptedDependencies: {},
      accept(deps, callback) {
        // hto._acceptedDependencies['./title.js'] = render
        deps.forEach(dep => hot._acceptedDependencies[dep] = callback)
      },
      check: hotCheck
    }
    return hot
  }
  // parentModuleId父模块ID
  function hotCreateRequire(parentModuleId) { // parentModuleId = ./src/index.js
    // 因为要加载子模块的时候，父模块肯定加载过了，可以从缓存中通过父模块的ID拿到父模块对象
    let parentModule = installedModules[parentModuleId] // ./src/index.js模块对象
    // 如果缓存里没有此父模块对象，说明这是一个顶级模块没有父级
    if(!parentModule) return __webpack_require__
    let hotRequire = function(childModuleId) { // ./src/title.js
      __webpack_require__(childModuleId) // 如果require过了，会把子模块对象放在缓存
      let childModule = installedModules[childModuleId] // 取出子模块对象
      childModule.parents.push(parentModule)
      parentModule.children.push(childModule) // 把此模块ID添加到父模块对象的children里
      console.log('childModule', childModule);
      return childModule.exports // 返回子模块的导出对象
    }
    return hotRequire
  }
  function __webpack_require__(moduleId) { // 
    if(installedModules[moduleId]) { // 如果缓存中有模块id，直接返回
      return installedModules[moduleId]
    }
    let module = installedModules[moduleId] =  {
      i: moduleId, // 模块ID，标识符
      l: false, // loaded是否已经加载
      exports: {}, // 导出对象
      hot: hotCreateModule(),
      parents: [], // 当前模块的父亲们
      children: [] // 当前模块的孩子们
    }
    // 执行模块代码，给module.exports赋值
    modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId))
    module.l = true // 表示已经加载过了
    console.info(modules, 9)
    return module.exports
  }
  __webpack_require__.c = installedModules
  return hotCreateRequire("./src/index.js")("./src/index.js")
  // return __webpack_require__("./src/index.js")
})(
{
  "./src/index.js": function(module, exports, __webpack_require__) {
    // 监听webpackHotUpdate消息
    __webpack_require__('webpack/hot/dev-server.js')
    // 连接websock服务器，如果服务器发给我hash就保存在currentHash里，如果服务器发送ok，我就发射webpackHotUpdate事件
    __webpack_require__('webpack-dev-server/client/index.js')
    let input = document.createElement('input')
    document.body.append(input)
    let div = document.createElement('div')
    document.body.append(div)
    let render = () => {
      let title = __webpack_require__("./src/title.js")
      div.innerHTML = title
    }
    render()
    if(module.hot) {
      module.hot.accept(["./src/title.js"], render)
    }
  },
  "./src/title.js": function(module, exports) {
    module.exports = "title"
  },
  "webpack-dev-server/client/index.js": function(module, exports) {
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
  },
  "webpack/hot/dev-server.js": function(module, exports) {
    hotEmitter.on('webpackHotUpdate', () => {
      console.info('hotCheck')
      if(!lastHash) { // 没有lastHash说明没上一次的编译结果，说明就是第一次渲染
        lastHash = currentHash
        console.log('lashHash',lastHash, 'currentHash', currentHash)
        return
      }
      console.log('lashHash',lastHash, 'currentHash', currentHash)
      module.hot.check()
    })
  },
})